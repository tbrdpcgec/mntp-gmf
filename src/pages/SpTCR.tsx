import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import CustomSelect from '../components/CustomSelect';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { SPPDF } from '../components/SPPDF';

import { pdf } from '@react-pdf/renderer';

type Row = {
  id: string;
  [key: string]: any;
};

const SENT_BY_OPTIONS = ['WS1 TCR'];

const PACKED_BY_OPTIONS = [
  'PUJI ALIMIN/581856',
  'JERRY/PPC TCP-9',
  'SYAHRUL/PPC TCP-9',
  'RAKHI/PPC TCP-9',
  'AHMAD/PPC TCP-9',
  'JERRY/PPC TCP-9',
];

const TO_UNIT_OPTIONS = [
  'H1 LINE',
  'H2 LINE',
  'H3 LINE',
  'H4 LINE',
  'TVE',
  'NDT',
];

const LOC_DOC_OPTIONS = ['DOC ONLY', 'PART ONLY', 'DOC+PART'];

const columnWidths: Record<string, string> = {
  ac_reg: 'min-w-[0px]',
  description: 'min-w-[350px]',
  order: 'min-w-[0px]',
  doc_status: 'min-w-[30px]',
  status_job: 'min-w-[00px]',
  remark: 'min-w-[200px]',
  sp: 'min-w-[120px]',
  loc_doc: 'min-w-[0px]',
  date_out: 'min-w-[0px]',
  tracking_sp: 'min-w-[350px]',
};

const COLUMN_ORDER: { key: string; label: string }[] = [
  { key: 'no', label: 'No' },
  { key: 'ac_reg', label: 'A/C Reg' },
  { key: 'order', label: 'Order' },
  { key: 'description', label: 'Description' },
  { key: 'sp', label: 'No. SP' },
  { key: 'loc_doc', label: 'Remark SP' },
  { key: 'tracking_sp', label: 'Tracking SP' },
];

const STATUS_COLORS: Record<string, string> = {
  '': 'bg-gray-300',
  red: 'bg-red-500',
};

type ToggleProps = {
  value: boolean; // true jika ON (diklik ke kanan)
  onClick: () => void;
  color: string; // 'gray', 'red', 'yellow', 'green'
};

const ToggleSwitch: React.FC<ToggleProps> = ({ value, onClick, color }) => {
  const bgClass = value
    ? color === 'green'
      ? 'bg-green-500'
      : color === 'yellow'
      ? 'bg-yellow-400'
      : color === 'red'
      ? 'bg-red-500'
      : color === 'blue'
      ? 'bg-blue-500'
      : 'bg-gray-300'
    : 'bg-gray-300'; // ❗ OFF = selalu abu-abu

  return (
    <div
      onClick={onClick}
      className={`w-8 h-4 flex items-center rounded-full cursor-pointer p-0.5 transition-colors mx-auto ${bgClass}`}
    >
      <div
        className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
          value ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </div>
  );
};

const formatDateToDDMMMYYYY = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const FILTERED_PLNTWKCNTR = ['GAH4', 'WSSR'];

const sortOptions = [
  { value: 'ac_reg', label: 'A/C Reg' },
  { value: 'order', label: 'Order' },
  { value: 'description', label: 'Description' },
];

type OrderFilter = {
  value: string;
  valid: boolean;
};

export default function BUSH4() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcReg, setFilterAcReg] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [filterDocStatus, setFilterDocStatus] = useState('');
  const [filterStatusJob, setFilterStatusJob] = useState('');

  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCheckboxColumn, setShowCheckboxColumn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showOnlyChecked, setShowOnlyChecked] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filterOrders, setFilterOrders] = useState<string[]>([]);
  const [orderInput, setOrderInput] = useState('');
  const [orderSuggestions, setOrderSuggestions] = useState<string[]>([]);
  const [showOrderSuggestions, setShowOrderSuggestions] = useState(false);
  const [toField, setToField] = useState('');
  const [sentBy, setSentBy] = useState('');
  const [packedBy, setPackedBy] = useState('');
  const [receiver, setReceiver] = useState('');
  const [tempLocDoc, setTempLocDoc] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orderInput.trim() === '') {
      setOrderSuggestions([]);
      return;
    }

    const uniqueOrders = Array.from(new Set(rows.map((r) => String(r.order))));

    const filtered = uniqueOrders.filter((ord) =>
      ord.toLowerCase().includes(orderInput.toLowerCase())
    );

    setOrderSuggestions(filtered.slice(0, 10)); // batasi max 10
  }, [orderInput, rows]);

  const handleAddOrder = (order: string) => {
    const normalized = String(order).trim();
    if (normalized === '') return;

    const alreadyExist = filterOrders.some((o) => o.value === normalized);
    if (alreadyExist) return;

    // ✅ cek valid atau tidak
    const isValid = rows.some((r) => String(r.order) === normalized);

    setFilterOrders((prev) => [...prev, { value: normalized, valid: isValid }]);
    setOrderInput('');
    setShowOrderSuggestions(false);
  };

  const handleRemoveOrder = (order: string) => {
    setFilterOrders(filterOrders.filter((o) => o.value !== order));
  };

  // Ambil unique A/C Reg dari rows
  const uniqueAcRegs = [
    ...new Set(rows.map((r) => r.ac_reg).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  // Filter opsi berdasarkan input
  const filteredOptions = uniqueAcRegs.filter((reg) =>
    reg.toLowerCase().includes(filterAcReg.toLowerCase())
  );

  const confirmAction = (action: () => void) => {
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };

  const handleAction = async (action: 'copy' | 'download' | 'receiverOnly') => {
    if (selectedRows.length === 0) {
      setNotification('❗ No rows selected.');
      setShowMenu(false);
      return;
    }

    switch (action) {
      case 'copy':
        const selectedData = rows
          .filter((row) => selectedRows.includes(row.id))
          .map((row) => [
            row.ac_reg,
            row.order,
            row.description,
            row.doc_status,
            row.status_job,
            row.remark,
            row.loc_doc,
          ])
          .map((fields) => fields.join('\t'))
          .join('\n');

        navigator.clipboard
          .writeText(selectedData)
          .then(() => setNotification('✅ Data copied to clipboard!'))
          .catch(() => setNotification('❌ Failed to copy to clipboard.'));
        break;
      case 'download':
        try {
          const selectedDataForPDF = rows.filter((row) =>
            selectedRows.includes(row.id)
          );

          if (selectedDataForPDF.length === 0) {
            setNotification('⚠️ No rows selected.');
            return;
          }

          if (selectedDataForPDF.length > 15) {
            setNotification('⚠️ Maximum 15 rows allowed per PDF download.');
            setShowMenu(false);
            return;
          }

          // 1️⃣ Generate nomor SP baru
          const now = new Date();
          const formattedNoSP = `${String(now.getFullYear()).slice(2)}${String(
            now.getMonth() + 1
          ).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${String(
            now.getHours()
          ).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

          // 2️⃣ Ambil input dari UI
          const sent = sentBy?.trim() || '';
          const packed = packedBy?.trim() || '';
          const to = toField?.trim() || '';
          const recv = receiver?.trim() || '';

          // 3️⃣ Siapkan data update untuk tiap row
          const updatedRowsData = selectedDataForPDF.map((row) => {
            const locDoc = row.loc_doc || '';

            // cek apakah semua input UI kosong
            const isUIEmpty = !sent && !packed && !to && !recv;

            // bentuk format baru sesuai kondisi
            const newTracking = isUIEmpty
              ? `(${formattedNoSP}/${locDoc})` // jika UI kosong → pakai format pendek
              : `(${formattedNoSP}/${locDoc}) ${sent}/${packed} → ${to}/${recv}`; // jika UI ada → pakai format lengkap

            // gabungkan ke tracking_sp lama jika ada
            const tracking_sp = row.tracking_sp
              ? `${row.tracking_sp} // ${newTracking}`
              : newTracking;

            return {
              id: row.id,
              sp: formattedNoSP,
              tracking_sp,
            };
          });

          // 4️⃣ Update semua row di Supabase
          const updatePromises = updatedRowsData.map((item) =>
            supabase
              .from('mntp_tcr')
              .update({
                sp: item.sp,
                tracking_sp: item.tracking_sp,
              })
              .eq('id', item.id)
          );

          const results = await Promise.all(updatePromises);
          const hasError = results.some((res) => res.error);
          if (hasError) throw new Error('❌ One or more updates failed');

          // 5️⃣ Update tabel di UI langsung tanpa reload
          const newRows = rows.map((row) => {
            const updated = updatedRowsData.find((u) => u.id === row.id);
            return updated ? { ...row, ...updated } : row;
          });
          setRows(newRows);

          // 6️⃣ Generate PDF
          const blob = await pdf(
            <SPPDF
              data={selectedDataForPDF}
              spNumber={formattedNoSP}
              sentBy={sent}
              packedBy={packed}
              toUnit={to}
            />
          ).toBlob();

          // 7️⃣ Download otomatis
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SP_${formattedNoSP}.pdf`;
          a.click();
          URL.revokeObjectURL(url);

          // 8️⃣ Reset input form
          setSentBy('');
          setPackedBy('');
          setToField('');
          setReceiver('');

          // 9️⃣ Notifikasi sukses
          setNotification('✅ SP updated, tracking appended & PDF downloaded!');
        } catch (error) {
          console.error('SP-AJA creation failed:', error);
          setNotification('❌ Failed to create SP-AJA.');
        }
        break;
      case 'receiverOnly':
        try {
          const selectedData = rows.filter((row) =>
            selectedRows.includes(row.id)
          );

          if (selectedData.length === 0) {
            setNotification('⚠️ No rows selected.');
            return;
          }

          const recv = receiver?.trim() || '';

          if (!recv) {
            setNotification('⚠️ Receiver field is empty.');
            return;
          }

          // 🔄 Update tracking_sp tanpa "//"
          const updatedRowsData = selectedData.map((row) => {
            const trackingValue = row.tracking_sp
              ? `${row.tracking_sp} ${recv}`.trim()
              : recv;

            return { id: row.id, tracking_sp: trackingValue };
          });

          // Kirim ke Supabase (tanpa field receiver)
          const updatePromises = updatedRowsData.map((item) =>
            supabase
              .from('mntp_tcr')
              .update({ tracking_sp: item.tracking_sp })
              .eq('id', item.id)
          );

          const results = await Promise.all(updatePromises);
          const hasError = results.some((res) => res.error);
          if (hasError) throw new Error('Update failed');

          // Update lokal (tanpa refresh)
          const newRows = rows.map((row) => {
            const updated = updatedRowsData.find((u) => u.id === row.id);
            return updated ? { ...row, ...updated } : row;
          });
          setRows(newRows);

          // Kosongkan field receiver di UI
          setReceiver('');

          // ✅ Notifikasi sukses
          setNotification('✅ Receiver added to tracking successfully!');
        } catch (error) {
          console.error('Receiver add failed:', error);
          setNotification('❌ Failed to add receiver.');
        }
        break;
    }

    setShowMenu(false);
    setSelectedRows([]);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleActionWithConfirmation = (action: 'copy' | 'download') => {
    if (selectedRows.length === 0) {
      setNotification('❗ No rows selected.');
      setShowMenu(false);
      return;
    }

    const confirmMessages: Record<typeof action, string> = {
      copy: 'Are you sure you want to copy the selected rows?',
      download: 'Download selected rows as SP PDF?',
    };

    setPendingAction(() => () => handleAction(action));
    setConfirmMessage(confirmMessages[action]);
    setShowConfirmModal(true);
    setShowMenu(false);
  };

  useEffect(() => {
    if (notification) {
      const handleClickOutside = () => {
        setNotification(null);
      };

      // Tambahkan listener saat notifikasi muncul
      window.addEventListener('mousedown', handleClickOutside);

      // Bersihkan listener saat notifikasi hilang
      return () => {
        window.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [notification]);

  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let allRows: any[] = [];
      let from = 0;
      const limit = 1000;
      let moreData = true;

      while (moreData) {
        const { data, error } = await supabase
          .from('mntp_tcr')
          .select('*')
          .eq('archived', false)
          .order('date_in', { ascending: false })
          .range(from, from + limit - 1); // ambil per 1000

        if (error) {
          console.error('Error fetching data:', error);
          break;
        }

        if (data && data.length > 0) {
          allRows = [...allRows, ...data];
          from += limit;
          if (data.length < limit) {
            moreData = false; // sudah habis
          }
        } else {
          moreData = false;
        }
      }

      setRows(allRows);
    };

    fetchData();
  }, []);

  //editable kolom
  const handleChange = (id, key, value) => {
    setEditingValue((prev) => ({
      ...prev,
      [`${id}_${key}`]: value,
    }));
  };

  const handleBlur = (id, key) => {
    const value = editingValue[`${id}_${key}`];
    if (value !== undefined) {
      handleUpdate(id, key, value); // hanya update ke Supabase/state utama saat blur
    }
  };

  const handleUpdate = async (
    id: string,
    keyOrBulk: string,
    value?: string | Record<string, any>
  ) => {
    const updates: Record<string, any> =
      keyOrBulk === 'bulk'
        ? (value as Record<string, any>)
        : { [keyOrBulk]: value };

    const currentRow = rows.find((r) => r.id === id);
    if (currentRow) {
      // gabungkan row lama + update baru → simulatedRow
      let simulatedRow = { ...currentRow, ...updates };
    }

    // 🔹 Update ke Supabase
    const { error } = await supabase
      .from('mntp_tcr')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    }
  };

  const filteredRows = rows
    .filter((row) => {
      if (showOnlyChecked && !selectedRows.includes(row.id)) return false;

      // khusus filter order multiple
      const matchesOrder =
        filterOrders.length === 0 ||
        filterOrders.some((o) => o.value === String(row.order));

      const matchesSearch = Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesAcReg = filterAcReg === '' || row.ac_reg === filterAcReg;

      const matchesDocStatus =
        filterDocStatus === '' || row.doc_status === filterDocStatus;
      const matchesStatusJob =
        filterStatusJob === '' || row.status_job === filterStatusJob;
      const matchesPlntwkcntr = FILTERED_PLNTWKCNTR.includes(
        (row.plntwkcntr || '').toUpperCase()
      );

      return (
        matchesOrder &&
        matchesSearch &&
        matchesAcReg &&
        matchesDocStatus &&
        matchesStatusJob
      );
    })

    .sort((a, b) => {
      if (!sortKey) return 0;

      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';

      if (sortKey.includes('date')) {
        return sortDirection === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }

      if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
        return sortDirection === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-[#141414] w-full h-full">
      <div className="bg-[#292929] px-3 pt-3 pb-6 max-h-[100vh] overflow-hidden w-full rounded-lg">
        <div className="mb-2 flex items-start gap-2">
          {/* Kotak input + chips */}
          <div className="flex flex-wrap gap-1 border border-gray-500 rounded-md px-1 py-1 relative flex-1">
            {filterOrders.map((order) => (
              <span
                key={order.value}
                className={`flex items-center px-2 py-1 rounded-full text-xs ${
                  order.valid
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {order.value}
                <button
                  onClick={() => handleRemoveOrder(order.value)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </span>
            ))}

            <input
              type="text"
              value={orderInput}
              onChange={(e) => {
                setOrderInput(e.target.value);
                setShowOrderSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && orderInput.trim() !== '') {
                  handleAddOrder(orderInput.trim());
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text');
                const items = pasted
                  .split(/\s|,|\n/)
                  .map((s) => s.trim())
                  .filter((s) => s !== '');
                items.forEach((item) => handleAddOrder(item));
              }}
              placeholder="Type or paste order no..."
              className="bg-[#292929] text-white flex-1 text-[11px] rounded-md outline-none px-1"
            />

            {showOrderSuggestions && orderSuggestions.length > 0 && (
              <ul className="absolute left-0 top-full mt-1 w-full border rounded bg-white shadow max-h-40 overflow-y-auto text-xs z-20">
                {orderSuggestions.map((sug) => (
                  <li
                    key={sug}
                    onClick={() => handleAddOrder(sug)}
                    className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                  >
                    {sug}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-2 flex flex-wrap gap-1 items-center">
          <div className="flex items-center ml-0">
            <span className="text-xs font-medium"></span>
            <label className="relative inline-flex items-center cursor-pointer select-none w-11 h-5">
              <input
                type="checkbox"
                checked={showCheckboxColumn}
                onChange={() => setShowCheckboxColumn(!showCheckboxColumn)}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-500 rounded-full peer-checked:bg-blue-600 transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-[24px]" />
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-semibold opacity-0 peer-checked:opacity-100 transition-opacity duration-200">
                ON
              </span>
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-semibold opacity-100 peer-checked:opacity-0 transition-opacity duration-200">
                OFF
              </span>
            </label>
          </div>

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-500 bg-[#292929] text-white rounded-md px-1 py-1 text-[11px] hover:bg-gray-500 shadow flex-1"
          />

          <div className="relative w-[120px]">
            <input
              type="text"
              value={filterAcReg}
              onChange={(e) => {
                setFilterAcReg(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay untuk biar sempat klik
              placeholder="Filter A/C Reg"
              className="border border-gray-500 bg-[#292929] text-white rounded-md px-1 py-1 text-[11px] w-full shadow hover:bg-gray-500"
            />

            {showSuggestions && (
              <ul className="absolute z-50 bg-white border w-full max-h-40 overflow-y-auto text-[11px] shadow-md rounded">
                <li
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => setFilterAcReg('')}
                >
                  All A/C Reg
                </li>
                {filteredOptions.length === 0 && (
                  <li className="px-2 py-1 text-gray-400">No match</li>
                )}
                {filteredOptions.map((reg) => (
                  <li
                    key={reg}
                    className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => {
                      setFilterAcReg(reg);
                      setShowSuggestions(false);
                    }}
                  >
                    {reg}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => setShowOnlyChecked((prev) => !prev)}
            className="border border-gray-500 inline-flex justify-center rounded-md  shadow px-1 py-1 bg-[#292929] text-[11px] text-white font-normal  hover:bg-gray-500 w-[80px] "
          >
            {showOnlyChecked ? 'Checked Row' : 'All Row'}
          </button>

          <div className="flex items-center gap-1">
            {/* Dropdown Menu */}
            <div className="relative inline-block text-left ml-0 w-[80px]">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="border border-gray-500 inline-flex justify-center w-full rounded-md  shadow px-1.5 py-1 bg-[#292929] text-[11px] text-white font-normal  hover:bg-gray-500"
              >
                Actions
              </button>

              {showMenu && (
                <div className="absolute z-50 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-0 text-[11px]">
                    <button
                      onClick={() => handleAction('copy')}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CustomSelect
            value={filterStatusJob}
            onChange={(e) => setFilterStatusJob(e.target.value)}
            options={[
              { label: 'All Status Job', value: '' },
              { label: 'OPEN', value: 'OPEN' },
              { label: 'PROGRESS', value: 'PROGRESS' },
              { label: 'CLOSED', value: 'CLOSED' },
            ]}
            className="border border-gray-500 rounded-md px-1 py-1 text-[11px]  text-white font-normal hover:bg-gray-500 shadow w-[120px]"
          />
        </div>
        {/* 🔽 FIELD TAMBAHAN: hanya muncul kalau toggle ON */}
        {showCheckboxColumn && (
          <div className="flex flex-col gap-2 mb-2 mt-2 ml-0 text-[11px]">
            {/* Baris utama berisi dua kolom kiri-kanan */}
            <div className="flex flex-wrap gap-3">
              {/* 🔹 Kolom kiri: Sent By & Packed By */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-0 ml-0">
                  <div className="w-[70px] font-semibold text-blue-400">
                    Sent By
                  </div>
                  <div className="relative w-[200px]">
                    <input
                      type="text"
                      value={sentBy}
                      onChange={(e) => setSentBy(e.target.value)}
                      onBlur={() => handleUpdate(row.id, 'sent_by', sentBy)}
                      placeholder="Select or type the unit code..."
                      className="-ml-2 border px-1 py-0.5 rounded w-full"
                      list="sent_by_list"
                    />
                    <datalist id="sent_by_list">
                      {SENT_BY_OPTIONS.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex items-center gap-0">
                  <div className="w-[70px] text-blue-400 font-semibold">
                    Packed By
                  </div>
                  <div className="relative w-[200px]">
                    <input
                      type="text"
                      value={packedBy}
                      onChange={(e) => setPackedBy(e.target.value)}
                      onBlur={() => handleUpdate(row.id, 'packed_by', packedBy)}
                      placeholder="Select or type the personil name..."
                      className="-ml-2 border px-1 py-0.5 rounded w-full"
                      list="packed_by_list"
                    />
                    <datalist id="packed_by_list">
                      {PACKED_BY_OPTIONS.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* 🔹 Kolom kanan: To Unit & Receiver */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-0">
                  <div className="w-[70px] text-green-400 font-semibold">
                    To Unit
                  </div>
                  <div className="relative w-[200px]">
                    <input
                      type="text"
                      value={toField}
                      onChange={(e) => setToField(e.target.value)}
                      onBlur={() => handleUpdate(row.id, 'to_unit', toField)}
                      placeholder="Select or type the unit code..."
                      className="-ml-2 border px-1 py-0.5 rounded w-full"
                      list="to_unit_list"
                    />
                    <datalist id="to_unit_list">
                      {TO_UNIT_OPTIONS.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex items-center gap-0">
                  <div className="w-[70px] font-semibold text-green-400">
                    Receiver
                  </div>
                  <input
                    type="text"
                    placeholder="Type the personil name..."
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    className="-ml-2 border px-1 py-0.5 rounded w-[200px]"
                  />
                </div>
              </div>

              {/* 🔽 Tombol Download PDF di kanan To Unit */}
              <button
                onClick={() => handleActionWithConfirmation('download')}
                className="px-2 py-[3px] bg-blue-600 text-white rounded text-[11px] hover:bg-blue-700 shadow-sm"
              >
                📄 CREATE SP-AJA
              </button>

              <button
                onClick={() => handleActionWithConfirmation('receiverOnly')}
                className="px-2 py-[3px] bg-green-600 text-white rounded text-[11px] hover:bg-green-700 shadow-sm"
              >
                ➕ ADD RECEIVER
              </button>
            </div>
          </div>
        )}

        {/* 🧊 Ini pembungkus baru untuk freeze header */}
        <div className="w-full overflow-auto max-h-[70vh] border border-gray-300 rounded shadow-inner">
          <table className="w-full whitespace-nowrap table-auto text-[11px] leading-tight">
            <thead className="sticky top-0 z-10 bg-white shadow">
              <tr className="bg-[#00919f] text-white text-xs font-semibold text-center">
                {/* ✅ Tampilkan checkbox hanya jika showCheckboxColumn true */}
                {showCheckboxColumn && (
                  <th className="border px-1 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === filteredRows.length &&
                        filteredRows.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(filteredRows.map((r) => r.id));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                    />
                  </th>
                )}

                {COLUMN_ORDER.map((col) => (
                  <th key={col.key} className="border px-1 py-1 text-center">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {showCheckboxColumn && (
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                      />
                    </td>
                  )}

                  {COLUMN_ORDER.map(({ key }) => (
                    <td
                      key={key}
                      className={`border px-1 py-1 ${columnWidths[key] || ''} ${
                        key === 'description'
                          ? 'text-left  break-words whitespace-normal'
                          : 'text-center'
                      }`}
                    >
                      {key === 'status_job' ? (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded
      ${
        row.status_job === 'OPEN'
          ? 'bg-red-500 text-white'
          : row.status_job === 'PROGRESS'
          ? 'bg-yellow-500 text-white'
          : row.status_job === 'CLOSED'
          ? 'bg-green-500 text-white'
          : ''
      }`}
                        >
                          {row.status_job || '-'}
                        </span>
                      ) : key === 'no' ? (
                        (currentPage - 1) * rowsPerPage + rowIndex + 1
                      ) : key === 'description' ||
                        key === 'ac_reg' ||
                        key === 'tracking_sp' ||
                        key === 'sp' ? (
                        editingCell?.id === row.id &&
                        editingCell?.field === key ? (
                          <input
                            type="text"
                            value={row[key] || ''}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, [key]: e.target.value }
                                    : r
                                )
                              )
                            }
                            onBlur={() => {
                              handleUpdate(row.id, key, row[key] || '');
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdate(row.id, key, row[key] || '');
                                setEditingCell(null);
                              }
                            }}
                            autoFocus
                            className="border px-0.5 py-0.5 rounded w-full text-[11px]]"
                          />
                        ) : (
                          <div
                            className="w-full text-left break-words whitespace-normal"
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setEditingCell({ id: row.id, field: key });
                            }}
                            title="Klik kanan untuk edit"
                          >
                            {row[key]}
                          </div>
                        )
                      ) : key === 'loc_doc' ? (
                        <div className="relative w-[200px]">
                          <input
                            type="text"
                            value={tempLocDoc[row.id] ?? row[key] ?? ''}
                            onChange={(e) =>
                              setTempLocDoc((prev) => ({
                                ...prev,
                                [row.id]: e.target.value,
                              }))
                            }
                            onBlur={() => {
                              handleUpdate(
                                row.id,
                                key,
                                tempLocDoc[row.id] ?? ''
                              );
                              // tetap simpan value, jangan reset temp
                            }}
                            placeholder="Select or type..."
                            className="border rounded px-1 py-0.5 text-[11px] w-full"
                            list={`loc_doc_list_${row.id}`}
                          />
                          <datalist id={`loc_doc_list_${row.id}`}>
                            {LOC_DOC_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </div>
                      ) : (
                        String(row[key] ?? '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {notification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white px-6 py-4 rounded shadow-lg text-center text-gray-800 text-sm">
                {notification}
              </div>
            </div>
          )}

          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
                <p className="mb-4">{confirmMessage}</p>{' '}
                {/* ← tampilkan pesan dinamis */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setShowConfirmModal(false);
                      if (pendingAction) {
                        await pendingAction(); // jalankan aksi
                        setPendingAction(null);
                        setSelectedRows([]); // kosongkan ceklis
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-start mt-2 text-[11px] items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-0.5 rounded border bg-white text-black hover:bg-gray-50 shadow"
          >
            ◁ Prev
          </button>

          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-0.5 rounded border bg-white text-black hover:bg-gray-50 shadow"
          >
            Next ▷
          </button>

          {/* Tambahan: total data */}
          <span className="text-white ml-2 text-[11px]">
            • Total {rows.length} data
          </span>
        </div>
      </div>
    </div>
  );
}

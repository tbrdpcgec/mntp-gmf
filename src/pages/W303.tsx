// src/pages/W303.tsx
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import W303PDF from '../components/W303PDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CustomSelect from '../components/CustomSelect';

import { pdf } from '@react-pdf/renderer';
function DownloadPDFButton({ pdfData, shift, filterReportOnly }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    setShowConfirm(false);

    const doc = <W303PDF data={pdfData} />;

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `E-HOB MANTAP MACHINING TCR ${pdfData.date} ${shift}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (!filterReportOnly) {
            alert('Aktifkan Togle Report (ON) terlebih dahulu.');
            return;
          }

          setShowConfirm(true);
        }}
        className={`text-white text-[11px] px-2 py-1 rounded shadow ${
          filterReportOnly
            ? 'bg-[#d54336] hover:bg-[#aa0e00]'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Download PDF
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl text-center space-y-4">
            <h2 className="text-gray-800 text-lg font-semibold">Konfirmasi</h2>

            <p className="text-gray-800">
              Please ensure that all data has been entered accurately.
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Ok, Gass!
              </button>

              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const supervisorList = [
  '529554 / ACEP ROHENDI',
  '581173 / ANDI',

  '580116 / MOCHAMAD ALIMIN ULAMA',
  '581174 / ADE DARMAWAN',
  '580993 / ARIF RAHMAN B',
  '581239 / LATIF SETIAWAN',
  '583334 / MUHAMMAD SAMSUL S',
];

const crewOptions = [
  'CREW A',
  'CREW B',
  'CREW MINI',
  'CREW A (OVT)',
  'CREW B (OVT)',
];
const shiftOptions = ['MORNING SHIFT', 'AFTERNOON SHIFT', 'NIGHT SHIFT'];
const timeOptions = [
  '06.00 AM',
  '08.00 AM',
  '02.00 PM',
  '03.00 PM',
  '10.00 PM',
];
const managerOptions = ['580630 / ARIE SUTRISNO'];

const columnWidths: Record<string, string> = {
  ac_reg: 'min-w-[70px]',
  order: 'min-w-[80px]',
  description: 'min-w-[300px]',
  location: 'min-w-[80px]',
  doc_type: 'min-w-[40px]',
  date_in: 'min-w-[0px]',
  priority: 'min-w-[50px]',
  doc_status: 'min-w-[100px]',
  remark: 'min-w-[150px]',
  status_mw: 'min-w-[90px]',
  remark_mw: 'min-w-[250px]',
  handle_by_mw: 'min-w-[90px]',
  date_closed_mw: 'min-w-[80px]',
  report_mw: 'min-w-[0px]',
  archive_mw: 'min-w-[50px]',
  est_date: 'min-w-[100px]',
};

const COLUMN_ORDER = [
  { key: 'no', label: 'No' },
  { key: 'report_mw', label: 'Report' },
  { key: 'ac_reg', label: 'A/C Reg' },
  { key: 'order', label: 'Order' },
  { key: 'description', label: 'Description' },

  { key: 'doc_type', label: 'Doc' },
  { key: 'location', label: 'Item' },
  { key: 'doc_status', label: 'Doc Status' },

  { key: 'remark', label: 'Remark PE' },
  { key: 'priority', label: 'Priority' },
  { key: 'opr', label: 'Mhrs' },
  { key: 'status_mw', label: 'Status' },

  { key: 'est_date', label: 'Plan FSB' },
  { key: 'remark_mw', label: 'Remark' },
  { key: 'handle_by_mw', label: 'Handle by' },
  { key: 'date_closed_mw', label: 'Date Closed' },
  { key: 'archive_mw', label: 'Archived' },
];

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

const sortOptions = [
  { value: 'report_mw', label: 'Report' },
  { value: 'ac_reg', label: 'A/C Reg' },
  { value: 'order', label: 'Order' },
  { value: 'description', label: 'Description' },
  { value: 'location', label: 'Item' },
  { value: 'priority', label: 'Priority' },
  { value: 'doc_type', label: 'Doc Type' },
  { value: 'date_in', label: 'Date In' },
  { value: 'doc_status', label: 'Doc Status' },
  { value: 'status_mw', label: 'Status' },
];

const REMARK_OPTIONS: string[] = [
  'WAITING MATERIAL',
  'WAITING DECISION',
  'HOLD',
];

const HANDLE_BY_OPTIONS: string[] = [
  'ACEP',
  'ANDI',
  'ARIE',
  'ALIMIN',
  'ARIF',
  'ADE',
  'LATIF',
  'SAMSUL',
  'ROFIQ',
];

export default function W303() {
  const [rows, setRows] = useState<any[]>([]);
  const [supervisorOut, setSupervisorOut] = useState('');
  const [managerOut, setManagerOut] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [crewOut, setCrewOut] = useState('');
  const [shiftOut, setShiftOut] = useState('');
  const [crewIn, setCrewIn] = useState('');
  const [shiftIn, setShiftIn] = useState('');
  const [supervisorIn, setSupervisorIn] = useState('');
  const [managerIn, setManagerIn] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [filterReportOnly, setFilterReportOnly] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterAcReg, setFilterAcReg] = useState('');
  const [tempRemark, setTempRemark] = useState<Record<string, string>>({});
  const [tempHandleBy, setTempHandleBy] = useState<Record<string, string>>({});

  const [showDailyReport, setShowDailyReport] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [showArchivedMW, setShowArchivedMW] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);

  const [tempValue, setTempValue] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [showPDFDownload, setShowPDFDownload] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<() => void>(
    () => () => {}
  );

  const pdfLinkRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  // filter ac reg
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Ambil unique A/C Reg dari rows
  const uniqueAcRegs = [
    ...new Set(rows.map((r) => r.ac_reg).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  // Filter opsi berdasarkan input
  const filteredOptions = uniqueAcRegs.filter((reg) =>
    reg.toLowerCase().includes(filterAcReg.toLowerCase())
  );
  //////

  const filteredRows = rows.filter((row) => {
    const status = row.status_mw || '';

    const matchesAcReg = row.ac_reg
      ?.toLowerCase()
      .includes(filterAcReg.toLowerCase());

    const matchesStatus =
      filterStatus === 'All Status'
        ? true
        : filterStatus === 'NO STATUS'
        ? status === ''
        : status === filterStatus;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      row.ac_reg?.toLowerCase().includes(searchLower) ||
      row.order?.toString().toLowerCase().includes(searchLower) || // ✅ fix disini
      row.description?.toLowerCase().includes(searchLower) ||
      row.location?.toLowerCase().includes(searchLower);

    return matchesAcReg && matchesStatus && matchesSearch;
  });

  const sortedFilteredRows = [...filteredRows].sort((a, b) => {
    if (!sortKey) return 0;

    let aValue = a[sortKey] || '';
    let bValue = b[sortKey] || '';

    /// PRIORITY CUSTOM SORT
    if (sortKey === 'priority') {
      const priorityOrder: Record<string, number> = {
        'High-1': 1,
        'High-2': 2,
        'High-3': 3,
        'High-4': 4,
        'High-5': 5,
        'High-6': 6,
        'High-7': 7,
        'High-8': 8,
        'High-9': 9,
        'High-10': 10,
        Med: 11,
        '': 999,
      };

      const aRank = priorityOrder[String(aValue)] ?? 999;
      const bRank = priorityOrder[String(bValue)] ?? 999;

      return sortDirection === 'asc' ? aRank - bRank : bRank - aRank;
    }

    /// NUMBER SORT
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    /// STRING SORT
    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // copy: hilang saat user klik di luar
  useEffect(() => {
    if (notification) {
      const handleClickOutside = () => {
        setNotification(null);
      };
      window.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [notification]);

  {
    /* useeffect page/filter */
  }
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

      // 🔴 FILTER UTAMA TCR-1
      let filtered = allRows.filter((r) => r.cek_mw === 'red');

      // 🔴 archive_MW filter pakai toggle
      if (!showArchivedMW) {
        filtered = filtered.filter(
          (r) => r.archive_mw === '' || r.archive_mw === null
        );
      }
      const filteredReport = filterReportOnly
        ? filtered.filter(
            (r) =>
              r.report_mw === true ||
              r.report_mw === '1' ||
              r.report_mw === 'checked'
          )
        : filtered;

      setRows(filteredReport);
      setFilteredData(filteredReport);
    };

    fetchData();
  }, [filterReportOnly, showArchivedMW]);

  console.log('filteredRows:', filteredRows);

  const pdfItems = filteredData.map((item, index) => ({
    no: index + 1,
    reference: item.order,
    acReg: item.ac_reg || '',
    description: item.description || '',
    remark: item.remark_mw || '',
    status: item.status_mw?.toUpperCase() || '',
  }));

  const handleUpdate = async (id: string, key: string, value: any) => {
    const updates: Record<string, any> = { [key]: value };

    if (key === 'status_mw' && value === 'CLOSED') {
      updates['date_closed_mw'] = formatDateToDDMMMYYYY(new Date());
    }

    const { error } = await supabase
      .from('mntp_tcr')
      .update(updates)
      .eq('id', id);
    if (error) {
      console.error('Update error:', error);
    } else {
      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
      );
    }
  };

  const generateWhatsAppMessage = ({
    shiftType,
    totalOrder,
    totalOpen,
    totalProgress,
    totalClosed,
    orders,
    supervisor,
    crew,
  }: {
    shiftType: string;
    totalOrder: number;
    totalOpen: number;
    totalProgress: number;
    totalClosed: number;

    orders: {
      ac_reg: string;
      order: string;
      description: string;
      status: string;
      remark: string;
      priority: string;
    }[];

    supervisor: string;
    crew: string;
  }) => {
    const today = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const header =
      `*DAILY WORKLOAD REPORT*\n` +
      `*MACHINING*\n` +
      `TCR-5 | ${shiftType}\n` +
      `${today}`;

    const summary =
      `\n\n*TOTAL : ${totalOrder} ORDER*` +
      `\n${totalOpen} OPEN | ${totalProgress} PROGRESS | ${totalClosed} CLOSED`;

    const detail = orders
      .map(
        (o, i) =>
          `\n\n${i + 1}. ${o.ac_reg}` +
          `\n${o.order}` +
          `\n${o.description}` +
          `\n${o.status}` +
          `\n${o.remark || ''}` +
          `\n${o.priority || ''}`
      )
      .join('');

    const closing = `\n\n*BEST REGARDS*` + `\n${supervisor}` + `\n${crew}`;

    return `${header}${summary}${detail}${closing}`;
  };

  const formattedDate = formatDateToDDMMMYYYY(new Date()); // hasil: 26 Jul 2025
  const shift = shiftOut || ' ';

  const pdfData = {
    date: formattedDate,
    acReg: 'N/A',

    crewOut: crewOut || ' ',
    shiftOut: shiftOut || ' ',
    supervisorOut: supervisorOut || ' ',
    managerOut: managerOut || ' ',
    timeOut: timeOut || ' ',

    crewIn: crewIn || ' ',
    shiftIn: shiftIn || ' ',
    supervisorIn: supervisorIn || ' ',
    managerIn: managerIn || ' ',
    timeIn: timeIn || ' ',

    inspection: 'N/A',
    woNumber: 'N/A',
    hangarIn: 'N/A',
    hangarOut: 'N/A',

    items: Array.isArray(pdfItems) ? pdfItems : [],
  };

  {
    /* page */
  }
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const paginatedRows = sortedFilteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-[#141414] h-full w-full">
      <div className="bg-[#292929] px-3 pt-2 pb-6 max-h-[100vh] overflow-y-auto w-full rounded-lg">
        <div className="mb-2 flex flex-wrap gap-1 items-center">
          {/* Semua datalist */}
          <datalist id="supervisorList">
            {supervisorList.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <datalist id="crewOptions">
            {crewOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <datalist id="shiftOptions">
            {shiftOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <datalist id="timeOptions">
            {timeOptions.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <datalist id="managerOptions">
            {managerOptions.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>

          {/* 🔍 Filter + Sort + WhatsApp Row */}
          <div className="flex flex-wrap items-center gap-1 text-xs mt-1 mb-1">
            {/* Toggle Check Report */}
            <div className="flex items-center ml-0">
              <span className="text-xs font-medium"></span>
              <label className="relative inline-flex items-center cursor-pointer select-none w-11 h-5">
                <input
                  type="checkbox"
                  checked={filterReportOnly}
                  onChange={() => setFilterReportOnly(!filterReportOnly)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-600 rounded-full peer-checked:bg-blue-600 transition-colors duration-200" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-[24px]" />
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-semibold opacity-0 peer-checked:opacity-100 transition-opacity duration-200">
                  ON
                </span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-semibold opacity-100 peer-checked:opacity-0 transition-opacity duration-200">
                  OFF
                </span>
              </label>
            </div>

            {/* Kiri: Filter + Sort */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button
              title="Daily Report Whatsapp and HOB"
                onClick={() => setShowDailyReport(true)}
                className="bg-[#00707A] hover:bg-[#005b63] text-white text-[11px] px-2 py-1 rounded shadow"
              >
                Daily Report
              </button>

              {/* Tombol Copy */}
              <button
              title="Copy your Data"
                onClick={() => {
                  const clean = (val: any) =>
                    (val || '')
                      .toString()
                      .replace(/\r?\n|\r/g, ' ') // hapus newline
                      .replace(/\t/g, ' ') // hapus tab
                      .trim();

                  const selectedData = rows
                    .filter(
                      (row) =>
                        row.report_mw === true ||
                        row.report_mw === '1' ||
                        row.report_mw === 'checked'
                    )
                    .map((row) => [
                      clean(row.doc_type),
                      clean(row.ac_reg),
                      clean(row.order),
                      clean(row.description),
                      clean(row.handle_by_mw),
                      clean(row.status_mw),
                      clean(row.remark_mw),
                    ])
                    .map((fields) => fields.join('\t'))
                    .join('\n');

                  if (!selectedData) {
                    setNotification('❗ No rows selected.');
                    return;
                  }

                  navigator.clipboard
                    .writeText(selectedData)
                    .then(() => setNotification('✅ Data copied to clipboard!'))
                    .catch(() =>
                      setNotification('❌ Failed to copy to clipboard.')
                    );
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] px-2 py-1 rounded shadow"
              >
                Copy
              </button>

              <button
                onClick={() => setShowArchivedMW((prev) => !prev)}
                className={`px-2 py-1 text-[11px] rounded border shadow
    ${
      showArchivedMW
        ? 'bg-gray-700 text-yellow-300 border-gray-500'
        : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
    }
  `}
              >
                {showArchivedMW ? 'Hide Archived' : 'Show Archived'}
              </button>

              {/* 🔎 Search */}
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-500 bg-[#292929] text-white rounded-md px-1 py-1 text-[11px] hover:bg-gray-500 shadow flex-1"
              />

              {/* ✈️ Filter A/C REG */}

              <div className="relative w-[90px]">
                <input
                  type="text"
                  value={filterAcReg}
                  onChange={(e) => {
                    setFilterAcReg(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  } // Delay untuk biar sempat klik
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

              {/* 🔧 Filter Status */}
              <CustomSelect
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: 'All Status', value: 'All Status' },
                  { label: 'OPEN', value: 'OPEN' },
                  { label: 'PROGRESS', value: 'PROGRESS' },
                  { label: 'CLOSED', value: 'CLOSED' },
                  { label: 'NO STATUS', value: 'NO STATUS' },
                ]}
                className="border border-gray-500 rounded-md px-1 py-1 text-[11px] text-white font-normal hover:bg-gray-500 hover:border-gray-500 shadow w-[120px]"
              />

              {/* 🧭 Sort Dropdown */}
              <CustomSelect
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                options={[
                  { label: 'Sort by...', value: '' },
                  ...sortOptions.map(({ value, label }) => ({
                    value,
                    label,
                  })),
                ]}
                className="border border-gray-500 rounded-md px-1 py-1 text-[11px] text-white font-normal hover:bg-gray-500 hover:border-gray-500 shadow w-[130px]"
              />

              <CustomSelect
                value={sortDirection}
                onChange={(e) =>
                  setSortDirection(e.target.value as 'asc' | 'desc')
                }
                options={[
                  { label: 'A-Z', value: 'asc' },
                  { label: 'Z-A', value: 'desc' },
                ]}
                className="border border-gray-500 rounded-md px-1 py-1 text-[11px] text-white font-normal hover:bg-gray-500 hover:border-gray-500 shadow w-[80px]"
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-auto max-h-[70vh] rounded-md shadow-inner dark-scroll">
          <table className=" w-full table-auto text-[11px] leading-tight border-collapse">
            <thead className="sticky top-0 z-10 bg-teal-700 shadow">
              <tr className="bg-[#00919f] text-white text-xs font-semibold text-center border-b border-white/30">
                {COLUMN_ORDER.map((col) => (
                  <th
                    key={col.key}
                    className=" px-1 py-1 text-center border-l border-[#141414]"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={` text-white ${
                    rowIndex % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#292929]'
                  }
      border-b border-white/30 `}
                >
                  {COLUMN_ORDER.map(({ key }) => (
                    <td
                      key={key}
                      className={` px-1 py-1 border-l border-[#141414] ${
                        columnWidths[key] || ''
                      } ${
                        key === 'description' ||
                        key === 'remark' ||
                        key === 'doc_status'
                          ? 'text-left break-words whitespace-normal'
                          : 'text-center'
                      }`}
                    >
                      {key === 'no' ? (
                        (currentPage - 1) * rowsPerPage + rowIndex + 1
                      ) : key === 'date_in' || key === 'date_closed_mw' ? (
                        row[key] ? (
                          new Date(row[key]).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          ''
                        )
                      ) : key === 'report_mw' ? (
                        <input
                          type="checkbox"
                          checked={
                            row[key] === true ||
                            row[key] === '1' ||
                            row[key] === 'checked'
                          }
                          onChange={(e) =>
                            handleUpdate(
                              row.id,
                              key,
                              e.target.checked ? 'checked' : ''
                            )
                          }
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      ) : key === 'priority' ? (
                        <CustomSelect
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          options={[
                            { label: '', value: '' },

                            { label: 'Med', value: 'Med' },

                            { label: 'High-1', value: 'High-1' },
                            { label: 'High-2', value: 'High-2' },
                            { label: 'High-3', value: 'High-3' },
                            { label: 'High-4', value: 'High-4' },
                            { label: 'High-5', value: 'High-5' },
                            { label: 'High-6', value: 'High-6' },
                            { label: 'High-7', value: 'High-7' },
                            { label: 'High-8', value: 'High-8' },
                            { label: 'High-9', value: 'High-9' },
                            { label: 'High-10', value: 'High-10' },
                          ]}
                          className={`border border-transparent rounded px-0.5 py-0.5 text-[11px] font-normal ${
                            String(row[key] || '').startsWith('High')
                              ? 'bg-red-500 text-white'
                              : row[key] === 'Med'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-transparent text-white'
                          }`}
                        />
                      ) : key === 'status_mw' ? (
                        <CustomSelect
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          options={[
                            { label: '', value: '' },
                            { label: 'OPEN', value: 'OPEN' },
                            { label: 'PROGRESS', value: 'PROGRESS' },
                            { label: 'CLOSED', value: 'CLOSED' },
                          ]}
                          className={`border border-transparent rounded-md px-0.5 py-0.5 w-full
                            text-[11px] text-left font-normal
                            transition-all duration-300 ease-in-out
                              ${
                                row[key] === 'OPEN'
                                  ? 'bg-red-500'
                                  : row[key] === 'PROGRESS'
                                  ? 'bg-yellow-500'
                                  : row[key] === 'CLOSED'
                                  ? 'bg-green-500'
                                  : 'bg-transparent text-gray-200'
                              }
                            `}
                        />
                      ) : key === 'est_date' ? (
                        <input
                          type="date"
                          value={row.est_date ?? ''}
                          onChange={(e) =>
                            handleUpdate(
                              row.id,
                              'est_date',
                              e.target.value || null
                            )
                          }
                          className={`
                            border border-transparent rounded-md px-0.5 py-0.5 text-[11px]
                            bg-transparent hover:border-teal-500
                            ${row.est_date ? 'text-white' : 'text-transparent'}
                            [&::-webkit-calendar-picker-indicator]:invert
                          `}
                        />
                      ) : key === 'remark_mw' ? (
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={tempRemark[row.id] ?? row[key] ?? ''}
                            onChange={(e) =>
                              setTempRemark((prev) => ({
                                ...prev,
                                [row.id]: e.target.value,
                              }))
                            }
                            onBlur={() =>
                              handleUpdate(
                                row.id,
                                key,
                                tempRemark[row.id] ?? ''
                              )
                            }
                            placeholder=" "
                            list={`remark_list_${row.id}`}
                            className="
                            border border-transparent
                            hover:border-teal-500
                                  bg-transparent
                                  px-1 py-0.5
                                  rounded-md
                                  w-full
                                  text-[11px]
                                  text-left
                                  break-words
                                  whitespace-normal
                                  focus:outline-none
                                  focus:ring-1
                                  focus:ring-teal-500
                                "
                          />

                          <datalist id={`remark_list_${row.id}`}>
                            {REMARK_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </div>
                      ) : key === 'opr' ? (
                        editingCell?.id === row.id &&
                        editingCell?.field === key ? (
                          <input
                            type="text"
                            value={String(tempValue ?? '')}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => {
                              handleUpdate(row.id, key, tempValue);

                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, [key]: tempValue }
                                    : r
                                )
                              );

                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdate(row.id, key, tempValue);

                                setRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, [key]: tempValue }
                                      : r
                                  )
                                );

                                setEditingCell(null);
                              }

                              if (e.key === 'Escape') {
                                setEditingCell(null);
                              }
                            }}
                            autoFocus
                            className="
                                w-full
                                max-w-[100px]
                                bg-transparent
                                px-1 py-0.5
                                text-[11px]
                                text-white
                                rounded-md
                                border
                                text-left
                                break-words
                                whitespace-normal
                                border-teal-500
                                focus:outline-none
                                focus:ring-1
                                focus:ring-teal-500
                              "
                          />
                        ) : (
                          <div
                            onDoubleClick={() => {
                              setEditingCell({
                                id: row.id,
                                field: key,
                              });

                              setTempValue(String(row[key] ?? ''));
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();

                              setEditingCell({
                                id: row.id,
                                field: key,
                              });

                              setTempValue(String(row[key] ?? ''));
                            }}
                            title="Double click to edit"
                            className="
                                w-full
                                px-1
                                py-2
                                cursor-text
                                text-left
                                break-words
                                whitespace-normal
                                border
                                border-transparent
                                rounded-md
                                hover:border-teal-500
                              "
                          >
                            <span className="block text-white">
                              {String(row[key] ?? '')}
                            </span>
                          </div>
                        )
                      ) : key === 'handle_by_mw' ? (
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={tempHandleBy[row.id] ?? row[key] ?? ''}
                            onChange={(e) =>
                              setTempHandleBy((prev) => ({
                                ...prev,
                                [row.id]: e.target.value,
                              }))
                            }
                            onBlur={() =>
                              handleUpdate(
                                row.id,
                                key,
                                tempHandleBy[row.id] ?? ''
                              )
                            }
                            list={`handle_by_list_${row.id}`}
                            className="
                            
                            border border-transparent
                            hover:border-teal-500
                                  bg-transparent
                                  px-1 py-0.5
                                  rounded-md
                                  w-full
                                  text-[11px]
                                  focus:outline-none
                                  focus:ring-1
                                  focus:ring-teal-500
                                "
                          />

                          <datalist id={`handle_by_list_${row.id}`}>
                            {HANDLE_BY_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </div>
                      ) : key === 'archive_mw' ? (
                        <CustomSelect
                          value={row[key] || ''}
                          onChange={(e) =>
                            handleUpdate(row.id, key, e.target.value)
                          }
                          options={[
                            { label: '', value: '' },
                            { label: 'YES', value: 'YES' },
                          ]}
                          className={` rounded px-1 py-0.5 text-xs w-full
                                ${
                                  row[key] === 'YES'
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-transparent text-white'
                                }
                              `}
                        />
                      ) : (
                        row[key] ?? ''
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
        </div>
        {/* tombol page */}
        <div className="flex justify-start text-white mt-2 text-[11px] items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-0.5 rounded border border-gray-500 bg-[#212121] text-white hover:bg-gray-500 shadow"
          >
            ◁ Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-0.5 rounded border border-gray-500 bg-[#212121] text-white hover:bg-gray-500 shadow"
          >
            Next ▷
          </button>
        </div>
      </div>

      {showDailyReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1b1b1b] border border-gray-700 rounded-xl p-4 w-[95%] max-w-[950px] text-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">DAILY REPORT</h2>

              <button
                onClick={() => setShowDailyReport(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* DATALIST */}
            <datalist id="supervisorList">
              {supervisorList.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>

            <datalist id="crewOptions">
              {crewOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <datalist id="shiftOptions">
              {shiftOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>

            <datalist id="timeOptions">
              {timeOptions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>

            <datalist id="managerOptions">
              {managerOptions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>

            {/* SHIFT OUT */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold mb-1 text-cyan-400">
                SHIFT OUT
              </div>

              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  list="supervisorList"
                  placeholder="Supervisor Out"
                  value={supervisorOut}
                  onChange={(e) => setSupervisorOut(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="crewOptions"
                  placeholder="Crew Out"
                  value={crewOut}
                  onChange={(e) => setCrewOut(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="shiftOptions"
                  placeholder="Shift Out"
                  value={shiftOut}
                  onChange={(e) => setShiftOut(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="timeOptions"
                  placeholder="Time Out"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="managerOptions"
                  placeholder="Manager Out"
                  value={managerOut}
                  onChange={(e) => setManagerOut(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />
              </div>
            </div>

            {/* SHIFT IN */}
            <div className="mb-4">
              <div className="text-[11px] font-semibold mb-1 text-green-400">
                SHIFT IN
              </div>

              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  list="supervisorList"
                  placeholder="Supervisor In"
                  value={supervisorIn}
                  onChange={(e) => setSupervisorIn(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="crewOptions"
                  placeholder="Crew In"
                  value={crewIn}
                  onChange={(e) => setCrewIn(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="shiftOptions"
                  placeholder="Shift In"
                  value={shiftIn}
                  onChange={(e) => setShiftIn(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="timeOptions"
                  placeholder="Time In"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />

                <input
                  type="text"
                  list="managerOptions"
                  placeholder="Manager In"
                  value={managerIn}
                  onChange={(e) => setManagerIn(e.target.value)}
                  className="bg-[#111] border border-gray-600 px-2 py-1 rounded text-[11px]"
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex items-center justify-end gap-2">
              {/* WHATSAPP */}
              <button
                onClick={() => {
                  const filtered = rows.filter(
                    (r) =>
                      r.report_mw === true ||
                      r.report_mw === '1' ||
                      r.report_mw === 'checked'
                  );

                  if (filtered.length === 0) {
                    alert('Tidak ada data yang dicentang.');
                    return;
                  }

                  const totalOrder = filtered.length;

                  const totalOpen = filtered.filter(
                    (r) => r.status_mw === 'OPEN'
                  ).length;

                  const totalProgress = filtered.filter(
                    (r) => r.status_mw === 'PROGRESS'
                  ).length;

                  const totalClosed = filtered.filter(
                    (r) => r.status_mw === 'CLOSED'
                  ).length;

                  const message = generateWhatsAppMessage({
                    shiftType: shiftOut,
                    totalOrder,
                    totalOpen,
                    totalProgress,
                    totalClosed,
                    orders: filtered.map((r) => ({
                      ac_reg: r.ac_reg || '',
                      order: r.order || '',
                      description: r.description || '',
                      status: r.status_mw || '',
                      remark: r.remark_mw || '',
                    })),
                    supervisor: supervisorOut,
                    crew: crewOut,
                  });

                  const encoded = encodeURIComponent(message);

                  window.open(
                    `https://api.whatsapp.com/send?text=${encoded}`,
                    '_blank'
                  );
                }}
                className="bg-green-600 hover:bg-green-700 text-white text-[11px] px-3 py-1 rounded"
              >
                Send WhatsApp
              </button>

              {/* PDF */}
              <DownloadPDFButton
                pdfData={pdfData}
                shift={shift}
                filterReportOnly={filterReportOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

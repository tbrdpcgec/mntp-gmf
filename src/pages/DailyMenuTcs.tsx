import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import CustomSelect from '../components/CustomSelect';
import InputDataTcs from './InputDataTcs';

const LOCATIONS = [
  'NDT',
  'HEAT TREATMENT & WELDING',
  'PAINTING & PLATING',
  'GAEM SPECIAL PROCESS',
];
const DOC_TYPES = ['DN', 'JC', 'MDR', 'PDS'];
const PLNTWKCNTR = ['CGK', 'GAH1', 'GAH2', 'GAH3', 'GAH4', 'WSSR', 'WSST'];

type Row = {
  id: string;
  [key: string]: any;
};

const TEXT_INPUT_COLUMNS = ['remark', 'sp'];

const REMARK_OPTIONS = [
  'FINISH SENT TO NEXT STEP',
  'QUEUED',
  'WAITING MATERIAL',
  'IN PROGRESS',
  'ON TRACK',
  'AFTER CADMIUM PLATED',
];

const LOC_DOC_OPTIONS = [
  'TJO (DOC ONLY)',
  'TJO (DOC+PART)',
  'LINE (DOC ONLY)',
  'LINE (DOC+PART)',
  'NDT (DOC ONLY)',
  'TV/TC (DOC ONLY)',
];

const columnWidths: Record<string, string> = {
  ac_reg: 'min-w-[150px]',
  opr: 'min-w-[100px]',
  description: 'min-w-[350px]',
  order: 'min-w-[70px]',
  location: 'min-w-[00px]',
  doc_type: 'min-w-[50px]',
  plntwkcntr: 'min-w-[0px]',
  date_in: 'min-w-[80px]',
  pn: 'min-w-[100px]',
  sn: 'min-w-[sn0px]',
  type_ac: 'min-w-[150px]',
  category: 'min-w-[100px]',
  priority: 'min-w-[00px]',
  status_pe: 'min-w-[0px]',
  cek_sm4: 'min-w-[50px]',
  cek_cs4: 'min-w-[50px]',
  cek_sm1: 'min-w-[50px]',
  cek_cs1: 'min-w-[50px]',
  cek_mw: 'min-w-[50px]',
  remark_pro: 'min-w-[200px]',
  nd: 'min-w-[0px]',
  tjo: 'min-w-[0px]',
  other: 'min-w-[0px]',
  status_job: 'min-w-[00px]',
  remark: 'min-w-[200px]',
  sp: 'min-w-[120px]',
  loc_doc: 'min-w-[0px]',
  date_out: 'min-w-[0px]',
  pds_no: 'min-w-[100px]',
  tracking_sp: 'min-w-[300px]',
  link_scan: 'max-w-[300px]',
};

const COLUMN_ORDER: { key: string; label: string }[] = [
  { key: 'no', label: 'No' },
  { key: 'order', label: 'Order' },
  { key: 'description', label: 'Description' },
  { key: 'ac_reg', label: 'AC Reg / Comp' },
  { key: 'type_ac', label: 'AC Type / PN/SN' },
  { key: 'location', label: 'Area' },
  { key: 'priority', label: 'Priority' },

  { key: 'nd', label: 'NDT' },
  { key: 'other', label: 'HT-WELD' },
  { key: 'tjo', label: 'PAINT-PLATING' },
  { key: 'uld', label: 'GAEM-SP' },
  { key: 'remark', label: 'Remark' },
  { key: 'date_in', label: 'Date In' },

  { key: 'est_date', label: 'Est Finish' },
  { key: 'tracking_sp', label: 'Tracking SP' },
];

const EXTRA_COLUMNS_BY_LOCATION: Record<string, string[]> = {
  '': ['nd', 'other', 'tjo', 'uld'],
  'gaem special process': ['uld'],
  ndt: ['nd'],
  'heat treatment & welding': ['other'],
  'painting & plating': ['tjo'],
};

const BASE_COLUMNS = [
  'no',
  'order',
  'description',
  'ac_reg',
  'type_ac',
  'date_in',
  'location',
  'priority',
  'remark',
  'est_date',
  'tracking_sp',
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
    : 'bg-gray-700'; // ❗ OFF = selalu abu-abu

  return (
    <div
      onClick={onClick}
      className={` w-8 h-4 flex items-center rounded-full cursor-pointer p-0.5 transition-colors mx-auto ${bgClass}`}
    >
      <div
        className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
          value ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </div>
  );
};

const STATUS_COLUMNS = [
  'status_sm4',
  'status_sm1',
  'status_cs4',
  'status_cs1',
  'status_mw',
  'uld',
  'nd',
  'tjo',
  'other',
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

const getStatusJob = (row: Row): string => {
  const keysToCheck = [
    'status_sm4',
    'status_sm1',
    'status_cs4',
    'status_cs1',
    'status_mw',
    'uld',
    'nd',
    'tjo',
    'other',
    'cek_sm4',
    'cek_sm1',
    'cek_cs4',
    'cek_cs1',
    'cek_mw',
  ];

  const values = keysToCheck
    .map((key) => (row[key] || '').toUpperCase())
    .filter((v) => v !== '' && v !== 'GRAY'); // abaikan kosong dan abu-abu

  if (values.includes('OPEN')) return 'OPEN';
  if (values.includes('PROGRESS')) return 'PROGRESS';
  if (values.includes('CLOSED')) return 'CLOSED';
  return '';
};

export const MATERIAL_OPTIONS = ['NO NEED', 'LISTING', 'WAITING', 'DEPLOYED'];

const sortOptions = [
  { value: 'ac_reg', label: 'A/C Reg' },
  { value: 'order', label: 'Order' },
  { value: 'description', label: 'Description' },
  { value: 'location', label: 'Area' },
  { value: 'doc_type', label: 'Doc Type' },
  { value: 'date_in', label: 'Date In' },
  { value: 'pds_no', label: 'PDS No.' },
];

type OrderFilter = {
  value: string;
  valid: boolean;
};

const SHOP_MAP: Record<string, string> = {
  status_sm1: 'SHEETMETAL',
  status_sm4: 'SEAT',
  cek_cs1: 'COMPOSITE',
  cek_cs4: 'CABIN',
  cek_mw: 'MACHINING',
};

const generateShopFromCek = (row: any): string => {
  return Object.entries(SHOP_MAP)
    .filter(([cekKey]) => {
      const value = row[cekKey];
      return value !== null && value !== undefined && value !== '';
    })
    .map(([, shopName]) => shopName)
    .join(' / ');
};

export default function BUSH4() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcReg, setFilterAcReg] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [filterDocStatus, setFilterDocStatus] = useState('');
  const [filterStatusJob, setFilterStatusJob] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [showInputModal, setShowInputModal] = useState(false);
  const [filterDocType, setFilterDocType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
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
  const rowsPerPage = 200;

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filterOrders, setFilterOrders] = useState<string[]>([]);
  const [orderInput, setOrderInput] = useState('');
  const [orderSuggestions, setOrderSuggestions] = useState<string[]>([]);
  const [showOrderSuggestions, setShowOrderSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [tempRemark, setTempRemark] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filterMaterial, setFilterMaterial] = useState('');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  );

  //////untuk isible colom

  const visibleColumnKeys = [
    ...BASE_COLUMNS,
    ...(EXTRA_COLUMNS_BY_LOCATION[filterLocation] || []),
  ];

  const visibleColumns =
    COLUMN_ORDER.filter((col) => visibleColumnKeys.includes(col.key)) ||
    COLUMN_ORDER;

  /////////untuk shop

  const updateShopAuto = (row: any) => {
    const shopValue = generateShopFromCek(row);
    handleUpdate(row.id, 'shop', shopValue);
  };

  /////////////// untuk select row
  const getRowClass = (rowIndex: number) => {
    const isSelected = selectedRow === rowIndex;

    return `
      cursor-pointer
      transition-colors duration-150
      ${isSelected ? 'bg-[#004d40] text-white' : ''}
      hover:bg-[#2e3f42]
    `;
  };

  /////////untuk material dan link scan
  const EditableTextCell = ({ row, field }: { row: any; field: string }) => (
    <div className="relative w-full">
      <input
        type="text"
        value={row[field] ?? ''}
        onChange={(e) =>
          setRows((prev) =>
            prev.map((r) =>
              r.id === row.id ? { ...r, [field]: e.target.value } : r
            )
          )
        }
        onBlur={() => handleUpdate(row.id, field, row[field] ?? '')}
        onContextMenu={(e) => {
          e.preventDefault();
          e.currentTarget.focus();
        }}
        placeholder=" "
        className="
          w-full
          px-1 py-0.5
          rounded-md
          bg-transparent
          text-white
          text-[11px]
          focus:outline-none
          focus:ring-1 focus:ring-teal-500
        "
      />
    </div>
  );

  const SkeletonRow = ({ cols }) => (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-2 py-1">
          <div className="h-3 w-full rounded bg-zinc-700"></div>
        </td>
      ))}
    </tr>
  );

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

  const handleAction = async (
    action: 'copy' | 'save' | 'delete' | 'archived'
  ) => {
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

      case 'save':
        const selectedForExport = rows
          .filter((row) => selectedRows.includes(row.id))
          .map((row, index) => ({
            No: index + 1,
            'A/C Reg': row.ac_reg,
            Order: row.order,
            Description: row.description,
            'Status Job': row.status_job,
            Remark: row.remark,
            SP: row.sp,
            'Loc Doc/Part': row.loc_doc,
          }));

        if (selectedForExport.length === 0) {
          setNotification('❗ No data to export.');
          break;
        }

        const worksheet = XLSX.utils.json_to_sheet(selectedForExport);
        const workbook = XLSX.utils.book_new();
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        const sheetName = `Dashboard MNTP ${formattedDate}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `Dashboard_MNTP_${formattedDate}.xlsx`);
        setNotification('✅ Data exported as Excel file!');
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('mntp_tcs')
          .delete()
          .in('id', selectedRows);

        if (deleteError) {
          console.error('❌ Failed to delete from Supabase:', deleteError);
          setNotification('❌ Failed to delete from database.');
        } else {
          setRows((prev) =>
            prev.filter((row) => !selectedRows.includes(row.id))
          );
          setNotification('✅ Rows successfully deleted.');
        }
        break;

      case 'archived':
        const { error: archivedError } = await supabase
          .from('mntp_tcs')
          .update({ archived: true })
          .in('id', selectedRows);

        if (archivedError) {
          console.error('❌ Failed to archived:', archivedError);
          setNotification('❌ Failed to archived data.');
        } else {
          // Remove from view after archive
          setRows((prev) =>
            prev.filter((row) => !selectedRows.includes(row.id))
          );
          setNotification('✅ Rows successfully archived!');
        }
        break;
    }

    setShowMenu(false);
    setSelectedRows([]);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleActionWithConfirmation = (
    action: 'copy' | 'save' | 'archived' | 'delete'
  ) => {
    if (selectedRows.length === 0) {
      setNotification('❗ No rows selected.');
      setShowMenu(false);
      return;
    }

    const confirmMessages: Record<typeof action, string> = {
      copy: 'Are you sure you want to copy the selected rows?',
      save: 'Are you sure you want to export the selected rows?',
      archived: 'Are you sure you want to archived the selected rows?',
      delete: 'Are you sure you want to permanently delete the selected rows?',
    };

    setPendingAction(() => () => handleAction(action));
    setConfirmMessage(confirmMessages[action]); // ← inject message
    setShowConfirmModal(true); // show modal
    setShowMenu(false); // close dropdown
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

  ////// editable kolom, remark, tacking, scan
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);

  const [tempValue, setTempValue] = useState('');
  //////

  // 🔹 Pindahkan fetchData ke luar agar global function
  const fetchData = async () => {
    try {
      setLoading(true);

      let allRows = [];
      let from = 0;
      const limit = 1000;
      let moreData = true;

      while (moreData) {
        const { data, error } = await supabase
          .from('mntp_tcs')
          .select('*')
          .eq('archived', false)
          .order('date_in', { ascending: false })
          .range(from, from + limit - 1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          allRows = [...allRows, ...data];
          from += limit;

          if (data.length < limit) {
            moreData = false;
          }
        } else {
          moreData = false;
        }
      }

      setRows(allRows);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 useEffect sekarang hanya memanggil fetchData
  useEffect(() => {
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

    // 🔹 Auto isi date_out jika loc_doc berubah
    if (keyOrBulk === 'loc_doc') {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      updates['date_out'] = `${yyyy}-${mm}-${dd}`;
    }

    // 🔹 Auto isi date_closed jika status_xxx jadi CLOSED
    if (
      keyOrBulk !== 'bulk' &&
      keyOrBulk.startsWith('status_') &&
      value === 'CLOSED'
    ) {
      const suffix = keyOrBulk.replace('status_', '');
      updates[`date_closed_${suffix}`] = formatDateToDDMMMYYYY(new Date());
    }

    const currentRow = rows.find((r) => r.id === id);
    if (!currentRow) return; // ⬅️ penting

    // gabungkan row lama + update baru → simulatedRow
    let simulatedRow = { ...currentRow, ...updates };

    // 🔹 Hitung SHOP jika cek_* berubah ATAU bulk
    const affectsShop =
      keyOrBulk === 'bulk' ||
      Object.keys(updates).some((k) =>
        ['cek_sm1', 'cek_sm4', 'cek_cs1', 'cek_cs4', 'cek_mw'].includes(k)
      );

    if (affectsShop) {
      updates['shop'] = generateShopFromCek(simulatedRow);
      simulatedRow = { ...simulatedRow, shop: updates['shop'] };
    }

    const keys = Object.keys(updates);

    // 🔹 Step 2: Recalculate status_job
    const affectsStatusJob = keys.some((k) =>
      [
        'status_sm1',
        'status_sm4',
        'status_cs1',
        'status_cs4',
        'status_mw',
        'uld',
        'nd',
        'tjo',
        'other',
        'cek_sm4',
        'cek_sm1',
        'cek_cs4',
        'cek_cs1',
        'cek_mw',
      ].includes(k)
    );

    if (affectsStatusJob) {
      updates['status_job'] = getStatusJob(simulatedRow);
      simulatedRow = { ...simulatedRow, status_job: updates['status_job'] };
    }

    // 🔹 FORCE recalc status_job saat bulk (tombol refresh)
    // 🔹 FORCE recalc status_job saat bulk (tombol refresh)
    if (keyOrBulk === 'bulk') {
      updates['status_job'] = getStatusJob(simulatedRow);
    }

    console.log('UPDATES TO SUPABASE:', updates);

    // 🔹 Update ke Supabase
    const { error } = await supabase
      .from('mntp_tcs')
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

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // gabungkan remark
  const buildRemarkPro = (row: any) => {
    return [
      row.remark_sm1,
      row.remark_sm4,
      row.remark_cs1,
      row.remark_cs4,
      row.remark_mw,
    ]
      .filter((v) => v && v.trim() !== '')
      .join(' // ');
  };
  ///////

  const handleRecalculateAllStatus = async () => {
    try {
      setIsRecalculating(true);
      setNotification(null);

      const { data: allRows, error } = await supabase.from('mntp_tcs').select(`
        id,
        status_sm1,
        status_sm4,
        status_cs1,
        status_cs4,
        status_mw,
        uld,
        nd,
        tjo,
        other,
        cek_sm1,
  cek_sm4,
  cek_cs1,
  cek_cs4,
  cek_mw,
        remark_sm1,
        remark_sm4,
        remark_cs1,
        remark_cs4,
        remark_mw,
        remark_pro,
        shop,
        status_job
      `);

      if (error) throw error;

      for (const row of allRows) {
        // 🔹 Recalculate SHOP (PAKSA)
        const newShop = generateShopFromCek(row);

        // 🔹 Recalculate STATUS JOB (PAKSA)
        const simulatedRow = {
          ...row,
          shop: newShop,
        };

        const newStatusJob = getStatusJob(simulatedRow);

        // 🔹 Remark PRO
        const newRemarkPro = buildRemarkPro(row);

        const updatePayload: any = {};

        if (newShop !== row.shop) {
          updatePayload.shop = newShop;
        }

        if (newStatusJob !== row.status_job) {
          updatePayload.status_job = newStatusJob;
        }

        // 🚨 update hanya jika ada perubahan
        if (Object.keys(updatePayload).length > 0) {
          const { error: updateError } = await supabase
            .from('mntp_tcs')
            .update(updatePayload)
            .eq('id', row.id);

          if (updateError) {
            console.error(`❌ Error update row ${row.id}:`, updateError);
          } else {
            console.log(`✔ Updated row ${row.id}:`, updatePayload);
          }
        }
      }

      await fetchData(); // refresh tabel

      // 🎯 Notifikasi berhasil
      setNotification('✔ Your Data Has Been Updated!');
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      console.error('❌ Error saat recalculating:', err);
      setNotification('⚠️ Update Failed!');
      setTimeout(() => setNotification(null), 2500);
    } finally {
      setIsRecalculating(false);
    }
  };

  const filteredRows = rows
    .filter((row) => {
      if (showOnlyChecked && !selectedRows.includes(row.id)) return false;

      const matchesDocType =
        filterDocType === '' || row.doc_type === filterDocType;

      // khusus filter order multiple
      const matchesOrder =
        filterOrders.length === 0 ||
        filterOrders.some((o) => o.value === String(row.order));

      const matchesSearch = Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesAcReg = filterAcReg === '' || row.ac_reg === filterAcReg;

      const matchesStatus =
        filterStatusJob === '' ||
        STATUS_COLUMNS.some((col) =>
          String(row[col] || '')
            .toUpperCase()
            .includes(filterStatusJob)
        );
      const matchesPriority =
        filterPriority === 'All' ? true : row.priority === filterPriority;
      const matchesMaterial =
        filterMaterial === '' || row.material === filterMaterial;
      const matchesLocation =
        filterLocation === ''
          ? true
          : (row.location || '').toLowerCase() === filterLocation;

      return (
        matchesOrder &&
        matchesSearch &&
        matchesAcReg &&
        matchesStatus &&
        matchesPriority &&
        matchesMaterial &&
        matchesLocation &&
        matchesDocType
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



          <button
  onClick={() => setShowInputModal(true)}
  className="border border-gray-500 rounded-md bg-green-600 hover:bg-green-700 text-white px-2 py-1 shadow text-[11px]"
>
  Input Data
</button>

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-500 bg-[#292929] text-white rounded-md px-1 py-1 text-[11px] hover:bg-gray-500 shadow flex-1"
          />

          <CustomSelect
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            options={[
              { label: 'All Area', value: '' },
              { label: 'NDT', value: 'ndt' },
              {
                label: 'HEAT TREATMENT & WELDING',
                value: 'heat treatment & welding',
              },
              { label: 'PAINTING & PLATING', value: 'painting & plating' },
              { label: 'GAEM SPECIAL PROCESS', value: 'gaem special process' },
            ]}
            className="border border-gray-500 rounded-md px-1 py-1 text-[11px] hover:bg-gray-500 shadow w-[120px]"
          />

          <div className="relative w-[120px] ">
            <input
              type="text"
              value={filterAcReg}
              onChange={(e) => {
                setFilterAcReg(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay untuk biar sempat klik
              placeholder="A/C Reg / Component"
              className="border border-gray-500 bg-[#292929] text-white rounded-md px-1 py-1 text-[11px] w-full shadow hover:bg-gray-500"
            />

            {showSuggestions && (
              <ul className="absolute z-50  bg-[#292929] text-white border w-full max-h-60 overflow-y-auto text-[11px] shadow-md rounded">
                <li
                  className=" px-2 py-1 hover:bg-blue-600 cursor-pointer"
                  onMouseDown={() => setFilterAcReg('')}
                >
                  All A/C Reg
                </li>
                {filteredOptions.length === 0 && (
                  <li className="px-2 py-1 text-white">No match</li>
                )}
                {filteredOptions.map((reg) => (
                  <li
                    key={reg}
                    className="px-2 py-1 hover:bg-blue-600 cursor-pointer"
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
                      className="block w-full text-left px-2 py-1 hover:bg-blue-100"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => handleActionWithConfirmation('save')}
                      className="block w-full text-left px-2 py-1 hover:bg-blue-100"
                    >
                      💾 Export
                    </button>
                    <button
                      onClick={() => handleActionWithConfirmation('archived')}
                      className="block w-full text-left px-2 py-1 hover:bg-blue-100"
                    >
                      📦 Archived
                    </button>
                    <button
                      onClick={() => handleActionWithConfirmation('delete')}
                      className="block w-full text-left px-2 py-1 text-red-600 hover:bg-red-100"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CustomSelect
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            options={[
              { label: 'All Priority', value: 'All' },
              { label: 'Med', value: 'Med' },
              { label: 'High', value: 'High' },
            ]}
            className="border border-gray-500 rounded-md px-1 py-1 text-[11px]  text-white font-normal hover:bg-gray-500 shadow w-[120px] "
          />

          <CustomSelect
            value={filterStatusJob}
            onChange={(e) => setFilterStatusJob(e.target.value)}
            options={[
              { label: 'All Status', value: '' },

              { label: 'PENDING', value: 'PENDING' },
              { label: 'OPEN', value: 'OPEN' },
              { label: 'PROGRESS', value: 'PROGRESS' },
              { label: 'COMPLETED', value: 'COMPLETED' },
            ]}
            className="border border-gray-500 rounded-md px-1 py-1 text-[11px]  text-white font-normal hover:bg-gray-500 shadow w-[120px]"
          />

          {/* Sort By */}
          <CustomSelect
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            options={[
              { label: 'Sort by...', value: '' },
              ...sortOptions.map((option) => ({
                label: option.label,
                value: option.value,
              })),
            ]}
            className="border border-gray-500 rounded-md px-1 py-1 text-[11px]  text-white font-normal hover:bg-gray-500 shadow w-[120px]"
          />

          {/* Sort Direction */}
          <CustomSelect
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            options={[
              { label: 'A-Z', value: 'asc' },
              { label: 'Z-A', value: 'desc' },
            ]}
            className="border border-gray-500 rounded-md px-1 py-1 text-[11px]  text-white font-normal hover:bg-gray-500 shadow w-[120px]"
          />

    


        </div>

        {/* 🧊 Ini pembungkus baru untuk freeze header */}
        <div className="w-full overflow-auto max-h-[70vh]  rounded-md shadow-inner dark-scroll">
          <table
            className="
    w-full
    table-auto
    text-[11px]
    leading-tight
    border-collapse
    
  "
          >
            <thead className="sticky top-0 z-10 bg-teal-700 shadow">
              <tr className="bg-[#00919f] text-white text-xs font-semibold text-center border-b border-white/30">
                {/* ✅ Tampilkan checkbox hanya jika showCheckboxColumn true */}
                {showCheckboxColumn && (
                  <th className=" px-1 py-1 text-center ">
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

                {visibleColumns.map((col) => (
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
              {loading && paginatedRows.length === 0
                ? [...Array(8)].map((_, rowIndex) => (
                    <tr
                      key={`skeleton-${rowIndex}`}
                      className={`animate-pulse ${
                        rowIndex % 2 === 0 ? 'bg-[#161B1E]' : 'bg-[#1F262A]'
                      }`}
                    >
                      {[...Array(visibleColumns.length)].map((_, colIndex) => (
                        <td key={colIndex} className="px-1 py-1">
                          <div className="h-3 w-full rounded bg-zinc-700" />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginatedRows.map((row, rowIndex) => {
                    const isSelected = selectedRowId === row.id;

                    return (
                      <tr
                        key={row.id || rowIndex}
                        onClick={() =>
                          setSelectedRowId(isSelected ? null : row.id)
                        }
                        className={`
              text-white
              cursor-pointer
              transition-colors duration-150
              border-b border-white/30
              ${
                isSelected
                  ? 'bg-[#004d40]'
                  : rowIndex % 2 === 0
                  ? 'bg-[#1e1e1e]'
                  : 'bg-[#292929]'
              }
              ${!isSelected ? 'hover:bg-[#2e3f42]' : ''}
            `}
                      >
                        {showCheckboxColumn && (
                          <td className=" px-2 py-1 text-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(row.id)}
                              onChange={() => toggleSelectRow(row.id)}
                            />
                          </td>
                        )}

                        {visibleColumns.map(({ key }) => (
                          <td
                            key={key}
                            className={` px-1 py-1 border-l border-[#141414] ${
                              columnWidths[key] || ''
                            } ${
                              key === 'description' ||
                              key === 'tracking_sp' ||
                              key === 'link_scan'
                                ? 'text-left break-words whitespace-normal'
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
                            ) : key === 'description' || key === 'ac_reg' ? (
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
                                  className="border bg-transparent px-0.5 py-0.5 rounded w-full text-[11px]]"
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
                            ) : key === 'date_in' ||
                              key.startsWith('date_closed_') ? (
                              <span>
                                {row[key]
                                  ? new Date(row[key]).toLocaleDateString(
                                      'en-GB',
                                      {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      }
                                    )
                                  : ''}
                              </span>
                            ) : key.startsWith('report_') ? (
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
                            ) : key.startsWith('cek_') ? (
                              (() => {
                                const statusKey = key.replace(
                                  'cek_',
                                  'status_'
                                );
                                const statusValueRaw = row[statusKey] || '';
                                const statusValue =
                                  statusValueRaw.toUpperCase();
                                const isOn = row[key] === 'red';
                                const next = isOn ? '' : 'red';

                                const color =
                                  statusValue === ''
                                    ? 'blue'
                                    : isOn
                                    ? statusValue === 'CLOSED'
                                      ? 'green'
                                      : statusValue === 'PROGRESS'
                                      ? 'yellow'
                                      : statusValue === 'OPEN'
                                      ? 'red'
                                      : 'gray'
                                    : 'gray';

                                return (
                                  <ToggleSwitch
                                    value={isOn}
                                    color={color}
                                    onClick={() => {
                                      const newValue = isOn ? '' : 'red';
                                      handleUpdate(row.id, key, newValue);
                                      setRows((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, [key]: newValue }
                                            : r
                                        )
                                      );
                                    }}
                                  />
                                );
                              })()
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
                              ${
                                row.est_date ? 'text-white' : 'text-transparent'
                              }
                              [&::-webkit-calendar-picker-indicator]:invert
                            `}
                              />
                            ) : key === 'shop' ? (
                              <span className="px-1 text-[11px]">
                                {row.shop}
                              </span>
                            ) : key === 'location' ? (
                              <CustomSelect
                                value={row[key] || ''}
                                onChange={(e) =>
                                  handleUpdate(row.id, key, e.target.value)
                                }
                                options={[
                                  { label: '', value: '' },
                                  ...LOCATIONS.map((loc) => ({
                                    label: loc,
                                    value: loc,
                                  })),
                                ]}
                                className={`max-w-[100px] border border-transparent rounded px-0.5 py-0.5 text-[11px] font-normal ${
                                  row[key] === 'NDT'
                                    ? 'bg-purple-500 text-white'
                                    : row[key] === 'HEAT TREATMENT & WELDING'
                                    ? 'bg-cyan-500 text-white'
                                    : row[key] === 'PAINTING & PLATING'
                                    ? 'bg-orange-500 text-white'
                                    : row[key] === 'GAEM SPECIAL PROCESS'
                                    ? 'bg-slate-500 text-white'
                                    : 'bg-transparent'
                                }`}
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
                                  { label: 'High', value: 'High' },
                                ]}
                                className={`border border-transparent rounded px-0.5 py-0.5 text-[11px] font-normal ${
                                  row[key] === 'High'
                                    ? 'bg-red-500 text-white'
                                    : row[key] === 'Med'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-transparent'
                                }`}
                              />
                            ) : key === 'remark_mat' ? (
                              <CustomSelect
                                value={row[key] || ''}
                                onChange={(e) =>
                                  handleUpdate(row.id, key, e.target.value)
                                }
                                options={[
                                  { label: '', value: '' },
                                  ...MATERIAL_OPTIONS.map((mat) => ({
                                    label: mat,
                                    value: mat,
                                  })),
                                ]}
                                className="border border-transparent rounded-md px-0.5 py-0.5 text-[11px] font-normal bg-transparent text-white"
                              />
                            ) : key === 'loc_doc' ? (
                              <CustomSelect
                                value={row[key] || ''}
                                onChange={(e) =>
                                  handleUpdate(row.id, key, e.target.value)
                                }
                                options={[
                                  { label: '', value: '' },
                                  ...LOC_DOC_OPTIONS.map((option) => ({
                                    label: option,
                                    value: option,
                                  })),
                                ]}
                                className="border border-transparent rounded px-0.5 py-0.5 text-[11px]  font-normal"
                              />
                            ) : key === 'date_out' ? (
                              row[key] ? (
                                new Date(row[key]).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              ) : (
                                ''
                              )
                            ) : STATUS_COLUMNS.includes(key) ? (
                              (() => {
                                const area = (row.location || '').toUpperCase();

                                // mapping area ke nama kolom
                                const AREA_TO_COLUMN = {
                                  NDT: 'nd',
                                  'HEAT TREATMENT & WELDING': 'other',
                                  'PAINTING & PLATING': 'tjo',
                                  'GAEM SPECIAL PROCESS': 'uld',
                                };

                                const activeColumn = AREA_TO_COLUMN[area];

                                // kalau bukan kolom yang sesuai → kosongin
                                if (key !== activeColumn) {
                                  return (
                                    <span className="text-gray-500 italic">
                                      {' '}
                                    </span>
                                  );
                                }

                                // kalau sesuai → tampilkan select
                                return (
                                  <CustomSelect
                                    value={row[key] || ''}
                                    onChange={(e) => {
                                      handleUpdate(row.id, key, e.target.value);
                                    }}
                                    options={[
                                      { label: '', value: '' },
                                      { label: 'PENDING', value: 'PENDING' },
                                      { label: 'OPEN', value: 'OPEN' },
                                      { label: 'PROGRESS', value: 'PROGRESS' },
                                      {
                                        label: 'COMPLETED',
                                        value: 'COMPLETED',
                                      },
                                    ]}
                                    className={`border border-transparent rounded-md px-0.5 py-0.5 w-[85px]
                                      text-[11px] text-left font-normal
                                      ${
                                        !row[key]
                                          ? 'bg-transparent text-white'
                                          : row[key] === 'PENDING'
                                          ? 'bg-purple-500 text-white'
                                          : row[key] === 'OPEN'
                                          ? 'bg-red-500 text-white'
                                          : row[key] === 'PROGRESS'
                                          ? 'bg-yellow-500 text-white'
                                          : row[key] === 'COMPLETED'
                                          ? 'bg-green-500 text-white'
                                          : ''
                                      }`}
                                  />
                                );
                              })()
                            ) : key === 'remark' ? (
                              <div className="relative w-[200px]">
                                <input
                                  type="text"
                                  value={tempRemark[row.id] ?? row[key] ?? ''}
                                  onChange={(e) =>
                                    setTempRemark((prev) => ({
                                      ...prev,
                                      [row.id]: e.target.value,
                                    }))
                                  }
                                  onBlur={() => {
                                    const newValue = tempRemark[row.id];
    
                                    if (
                                      newValue !== undefined &&
                                      newValue !== row[key]
                                    ) {
                                      handleUpdate(row.id, key, newValue);
                                    }
                                  }}
                                  placeholder=" "
                                  className=" px-1 py-0.5 rounded-md bg-transparent text-[11px] w-full"
                                  list={`remark_list_${row.id}`}
                                />
                                <datalist id={`remark_list_${row.id}`}>
                                  {REMARK_OPTIONS.map((option) => (
                                    <option key={option} value={option} />
                                  ))}
                                </datalist>
                              </div>
                            ) : key === 'tracking_sp' ||
                              key === 'ac_reg' ||
                              key === 'type_ac' ||
                              key === 'opr' ||
                              key === 'sn' ||
                              key === 'pds_no' ||
                              key === 'category' ||
                              key === 'safe_stock' ||
                              key === 'remain_stock' ||
                              key === 'status stock' ||
                              key === 'plan_fsb' ||
                              key === 'remark_bdp' ? (
                              editingCell?.id === row.id &&
                              editingCell?.field === key ? (
                                <input
                                  type="text"
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  onBlur={() => {
                                    if (tempValue !== row[key]) {
                                      handleUpdate(row.id, key, tempValue);
    
                                      setRows((prev) =>
                                        prev.map((r) =>
                                          r.id === row.id
                                            ? { ...r, [key]: tempValue }
                                            : r
                                        )
                                      );
                                    }
    
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
                              text-left break-words whitespace-normal
                              border-teal-500
                              focus:outline-none
                              focus:ring-1 focus:ring-teal-500
                            "
                                />
                              ) : (
                                <div
                                  onDoubleClick={() => {
                                    setEditingCell({ id: row.id, field: key });
                                    setTempValue(row[key] || '');
                                  }}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    setEditingCell({ id: row.id, field: key });
                                    setTempValue(row[key] || '');
                                  }}
                                  title="Double click to edit"
                                  className="
                              w-full
                              px-1 py-2
                              cursor-text
                              text-left break-words whitespace-normal
                              border
                              border-transparent
                              rounded-md
                              hover:border-teal-500
                            "
                                >
                                  {key === 'link_scan' && row.link_scan ? (
                                    <a
                                      href={row.link_scan}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="block truncate text-teal-400 underline"
                                    >
                                      {row.link_scan}
                                    </a>
                                  ) : (
                                    <span className="block  text-white">
                                      {row[key] || ''}
                                    </span>
                                  )}
                                </div>
                              )
                            ) : (
                              String(row[key] ?? '')
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
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
        <div className="flex justify-start mt-2 text-white text-[11px] items-center space-x-2">
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

          {/* Tambahan: total data berdasarkan filter */}
          <span className="text-white ml-2">• Total {rows.length} data</span>
        </div>
      </div>

      {showInputModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl w-[95%] h-[95%] overflow-auto relative">

      <button
        onClick={() => setShowInputModal(false)}
        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded z-50"
      >
        X
      </button>

      <InputDataTcs />
    </div>
  </div>
)}

    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase, supabaseSecond } from '../supabaseClient';
import * as XLSX from 'xlsx';

type Row = {
  id: string;
  [key: string]: any;
};

const columnWidths: Record<string, string> = {
  archived: 'min-w-[0px]',
  ac_reg: 'min-w-[0px]',
  description: 'min-w-[300px]',
  order: 'min-w-[0px]',
  location: 'min-w-[0px]',
  doc_type: 'min-w-[0px]',
  plntwkcntr: 'min-w-[0px]',
  date_in: 'min-w-[0px]',
  doc_status: 'min-w-[0px]',
  nd: 'min-w-[0px]',
  tjo: 'min-w-[0px]',
  other: 'min-w-[0px]',
  status_job: 'min-w-[0px]',
  remark: 'min-w-[00px]',
  sp: 'min-w-[0px]',
  loc_doc: 'min-w-[0px]',
  date_out: 'min-w-[0px]',
  status_pe: 'min-w-[0px]',
  cek_sm4: 'min-w-[0px]',
  status_sm4: 'min-w-[0px]',
  remark_sm4: 'min-w-[0px]',
  handle_by_sm4: 'min-w-[0px]',
  date_closed_sm4: 'min-w-[00px]',
  report_sm4: 'min-w-[0px]',
  cek_cs4: 'min-w-[0px]',
  status_cs4: 'min-w-[0px]',
  remark_cs4: 'min-w-[0px]',
  handle_by_cs4: 'min-w-[0px]',
  date_closed_cs4: 'min-w-[0px]',
  report_cs4: 'min-w-[0px]',
  cek_sm1: 'min-w-[0px]',
  status_sm1: 'min-w-[0px]',
  remark_sm1: 'min-w-[0px]',
  handle_by_sm1: 'min-w-[0px]',
  date_closed_sm1: 'min-w-[0px]',
  report_sm1: 'min-w-[0px]',
  cek_cs1: 'min-w-[0px]',
  status_cs1: 'min-w-[0px]',
  remark_cs1: 'min-w-[0px]',
  handle_by_cs1: 'min-w-[0px]',
  date_closed_cs1: 'min-w-[00px]',
  report_cs1: 'min-w-[0px]',
  cek_mw: 'min-w-[0px]',
  status_mw: 'min-w-[0px]',
  remark_mw: 'min-w-[0px]',
  handle_by_mw: 'min-w-[0px]',
  date_closed_mw: 'min-w-[0px]',
  report_mw: 'min-w-[0px]',
};

const COLUMN_ORDER: { key: string; label: string }[] = [
  { key: 'no', label: 'No' },
  { key: 'doc_type', label: 'Doc' },
  { key: 'ac_reg', label: 'A/C Reg' },
  { key: 'order', label: 'Order' },
  { key: 'description', label: 'Description' },
  { key: 'date_in', label: 'Date In' },
  { key: 'location', label: 'Status Comp' },
  { key: 'doc_status', label: 'Doc Status' },
  { key: 'remark', label: 'Remark' },

  { key: 'status_sm1', label: 'Structure' },
  { key: 'date_closed_sm1', label: 'Date Closed Structure' },

  { key: 'status_cs1', label: 'Avionic' },
  { key: 'status_sm4', label: 'Electrical' },
  { key: 'status_cs4', label: 'Cabin' },
  { key: 'status_mw', label: 'Machining' },
  { key: 'nd', label: 'NDT' },
  { key: 'tjo', label: 'Striping' },

  { key: 'status_job', label: 'Status Job' },

  { key: 'shop', label: 'Shop' },
  { key: 'tracking_sp', label: 'Tracking SP' },
  { key: 'archived', label: 'Archived' },
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

const FILTERED_PLNTWKCNTR = [
  'CGK',
  'GAH1',
  'GAH2',
  'GAH3',
  'GAH4',
  'WSSR',
  'WSST',
];

const sortOptions = [
  { value: 'ac_reg', label: 'A/C Reg' },
  { value: 'order', label: 'Order' },
  { value: 'description', label: 'Description' },
  { value: 'location', label: 'Location' },
  { value: 'doc_type', label: 'Doc Type' },
  { value: 'date_in', label: 'Date In' },
  { value: 'doc_status', label: 'Doc Status' },
];

export default function BUSH4() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcReg, setFilterAcReg] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [filterDocStatus, setFilterDocStatus] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCheckboxColumn, setShowCheckboxColumn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showArchivedColumn, setShowArchivedColumn] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const [showOnlyChecked, setShowOnlyChecked] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const confirmAction = (action: () => void) => {
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };
  const handleAction = async (action: 'copy' | 'exportAndDelete') => {
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

      case 'exportAndDelete':
        const selectedForExport = rows
          .filter((row) => selectedRows.includes(row.id))
          .map((row, index) => {
            const exportRow: Record<string, any> = {
              No: index + 1,
            };

            COLUMN_ORDER.forEach(({ key, label }) => {
              if (key === 'no') return;

              let value = row[key];

              // Format khusus tanggal
              if (
                key === 'date_closed_sm1' ||
                key === 'date_closed_sm4' ||
                key === 'date_closed_pe' ||
                key === 'date_closed_cs1' ||
                key === 'date_closed_cs4'
              ) {
                if (value) {
                  const date = new Date(value);
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = date.toLocaleString('en-US', {
                    month: 'short',
                  });
                  const year = date.getFullYear();
                  value = `${day}-${month}-${year}`;
                } else {
                  value = '';
                }
              }

              if (typeof value === 'boolean') {
                value = value ? 'TRUE' : 'FALSE';
              }

              exportRow[label] = value ?? '';
            });

            return exportRow;
          });

        if (selectedForExport.length === 0) {
          setNotification('❗ No data to export.');
          break;
        }

        const ws = XLSX.utils.json_to_sheet(selectedForExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ExportedData');
        XLSX.writeFile(wb, `Mntp_archived_${new Date().toISOString()}.xlsx`);

        const { error: deleteError } = await supabaseSecond
          .from('mdr_tracking_tbk1')
          .delete()
          .in('id', selectedRows);

        if (deleteError) {
          console.error('❌ Failed to delete from Supabase:', deleteError);
          setNotification('✅ Exported but failed to delete.');
        } else {
          setRows((prev) =>
            prev.filter((row) => !selectedRows.includes(row.id))
          );
          setNotification('✅ Exported and deleted successfully.');
        }

        break;
    }

    setShowMenu(false);
    setSelectedRows([]);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleActionWithConfirmation = (action: 'copy' | 'exportAndDelete') => {
    if (selectedRows.length === 0) {
      setNotification('❗ No rows selected.');
      setShowMenu(false);
      return;
    }

    const confirmMessages: Record<typeof action, string> = {
      copy: 'Are you sure you want to copy the selected rows?',
      exportAndDelete:
        'Do you want to export and then delete the selected rows?',
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
      const { data, error } = await supabaseSecond
        .from('mdr_tracking_tbk1')
        .select('*')
        .eq('archived', true)
        .order('date_in', { ascending: false });

      if (error) {
        console.error('Error fetching archived data:', error);
      } else {
        setRows(data || []);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async (id: string, field: string, value: any) => {
    if (field !== 'archived') return; // hanya izinkan update kolom 'archived'

    const { error } = await supabaseSecond
      .from('mdr_tracking_tbk1')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error('Error updating:', error.message);
    } else {
      // jika di-unarchive, hapus dari daftar
      if (value === false) {
        setRows((prev) => prev.filter((row) => row.id !== id));
      } else {
        // atau update nilai jika tetap archived
        setRows((prev) =>
          prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
      }
    }
  };

  const filteredRows = rows
    .filter((row) => {
      if (showOnlyChecked && !selectedRows.includes(row.id)) return false;

      const matchesSearch = Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesAcReg = filterAcReg === '' || row.ac_reg === filterAcReg;
      const matchesDocStatus =
        filterDocStatus === '' || row.doc_status === filterDocStatus;

      return matchesSearch && matchesAcReg && matchesDocStatus;
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

  return (
    <div className="bg-gray-100 w-full h-full">
      <div className="bg-white px-3 pt-3 pb-6 max-h-[100vh] overflow-hidden w-full rounded-lg">
        <div className="mb-2 flex flex-wrap gap-1 items-center">
          <div className="flex items-center ml-0">
            <span className="text-xs font-medium"></span>
            <label className="relative inline-flex items-center cursor-pointer select-none w-12 h-6">
              <input
                type="checkbox"
                checked={showCheckboxColumn}
                onChange={() => setShowCheckboxColumn(!showCheckboxColumn)}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-[24px]" />
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
            className="border rounded px-1 py-1 text-xs w-30 "
          />

          <button
            onClick={() => setShowOnlyChecked((prev) => !prev)}
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-xs px-1.5 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {showOnlyChecked ? 'Checked Row' : 'All Row'}
          </button>

          <div className="flex items-center gap-1">
            {/* Dropdown Menu */}
            <div className="relative inline-block text-left ml-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-xs px-1.5 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                ⋮ Actions
              </button>

              {showMenu && (
                <div className="absolute z-50 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-0 text-xs">
                    <button
                      onClick={() => handleAction('copy')}
                      className="block w-full text-left px-2 py-2 hover:bg-gray-100"
                    >
                      📋 Copy
                    </button>

                    <button
                      onClick={() =>
                        handleActionWithConfirmation('exportAndDelete')
                      }
                      className="block w-full text-left px-2 py-2 hover:bg-yellow-100"
                    >
                      📤 Export & Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <select
            value={filterAcReg}
            onChange={(e) => setFilterAcReg(e.target.value)}
            className="border rounded px-1 py-1 text-xs"
          >
            <option value="">All A/C Reg</option>
            {[...new Set(rows.map((r) => r.ac_reg).filter(Boolean))].map(
              (reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              )
            )}
          </select>

          <select
            value={filterDocStatus}
            onChange={(e) => setFilterDocStatus(e.target.value)}
            className="border rounded px-1 py-1 text-xs"
          >
            <option value="">All Doc Status</option>
            {[...new Set(rows.map((r) => r.doc_status).filter(Boolean))].map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              )
            )}
          </select>

          {/* Sort By */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="border rounded px-1 py-1 text-xs"
          >
            <option value="">Sort by...</option>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort Direction */}
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            className="border rounded px-1 py-1 text-xs"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>

        {/* 🧊 Ini pembungkus baru untuk freeze header */}
        <div className="w-full overflow-auto max-h-[70vh] border border-gray-300 rounded shadow-inner">
          <table className="w-full whitespace-nowrap table-auto text-[11px] leading-tight">
            <thead className="sticky top-0 z-10 bg-white shadow">
              <tr className="bg-gradient-to-t from-[#00838F] to-[#00838F] text-white text-xs font-semibold text-center">
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

                {COLUMN_ORDER.map((col) => {
                  // Sembunyikan kolom archived kalau toggle dimatikan
                  if (col.key === 'archived' && !showCheckboxColumn)
                    return null;

                  return (
                    <th
                      key={col.key}
                      className="border px-1 py-1 text-center text-xs"
                    >
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {rows
                .filter((row) => {
                  if (showOnlyChecked && !selectedRows.includes(row.id))
                    return false;

                  const matchesSearch = Object.values(row)
                    .join(' ')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                  const matchesAcReg =
                    filterAcReg === '' || row.ac_reg === filterAcReg;
                  const matchesDocStatus =
                    filterDocStatus === '' ||
                    row.doc_status === filterDocStatus;

                  return matchesSearch && matchesAcReg && matchesDocStatus;
                })
                .sort((a, b) => {
                  if (!sortKey) return 0;

                  const aVal = a[sortKey] ?? '';
                  const bVal = b[sortKey] ?? '';

                  // Kalau date
                  if (sortKey.includes('date')) {
                    const aDate = new Date(aVal);
                    const bDate = new Date(bVal);
                    return sortDirection === 'asc'
                      ? aDate.getTime() - bDate.getTime()
                      : bDate.getTime() - aDate.getTime();
                  }

                  // Kalau number
                  if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
                    return sortDirection === 'asc'
                      ? Number(aVal) - Number(bVal)
                      : Number(bVal) - Number(aVal);
                  }

                  // Default string
                  return sortDirection === 'asc'
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
                })

                .map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    {showCheckboxColumn && (
                      <td className="border px-1 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                        />
                      </td>
                    )}

                    {COLUMN_ORDER.map(({ key }) => {
                      // Sembunyikan kolom archived kalau toggle dimatikan
                      if (key === 'archived' && !showCheckboxColumn)
                        return null;

                      return (
                        <td
                          key={key}
                          className={`border px-1 py-1 ${
                            key === 'description' ? 'text-left' : 'text-center'
                          } ${columnWidths[key] || ''}`}
                        >
                          {key === 'no' ? (
                            rowIndex + 1
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
                          ) : key.startsWith('cek_') ? (
                            (() => {
                              const statusKey = key.replace('cek_', 'status_');
                              const statusValueRaw = row[statusKey] || '';
                              const statusValue = statusValueRaw.toUpperCase();

                              const isOn = row[key] === 'red';

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
                                <div
                                  className={`w-4 h-4 rounded-full mx-auto bg-${color}-500`}
                                />
                              );
                            })()
                          ) : key === 'archived' ? (
                            <input
                              type="checkbox"
                              checked={row[key] === true}
                              onChange={(e) => {
                                const newValue = e.target.checked;
                                handleUpdate(row.id, key, newValue);
                                setRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, [key]: newValue }
                                      : r
                                  )
                                );
                              }}
                              className="w-3 h-3"
                            />
                          ) : (
                            String(row[key] ?? '')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>

          {notification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white px-6 py-4 rounded shadow-lg text-center text-gray-800 text-xs">
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
                    className="px-2 py-2 bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

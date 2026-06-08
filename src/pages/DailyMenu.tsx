import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const LOCATIONS = ['ON A/C', 'BUSH4', 'WS1', 'CGK'];
const DOC_TYPES = ['JC', 'MDR', 'PDS', 'SOA'];
const PLNTWKCTR = ['CGK', 'GAH1', 'GAH2', 'GAH3', 'GAH4', 'WSSR', 'WSST'];

type Row = {
  id: string;
  [key: string]: any;
};

const DOC_STATUS_OPTIONS = [
  '🔴NEED RO',
  '🔴WAIT.REMOVE',
  '🟢COMPLETED',
  '🟢DONE BY SOA',
  '🟡RO DONE',
  '🟡EVALUATED',
  '🟡WAIT.BDP',
  '🟡CONTACT OEM',
  '🟡HOLD',
  '🔘REPLACE',
  '🔘NOT TBR',
  '🔘COVER BY',
  '🔘TJK ITEM',
  '🔘CANCEL',
  '🔘ROBBING',
];

const TEXT_INPUT_COLUMNS = [
  'remark',
  'sp',
  // Kolom dengan awalan tertentu
  'handle_by_sm4',
  'handle_by_sm1',
  'handle_by_cs4',
  'handle_by_cs1',
  'handle_by_mw',
  'remark_sm4',
  'remark_sm1',
  'remark_cs4',
  'remark_cs1',
  'remark_mw',
];

const columnWidths: Record<string, string> = {
  seq_mdr: 'min-w-[70px]',
  ac_reg: 'min-w-[80px]',
  description: 'min-w-[400px]',
  order: 'min-w-[80px]',
  location: 'min-w-[100px]',
  doc_type: 'min-w-[100px]',
  plntwkcntr: 'min-w-[50px]',
  date_in: 'min-w-[90px]',
  doc_status: 'min-w-[130px]',
  nd: 'min-w-[60px]',
  tjo: 'min-w-[60px]',
  other: 'min-w-[60px]',
  status_job: 'min-w-[100px]',
  remark: 'min-w-[200px]',
  sp: 'min-w-[120px]',
  status_pe: 'min-w-[80px]',
  cek_sm4: 'min-w-[80px]',
  status_sm4: 'min-w-[80px]',
  remark_sm4: 'min-w-[150px]',
  handle_by_sm4: 'min-w-[90px]',
  date_closed_sm4: 'min-w-[100px]',
  report_sm4: 'min-w-[80px]',
  cek_cs4: 'min-w-[80px]',
  status_cs4: 'min-w-[80px]',
  remark_cs4: 'min-w-[150px]',
  handle_by_cs4: 'min-w-[90px]',
  date_closed_cs4: 'min-w-[100px]',
  report_cs4: 'min-w-[80px]',
  cek_sm1: 'min-w-[80px]',
  status_sm1: 'min-w-[80px]',
  remark_sm1: 'min-w-[150px]',
  handle_by_sm1: 'min-w-[90px]',
  date_closed_sm1: 'min-w-[100px]',
  report_sm1: 'min-w-[80px]',
  cek_cs1: 'min-w-[80px]',
  status_cs1: 'min-w-[80px]',
  remark_cs1: 'min-w-[150px]',
  handle_by_cs1: 'min-w-[90px]',
  date_closed_cs1: 'min-w-[100px]',
  report_cs1: 'min-w-[80px]',
  cek_mw: 'min-w-[80px]',
  status_mw: 'min-w-[80px]',
  remark_mw: 'min-w-[150px]',
  handle_by_mw: 'min-w-[90px]',
  date_closed_mw: 'min-w-[100px]',
  report_mw: 'min-w-[80px]',
};

const COLUMN_ORDER: { key: string; label: string }[] = [
  { key: 'no', label: 'No' },
  { key: 'seq_mdr', label: 'No. Seq' },
  { key: 'ac_reg', label: 'A/C Reg' },
  { key: 'order', label: 'Order' },
  { key: 'description', label: 'Description' },
  { key: 'location', label: 'Location' },
  { key: 'doc_type', label: 'Doc Type' },
  { key: 'plntwkcntr', label: 'PlntWkCntr' },
  { key: 'date_in', label: 'Date In' },
  { key: 'doc_status', label: 'Doc Status' },
  { key: 'status_pe', label: 'Status PE' },
  { key: 'cek_sm4', label: 'W304' },
  { key: 'status_sm4', label: 'Status W304' },
  { key: 'remark_sm4', label: 'Remark W304' },
  { key: 'handle_by_sm4', label: 'Handle by W304' },
  { key: 'date_closed_sm4', label: 'Date Closed W304' },
  { key: 'report_sm4', label: 'Report W304' },
  { key: 'cek_cs4', label: 'W305' },
  { key: 'status_cs4', label: 'Status W305' },
  { key: 'remark_cs4', label: 'Remark W305' },
  { key: 'handle_by_cs4', label: 'Handle by W305' },
  { key: 'date_closed_cs4', label: 'Date Closed W305' },
  { key: 'report_cs4', label: 'Report W305' },
  { key: 'cek_sm1', label: 'W301' },
  { key: 'status_sm1', label: 'Status W301' },
  { key: 'remark_sm1', label: 'Remark W301' },
  { key: 'handle_by_sm1', label: 'Handle by W301' },
  { key: 'date_closed_sm1', label: 'Date Closed W301' },
  { key: 'report_sm1', label: 'Report W301' },
  { key: 'cek_cs1', label: 'W302' },
  { key: 'status_cs1', label: 'Status W302' },
  { key: 'remark_cs1', label: 'Remark W302' },
  { key: 'handle_by_cs1', label: 'Handle by W302' },
  { key: 'date_closed_cs1', label: 'Date Closed W302' },
  { key: 'report_cs1', label: 'Report W302' },
  { key: 'cek_mw', label: 'W303' },
  { key: 'status_mw', label: 'Status W303' },
  { key: 'remark_mw', label: 'Remark W303' },
  { key: 'handle_by_mw', label: 'Handle by W303' },
  { key: 'date_closed_mw', label: 'Date Closed W303' },
  { key: 'report_mw', label: 'Report W303' },
  { key: 'nd', label: 'ND' },
  { key: 'tjo', label: 'TJO' },
  { key: 'other', label: 'Other' },
  { key: 'status_job', label: 'STATUS JOB' },
  { key: 'sp', label: 'SP' },
  { key: 'remark', label: 'Remark' },
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

const STATUS_COLUMNS = [
  'status_sm4',
  'status_sm1',
  'status_cs4',
  'status_cs1',
  'status_mw',
  'nd',
  'tjo',
  'other',
];

const getStatusPE = (doc_status: string): string => {
  const openStatuses = ['🔴NEED RO', '🔴WAIT.REMOVE'];
  const progressStatuses = [
    '🟡RO DONE',
    '🟡EVALUATED',
    '🟡WAIT.BDP',
    '🟡CONTACT OEM',
    '🟡HOLD',
  ];
  const closedStatuses = [
    '🟢COMPLETED',
    '🟢DONE BY SOA',
    '🔘TJK ITEM',
    '🔘NOT TBR',
    '🔘REPLACE',
    '🔘COVER BY',
    '🔘CANCEL',
    '🔘ROBBING',
  ];

  if (openStatuses.includes(doc_status)) return 'OPEN';
  if (progressStatuses.includes(doc_status)) return 'PROGRESS';
  if (closedStatuses.includes(doc_status)) return 'CLOSED';
  return '';
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

const getStatusJob = (row: Row): string => {
  const keysToCheck = [
    'status_pe',
    'status_sm4',
    'status_sm1',
    'status_cs4',
    'status_cs1',
    'status_mw',
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



export default function BUSH4() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcReg, setFilterAcReg] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [filterDocStatus, setFilterDocStatus] = useState('');


  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);



  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('mdr_tracking_duplicate').select('*');
      if (error) console.error('Error fetching data:', error);
      else setRows(data || []);
    };
    fetchData();
  }, []);



  const handleUpdate = async (id: string, key: string, value: string) => {
    const updates: Record<string, any> = { [key]: value };

    // Cek jika key adalah kolom status_ dan nilainya CLOSED
    if (key.startsWith('status_') && value === 'CLOSED') {
      const suffix = key.replace('status_', '');
      const dateKey = `date_closed_${suffix}`;
      const currentDate = formatDateToDDMMMYYYY(new Date());
      updates[dateKey] = currentDate;
    }

    // 2. Tentukan apakah kolom ini memengaruhi status_job
    const affectsStatusJob = [
      'status_pe',
      'status_sm4',
      'status_sm1',
      'status_cs4',
      'status_cs1',
      'status_mw',
      'nd',
      'tjo',
      'other',
      'cek_sm4',
      'cek_sm1',
      'cek_cs4',
      'cek_cs1',
      'cek_mw',
    ].includes(key);

    // 3. Hitung ulang status_job jika kolomnya termasuk yang diperhitungkan
    const currentRow = rows.find((row) => row.id === id);
    if (affectsStatusJob && currentRow) {
      const simulatedRow = { ...currentRow, [key]: value };
      const newStatusJob = getStatusJob(simulatedRow);
      updates['status_job'] = newStatusJob;
    }

    // 4. Kirim ke Supabase
    const { error } = await supabase
      .from('mdr_tracking_duplicate')
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

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="bg-white px-6 pt-4 pb-6 max-h-[95vh] overflow-hidden w-full">
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-48"
          />

          <select
            value={filterAcReg}
            onChange={(e) => setFilterAcReg(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
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
            className="border rounded px-2 py-1 text-sm"
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
        </div>

        {/* 🧊 Ini pembungkus baru untuk freeze header */}
        <div className="w-full overflow-y-auto max-h-[70vh] border border-gray-300 rounded shadow-inner w-full overflow-x-auto">
          <table className="w-full min-w-[1280px] table-auto text-xs leading-tight">
            <thead className="sticky top-0 z-10 bg-white shadow">
              <tr className="bg-gradient-to-t from-[#00838F] to-[#00838F] text-white text-xs font-semibold uppercase text-center">
                {COLUMN_ORDER.map((col) => (
                  <th key={col.key} className="border px-2 py-1 text-center">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((row) => {
                  // Global search (pencocokan teks bebas)
                  const searchString = Object.values(row)
                    .join(' ')
                    .toLowerCase();
                  const matchesSearch = searchString.includes(
                    searchTerm.toLowerCase()
                  );

                  // Filter per kolom
                  const matchesAcReg =
                    filterAcReg === '' || row.ac_reg === filterAcReg;
                  const matchesOrder =
                    filterOrder === '' || row.order === filterOrder;
                  const matchesDocStatus =
                    filterDocStatus === '' ||
                    row.doc_status === filterDocStatus;

                  return (
                    matchesSearch &&
                    matchesAcReg &&
                    matchesOrder &&
                    matchesDocStatus
                  );
                })
                .map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    {COLUMN_ORDER.map(({ key }) => (
                      
                      <td
    key={key}
    className={`border px-2 py-1 ${
      key === 'description' ? 'text-left' : 'text-center'
    } ${columnWidths[key] || ''}`}
  >
    {key === 'no' ? (
      rowIndex + 1
    ) : key === 'description' ? (
      editingCell?.id === row.id && editingCell?.field === key ? (
        <input
          type="text"
          value={row[key] || ''}
          onChange={(e) =>
            setRows((prev) =>
              prev.map((r) =>
                r.id === row.id ? { ...r, [key]: e.target.value } : r
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
          className="border px-1 py-0.5 rounded w-full text-sm"
        />
      ) : (
        <div
          className="w-full text-left truncate"
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
                              ? new Date(row[key]).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
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
                            const statusKey = key.replace('cek_', 'status_');
                            const statusValueRaw = row[statusKey] || '';
                            const statusValue = statusValueRaw.toUpperCase(); // anggap OPEN jika kosong/null

                            const isOn = row[key] === 'red';
                            const next = isOn ? '' : 'red';

                            // 🔵 Tambahkan logika untuk warna biru saat status kosong
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
                                : 'gray'; // kalau OFF tetap abu-abu

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
                        ) : key === 'location' ? (
                          <select
                            value={row[key] || ''}
                            onChange={(e) =>
                              handleUpdate(row.id, key, e.target.value)
                            }
                            className="border rounded px-1 py-0.5"
                          >
                            <option value=""></option>
                            {LOCATIONS.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                          </select>
                        ) : key === 'doc_type' ? (
                          <select
                            value={row[key] || ''}
                            onChange={(e) =>
                              handleUpdate(row.id, key, e.target.value)
                            }
                            className="border rounded px-1 py-0.5"
                          >
                            <option value=""></option>
                            {DOC_TYPES.map((doc) => (
                              <option key={doc} value={doc}>
                                {doc}
                              </option>
                            ))}
                          </select>
                        ) : key === 'plntwkcntr' ? (
                          <select
                            value={String(row[key] ?? '')}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                alert('PLNTWKCTR wajib dipilih!');
                                return;
                              }
                              handleUpdate(row.id, key, value);
                            }}
                            className="border rounded px-1 py-0.5"
                          >
                            <option value="" disabled>
                              - Pilih -
                            </option>
                            {PLNTWKCTR.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                          </select>
                        ) : STATUS_COLUMNS.includes(key) ? (
                          <select
                            value={row[key] || ''}
                            onChange={(e) =>
                              handleUpdate(row.id, key, e.target.value)
                            }
                            className="border rounded px-1 py-0.5"
                          >
                            <option value=""></option>
                            <option value="OPEN">OPEN</option>
                            <option value="PROGRESS">PROGRESS</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        ) : TEXT_INPUT_COLUMNS.includes(key) ? (
                          <input
                            type="text"
                            maxLength={100}
                            value={row[key] || ''}
                            onChange={(e) =>
                              handleUpdate(row.id, key, e.target.value)
                            }
                            className="border px-1 py-0.5 rounded w-full text-sm"
                          />
                        ) : key === 'doc_status' ? (
                          <select
                            value={row[key] || ''}
                            onChange={(e) => {
                              const newDocStatus = e.target.value;
                              const newStatusPE = getStatusPE(newDocStatus);

                              // Update dua kolom sekaligus
                              handleUpdate(row.id, key, newDocStatus);
                              handleUpdate(row.id, 'status_pe', newStatusPE);

                              // Update lokal biar langsung terlihat
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        [key]: newDocStatus,
                                        status_pe: newStatusPE,
                                      }
                                    : r
                                )
                              );
                            }}
                            className="border rounded px-1 py-0.5 text-xs"
                          >
                            <option value=""></option>
                            {!DOC_STATUS_OPTIONS.includes(row[key]) &&
                              row[key] && (
                                <option value={row[key]}>{row[key]}</option>
                              )}
                            {DOC_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          String(row[key] ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useState, useEffect, useRef } from 'react';
import CustomSelect from '../components/CustomSelect';

const LOCATIONS = [
  'GAEM SPECIAL PROCESS',
  'NDT',
  'HEAT TREATMENT & WELDING',
  'PAINTING & PLATING',
];
const DOC_TYPES = ['DN', 'JC', 'MDR', 'PDS'];
const DOC_STATUS_OPTIONS = [
  '🔴NEED WO',
  '🟡WAITING INSP',
  '🟡EVALUATED',
  '🟡CONTACT OEM',
  '🟡DEPLOYED',
  '🟡COMPLETING DOC',
  '🟢COMPLETED',
  '🟢SCANNED',
];

const getStatusPE = (doc_status: string): string => {
  const progressStatus = [
    '🟡WAITING INSP',
    '🟡EVALUATED',
    '🟡CONTACT OEM',
    '🟡DEPLOYED',
    '🟡COMPLETING DOC',
  ];
  const closedStatus = ['🟢COMPLETED', '🟢SCANNED'];

  if (['🔴NEED WO', '🟡WAITING INSP'].includes(doc_status)) return 'OPEN';
  if (progressStatus.includes(doc_status)) return 'PROGRESS';
  if (closedStatus.includes(doc_status)) return 'CLOSED';
  return '';
};

const CEK_KEYS = [
  'cek_sm1',
  'cek_cs1',
  'cek_sm4',
  'cek_cs4',
  'cek_mw',
] as const;

const getStatusJob = (row: any): string => {
  const keysToCheck = [
    'status_pe',
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
    .filter((v) => v !== '' && v !== 'GRAY');

  if (values.includes('OPEN')) return 'OPEN';
  if (values.includes('PROGRESS')) return 'PROGRESS';
  if (values.includes('CLOSED')) return 'CLOSED';
  return '';
};

const emptyRow = {
  ac_reg: '',
  customer: '',
  maint: '',
  po: '',
  start: '',
  rts: '',
};

const FIELD_ORDER = ['ac_reg', 'customer', 'maint', 'po', 'start', 'rts'];

export default function InputData() {
  const [forms, setForms] = useState([{ ...emptyRow }]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef<HTMLInputElement[][]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [openDocType, setOpenDocType] = useState(false);
  const [openDocStatus, setOpenDocStatus] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [openLocation, setOpenLocation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('mntp_tcw').select(`
          id,
          ac_reg,
          customer,
          maint,
          po,
          start,
          rts,
        `);

      if (!error) setRows(data || []);
    };

    fetchData();
  }, []);

  const getInputToggleColor = (isOn: boolean) => (isOn ? 'blue' : 'gray');

  const toggleCek = (
    index: number,
    key: 'cek_sm1' | 'cek_cs1' | 'cek_sm4' | 'cek_cs4' | 'cek_mw'
  ) => {
    setForms((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const newValue = row[key] === 'red' ? '' : 'red';
        return { ...row, [key]: newValue };
      })
    );
  };

  const handleToggle = async (row: any, key: string, value: string) => {
    if (!row.id) {
      console.warn('Row belum punya ID, skip update', row);
      return;
    }

    const { error } = await supabase
      .from('mntp_tcw') // ✅ FIX DI SINI
      .update({ [key]: value })
      .eq('id', row.id);

    if (error) {
      console.error('Update error:', error);
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [key]: value } : r))
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    index: number
  ) => {
    const { name, value } = e.target;

    setForms((prevForms) =>
      prevForms.map((row, i) => {
        if (i !== index) return row;
        const updatedRow = { ...row, [name]: value };
        if (name === 'doc_status') {
          updatedRow.status_pe = getStatusPE(value);
        }
        return updatedRow;
      })
    );
  };
  type ToggleProps = {
    value: boolean;
    onClick: () => void;
    color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
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
      : 'bg-gray-700';

    return (
      <div
        onClick={onClick}
        className={`border border-teal-500 w-8 h-4 flex items-center rounded-full cursor-pointer p-0.5 transition-colors mx-auto ${bgClass}`}
      >
        <div
          className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    );
  };

  const addFiveRows = () => {
    const newRows = Array.from({ length: 5 }, () => ({ ...emptyRow }));
    setForms((prev) => [...prev, ...newRows]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const requiredKeys = [
      'ac_reg',
      'customer',
      'maint',
      'po',
      'start',
      'rts',
    ];
    
    // 🔎 Validasi
    for (let i = 0; i < forms.length; i++) {
      const row = forms[i];
    
      // Cek apakah ada field yang terisi
      const isAnyFilled = requiredKeys.some((key) => {
        return String(row[key] || '').trim() !== '';
      });
    
      // Cek apakah ada field yang kosong
      const isAnyMissing = requiredKeys.some((key) => {
        return String(row[key] || '').trim() === '';
      });
    
      if (isAnyFilled && isAnyMissing) {
        setMessage(
          `❌ Baris ${
            i + 1
          } belum lengkap. Semua field wajib diisi jika salah satunya diisi.`
        );
    
        setLoading(false);
        return;
      }
    }
    
    const dataToInsert = forms.filter((row) =>
  requiredKeys.every((key) => {
    return String(row[key] || '').trim() !== '';
  })
);

if (dataToInsert.length === 0) {
  setMessage('❌ No valid data available to save.');
  setLoading(false);
  return;
}
    
    const { error: insertError } = await supabase
      .from('mntp_tcw')
      .insert(dataToInsert);
    
    if (insertError) {
      console.error('Insert error:', insertError);
      setMessage('❌ Failed to save data.');
    } else {
      setMessage(`✅ ${dataToInsert.length} Data saved successfully.`);
    
      // reset form kosong
      setForms([{ ...emptyRow }]);
    }
    
    setLoading(false);
  };

  const handleUpdate = async (id: string, payload: Record<string, any>) => {
    await supabase.from('mntp_tcw').update(payload).eq('id', id);
  };

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain') || '';
      const lines = text.trim().split('\n');

      // Hanya tangani jika lebih dari 1 baris
      if (lines.length <= 1) return;

      const rows = lines.map((line) => line.split('\t'));

      const newForms = rows.map((cells) => ({
       
        ac_reg: cells[0] || '',
        customer: cells[1] || '',
        maint: cells[2] || '',
        po: cells[3] || '',
        start: cells[4] || '',
        rts: cells[5] || '',
      }));

      setForms(newForms); // ✅ langsung tampilkan hasil paste

      e.preventDefault();
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const handlePasteCell = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIndex: number,
    colName: string
  ) => {
    e.preventDefault();

    const clipboard = e.clipboardData.getData('text/plain');
    const rows = clipboard
      .trim()
      .split('\n')
      .map((line) => line.split('\t'));

    const newData = [...forms];

    rows.forEach((cols, rowOffset) => {
      const targetIndex = rowIndex + rowOffset;
      if (targetIndex >= newData.length) return; // Lewat dari batas data

      const startIndex = FIELD_ORDER.indexOf(colName);
      if (startIndex === -1) return;

      cols.forEach((value, colOffset) => {
        const fieldName = FIELD_ORDER[startIndex + colOffset];
        if (fieldName && newData[targetIndex]) {
          if (fieldName === 'order') {
            newData[targetIndex][fieldName] = value ? Number(value) : null; // ✅ convert ke number/null
          } else {
            newData[targetIndex][fieldName] = value;
          }

          if (fieldName === 'doc_status') {
            newData[targetIndex]['status_pe'] = getStatusPE(value);
          }
        }
      });
    });

    setForms(newData);
  };

  const applyToAll = (column: keyof Row, value: string) => {
    setForms((prevForms) =>
      prevForms.map((row) => {
        const isOrderFilled = row.order !== null; // ✅ cek integer/null
        if (!isOrderFilled) return row;

        const updatedRow: Row = { ...row, [column]: value };

        // Jika mengubah doc_status, update status_pe juga
        if (column === 'doc_status') {
          updatedRow.status_pe = getStatusPE(value);
        }

        return updatedRow;
      })
    );

    setMessage(
      `✅ Column ${column.toUpperCase()} column updated successfully for rows with an ORDER.`
    );
  };

  return (
    <div className="bg-[#141414] min-h-full w-full">
      <form>
        <div className="bg-[#292929] px-3 pt-3 pb-6 max-h-auto overflow-visible w-full rounded-lg">
          
          <div className="w-full overflow-auto max-h-[70vh] border border-gray-500 rounded-md shadow-inner dark-scroll mt-2">
            <table
              className="
    w-full whitespace-nowrap table-auto text-[11px] leading-tight
    border-collapse
    border border-[#141414]
    [&_td]:border-[#141414]
    [&_th]:border-[#141414]
   "
            >
              <thead className="bg-gradient-to-t from-[#00838F] to-[#00838F] text-white text-xs text-center">
                <tr>
                <th className="border px-2 py-2 w-[100px] min-w-[100px] max-w-[120px]">  A/C Reg</th>
                  <th className="border px-2 py-2 w-[150px] min-w-[150px] max-w-[120px]"> Customer </th>    
                  <th className="border px-2 py-2 w-[180px] min-w-[180px] max-w-[120px]"> Type Maintenance </th>  
                  <th className="border px-2 py-2 w-[150px] min-w-[150px] max-w-[120px]"> Project Manager</th>
                  <th className="border px-2 py-2 w-[100px] min-w-[100px] max-w-[120px]">  Start</th>
                  <th className="border px-2 py-2 w-[100px] min-w-[100px] max-w-[120px]"> Plan RTS</th>
                </tr>
              </thead>

              <tbody>
                {forms.map((row, index) => (
                  <tr key={index} className="bg-[#1F262A] text-center">
                    
{/* A/C Reg */}

<td className="border px-2 py-2 min-w-[90px] align-top">
  <textarea
    ref={(el) => {
      if (!inputRefs.current[index])
        inputRefs.current[index] = [];
      inputRefs.current[index][0] = el;
    }}
    name="ac_reg"
    value={row.ac_reg}
    onChange={(e) => handleChange(e, index)}
    onPaste={(e) => handlePasteCell(e, index, 'ac_reg')}
    className="border border-teal-500 text-white bg-[#292929]
    rounded px-1 py-1 w-full
    min-h-[25px]
    resize-y
    whitespace-pre-wrap break-words"
  />
</td>

                    
                    {/* custm */}
<td className="border px-2 py-2 min-w-[90px] align-top">
  <textarea
    ref={(el) => {
      if (!inputRefs.current[index])
        inputRefs.current[index] = [];
      inputRefs.current[index][1] = el;
    }}
    name="customer"
    value={row.customer}
    onChange={(e) => handleChange(e, index)}
    onPaste={(e) => handlePasteCell(e, index, 'customer')}
    className="border border-teal-500 text-white bg-[#292929]
    rounded px-1 py-1 w-full
    min-h-[25px]
    resize-y
    whitespace-pre-wrap break-words"
  />
</td>

                    {/* maint */}
<td className="border px-2 py-2 min-w-[90px] align-top">
  <textarea
    ref={(el) => {
      if (!inputRefs.current[index])
        inputRefs.current[index] = [];
      inputRefs.current[index][2] = el;
    }}
    name="maint"
    value={row.maint}
    onChange={(e) => handleChange(e, index)}
    onPaste={(e) => handlePasteCell(e, index, 'maint')}
    className="border border-teal-500 text-white bg-[#292929]
    rounded px-1 py-1 w-full
    min-h-[25px]
    resize-y
    whitespace-pre-wrap break-words"
  />
</td>

                    {/* po */}
<td className="border px-2 py-2 min-w-[90px] align-top">
  <textarea
    ref={(el) => {
      if (!inputRefs.current[index])
        inputRefs.current[index] = [];
      inputRefs.current[index][3] = el;
    }}
    name="po"
    value={row.po}
    onChange={(e) => handleChange(e, index)}
    onPaste={(e) => handlePasteCell(e, index, 'po')}
    className="border border-teal-500 text-white bg-[#292929]
    rounded px-1 py-1 w-full
    min-h-[25px]
    resize-y
    whitespace-pre-wrap break-words"
  />
</td>

                    {/* start*/}
<td className="border px-2 py-1 min-w-[90px]">
  <input
    ref={(el) => {
      if (!inputRefs.current[index])
        inputRefs.current[index] = [];
      inputRefs.current[index][4] = el;
    }}
    type="date"
    name="start"
    value={row.start ?? ''}
    onChange={(e) => handleChange(e, index)}
    onPaste={(e) => handlePasteCell(e, index, 'start')}
    className={`
      border  rounded-md h-[38px]
      px-0.5 py-0.5 text-[11px]
      bg-[#292929] border-teal-500 
      ${row.start ? 'text-white' : 'text-transparent'}
      [&::-webkit-calendar-picker-indicator]:invert
    `}
  />
</td>
{/* rts*/}
<td className="border px-2 py-1 min-w-[90px]">
  <input
    ref={(el) => {
      if (!inputRefs.current[index])
        inputRefs.current[index] = [];
      inputRefs.current[index][5] = el;
    }}
    type="date"
    name="rts"
    value={row.rts ?? ''}
    onChange={(e) => handleChange(e, index)}
    onPaste={(e) => handlePasteCell(e, index, 'rts')}
    className={`
      border  rounded-md h-[38px]
      px-0.5 py-0.5 text-[11px]
      bg-[#292929] border-teal-500 
      ${row.rts ? 'text-white' : 'text-transparent'}
      [&::-webkit-calendar-picker-indicator]:invert
    `}
  />
</td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center items-center w-full mt-2 gap-2">
              <button
                type="button"
                onClick={addFiveRows}
                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm"
              >
                + Add 5 Rows
              </button>

              {/* Tombol Input */}
              <button
                type="button" // <-- penting: ganti dari "submit" ke "button"
                onClick={handleSubmit} // <-- panggil manual
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Input Data'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {message && <div className="text-white mt-3 text-sm">{message}</div>}
    </div>
  );
}

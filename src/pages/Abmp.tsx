import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

type AbmpRow = {
  id: number;
  ac_reg: string;
  rts: string;
};

const calcTAT = (rts?: string) => {
  if (!rts) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rtsDate = new Date(rts);
  rtsDate.setHours(0, 0, 0, 0);

  const diffMs = rtsDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const CUSTOMER_OPTIONS = [
  'GARUDA INDONESIA',
  'CITILINK',
  'NON GA/CTV',
  'NON PROJECT',
  'FIJI',
  'THAI VIETJET',
];

const LINE_OPTIONS = [
  'H1 L1',
  'H1 L2',
  'H3 L1',
  'H3 L2',
  'H3 L3',
  'H4 L1',
  'H4 L2',
  'H4 L3',
];

export default function Abmp() {
  const [pdfId, setPdfId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [tableData, setTableData] = useState<AbmpRow[]>([]);
  const [loadingTable, setLoadingTable] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [rows, setRows] = useState<
    { ac_reg: string; customer: string; rts: string | null }[]
  >([{ ac_reg: '', customer: '', rts: null }]);

  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showViewData, setShowViewData] = useState(false);
  const [viewRows, setViewRows] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showTable, setShowTable] = useState(false); // default collapse

  ///untuk tabel ac unik
  const fetchViewData = async () => {
    let allRows = [];
    let from = 0;
    const limit = 1000;
    let moreData = true;

    while (moreData) {
      const { data, error } = await supabase
        .from('v_project_with_rts_unique')
        .select('*')
        .eq('archived', false)
        .range(from, from + limit - 1);

      if (error) break;

      if (data.length > 0) {
        allRows = [...allRows, ...data];
        from += limit;

        if (data.length < limit) moreData = false;
      } else {
        moreData = false;
      }
    }

    const uniqAcReg = Array.from(
      new Set(allRows.map((r) => r.ac_reg).filter(Boolean))
    );

    const summary = uniqAcReg.map((acReg) => {
      const rowsByAc = allRows.filter((r) => r.ac_reg === acReg);

      return {
        ac_reg: acReg,
        customer: rowsByAc[0]?.customer || '',
        rts: rowsByAc[0]?.rts || '',
      };
    });

    // 🔥 SORT SAMA SEPERTI ABMP
    summary.sort((a, b) => {
      const tatA = calcTAT(a.rts);
      const tatB = calcTAT(b.rts);

      if (tatA === null) return 1;
      if (tatB === null) return -1;

      if (tatA < 0 && tatB >= 0) return 1;
      if (tatB < 0 && tatA >= 0) return -1;

      return tatA - tatB;
    });

    setViewRows(summary);
  };

  ////sortir rts
  const sortedTableData = [...tableData].sort((a, b) => {
    const tatA = calcTAT(a.rts);
    const tatB = calcTAT(b.rts);

    // 1️⃣ RTS kosong → paling bawah
    if (tatA === null) return 1;
    if (tatB === null) return -1;

    // 2️⃣ TAT negatif pindah ke bawah
    if (tatA < 0 && tatB >= 0) return 1;
    if (tatB < 0 && tatA >= 0) return -1;

    // 3️⃣ Sama-sama valid → urut dari TAT terkecil
    return tatA - tatB;
  });

  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR87GYwPPCTGhIYZy-7p5SkOYqTaGpBUbbkvZTDRUMqDBOZvnhra6l4_N3O1PwKr2EL2qD9ReOb5Jac/pub?output=csv';

  // ===== FORMAT DATE =====
  const formatDate = (raw: string) => {
    if (!raw) return raw;

    if (!isNaN(Number(raw))) {
      const serial = Number(raw);
      const baseDate = new Date(1899, 11, 30);
      baseDate.setDate(baseDate.getDate() + serial - 1);
      return baseDate
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/ /g, '-');
    }

    const dmMatch = raw.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmMatch) {
      const d = new Date(
        Number(dmMatch[3]),
        Number(dmMatch[2]) - 1,
        Number(dmMatch[1])
      );
      if (!isNaN(d.getTime())) {
        return d
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          .replace(/ /g, '-');
      }
    }

    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/ /g, '-');
    }

    return raw;
  };

  const handleDeleteSelected = async () => {
    const ok = window.confirm(
      `Hapus ${selectedIds.length} baris yang dipilih?\nData tidak bisa dikembalikan.`
    );

    if (!ok) return;

    const { error } = await supabase
      .from('abmp')
      .delete()
      .in('id', selectedIds);

    if (error) {
      console.error(error.message);
      alert('Gagal menghapus data');
      return;
    }

    // 🔥 Update UI
    setTableData((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
    setSelectedIds([]);
  };

  ////tabel kiri
  const updateCell = async (
    id: string,
    field: 'ac_reg' | 'customer' | 'rts',
    value: any
  ) => {
    const { error } = await supabase
      .from('abmp')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error(`Failed update ${field}`, error.message);
    }
  };

  // ===== UPDATE PDF FROM GOOGLE SHEET =====
  const handleUpdate = async () => {
    try {
      // ===== 1️⃣ Ambil data dari Google Sheet =====
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const rows = text.split('\n').map((r) => r.split(','));
      const lastRow = rows[rows.length - 1];

      if (lastRow && lastRow[2] && lastRow[3]) {
        const dateCol = lastRow[2].trim();
        const pdfCol = lastRow[3].trim();

        setPdfId(pdfCol);
        localStorage.setItem('abmpPdfId', pdfCol);
        setLastUpdate(formatDate(dateCol));

        setMessage('✅ ABMP updated!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('⚠️ Data tidak lengkap di baris terakhir.');
      }

      // ===== 2️⃣ Update tableData ke Supabase =====
      // Ambil semua row dari state
      const payload = tableData.map(({ id, ac_reg, customer, rts }) => ({
        id,
        ac_reg,
        customer,
        rts,
      }));

      for (const row of payload) {
        // Update setiap row berdasarkan id
        const { error } = await supabase
          .from('abmp')
          .update({
            ac_reg: row.ac_reg,
            customer: row.customer,
            rts: row.rts,
          })
          .eq('id', row.id);

        if (error) console.error('Failed to update row', row.id, error.message);
      }
    } catch (err) {
      console.error(err);
      setMessage(
        '❌ Gagal mengambil data dari Google Sheet atau update Supabase.'
      );
    }
  };

  const handleDeleteExpiredRTS = async () => {
    const expiredDate = new Date();

    expiredDate.setMonth(expiredDate.getMonth() - 3);

    const cutoffDate = expiredDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('abmp')
      .delete()
      .lt('rts', cutoffDate);

    if (error) {
      console.error(error);
      alert('Failed to delete expired RTS');
      return;
    }

    alert('Expired RTS data deleted successfully');

    fetchData();
  };

  // ===== FETCH TABLE FROM SUPABASE =====
  const fetchTable = async () => {
    setLoadingTable(true);
    const { data, error } = await supabase
      .from('abmp')
      .select('id, ac_reg, customer, rts')
      .order('ac_reg', { ascending: true });

    if (!error && data) {
      setTableData(data);
    }
    setLoadingTable(false);
  };

  // ===== INIT =====
  useEffect(() => {
    handleUpdate();
    fetchTable();
  }, []);

  const googleFormUrl = 'https://forms.gle/3KxHarsbBNLpeNE29';
  const pdfUrl = pdfId
    ? `https://drive.google.com/file/d/${pdfId}/preview`
    : null;

  return (
    <div className="p-1 space-y-2">
      {/* ACTION BAR */}
      <div className="flex items-center gap-2">
        <div className="flex justify-between items-center mb-2"></div>

        <button
          title={showTable ? 'Hide aircraft table' : 'Show aircraft table'}
          onClick={() => setShowTable((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md bg-[#00919f] text-white hover:bg-cyan-700"
        >
          <span>{showTable ? '▼' : '▶'}</span>
          <span>{showTable ? 'Hide Table' : 'Show Table'}</span>
        </button>
        <button
          title="Add new aircraft RTS"
          onClick={() => setShowModal(true)}
          className="px-3 py-1 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
        >
          + Add
        </button>

        <button
          title="Delete A/C RTS expired more than 3 months"
          onClick={() => {
            setConfirmMessage(
              'Delete all records with RTS expired more than 3 months?'
            );

            setPendingAction(() => handleDeleteExpiredRTS);

            setShowConfirmModal(true);
          }}
          className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
        >
          - Exp RTS
        </button>

        <button
          disabled={selectedIds.length === 0}
          onClick={handleDeleteSelected}
          className={`px-3 py-1 text-sm font-semibold rounded-lg shadow
      ${
        selectedIds.length === 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-red-600 text-white hover:bg-red-700'
      }
    `}
        >
          🗑 Del
        </button>

        <a
          href={googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
        >
          Upload ABMP
        </a>

        <button
          onClick={handleUpdate}
          className="px-3 py-1 text-sm font-semibold bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 shadow"
        >
          Update
        </button>

        {lastUpdate && (
          <span className="text-sm text-gray-400">
            Last Update: <strong>{lastUpdate}</strong>
          </span>
        )}

        {message && (
          <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded border border-green-300 shadow-sm">
            {message}
          </span>
        )}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px] p-4 space-y-3 shadow-lg">
              <h2 className="text-sm font-bold">Add ABMP Data</h2>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 ">AC REG</th>
                    <th className="border px-2 py-1">Location</th> {/* baru */}
                    <th className="border px-2 py-1">Customer</th> {/* baru */}
                    <th className="border px-2 py-1">RTS</th>
                    <th className="border px-2 py-1 w-10">❌</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border px-1 py-1">
                        <input
                          value={row.ac_reg}
                          onChange={(e) => {
                            const copy = [...rows];
                            copy[idx].ac_reg = e.target.value.toUpperCase();
                            setRows(copy);
                          }}
                          className="
                          w-full border border-transparent
                          hover:border-teal-500 rounded px-1 py-0.5 text-[11px]
                          text-black bg-white
                        "
                        />
                      </td>

                      <td className="border px-1 py-1">
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={row.line || ''}
                            onChange={(e) => {
                              const copy = [...rows];
                              copy[idx].line = e.target.value.toUpperCase();
                              setRows(copy);
                            }}
                            placeholder=" "
                            className="
        w-full border border-transparent
        hover:border-teal-500 rounded px-1 py-0.5 text-[11px]
        text-black bg-white
      "
                            list={`line_list_${idx}`}
                          />

                          <datalist id={`line_list_${idx}`}>
                            {LINE_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </div>
                      </td>

                      <td className="border px-1 py-1">
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={row.customer}
                            onChange={(e) => {
                              const copy = [...rows];
                              copy[idx].customer = e.target.value.toUpperCase();
                              setRows(copy);
                            }}
                            placeholder=" "
                            className="
        w-full border border-transparent
        hover:border-teal-500 rounded px-1 py-0.5 text-[11px]
        text-black bg-white
      "
                            list={`customer_list_${idx}`}
                          />

                          <datalist id={`customer_list_${idx}`}>
                            {CUSTOMER_OPTIONS.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                        </div>
                      </td>

                      <td className="border px-1 py-1">
                        {/* RTS DATE PICKER */}
                        <input
                          type="date"
                          value={row.rts ?? ''}
                          onChange={(e) => {
                            const copy = [...rows];
                            copy[idx].rts = e.target.value || null;
                            setRows(copy);
                          }}
                          className={`
                          border border-transparent rounded-md px-0.5 py-0.5 text-[11px]
                          bg-white hover:border-teal-500
                          ${row.rts ? 'text-black' : 'text-transparent'}
                          [&::-webkit-calendar-picker-indicator text-gray-600]:invert
                        `}
                        />
                      </td>

                      <td className="border text-center">
                        <button
                          onClick={() =>
                            setRows(rows.filter((_, i) => i !== idx))
                          }
                          className="text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between">
                <button
                  onClick={() =>
                    setRows([
                      ...rows,
                      { ac_reg: '', line: '', customer: '', rts: '' },
                    ])
                  }
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                >
                  + Add Row
                </button>

                <div className="space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-xs px-3 py-1 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const payload = rows
                        .filter((r) => r.ac_reg && r.rts)
                        .map((r) => ({
                          ac_reg: r.ac_reg,
                          line: r.line,
                          customer: r.customer,
                          rts: r.rts,
                        }));

                      await supabase.from('abmp').insert(payload);

                      setShowModal(false);
                      setRows([{ ac_reg: '', rts: '' }]);
                      fetchTable(); // refresh tabel kiri
                    }}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-12 gap-2 h-[80vh]">
        {showViewData && (
          <div className="col-span-2 border rounded-lg overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="border px-2 py-1">No</th>
                  <th className="border px-2 py-1">AC REG</th>
                </tr>
              </thead>

              <tbody>
                {viewRows.map((row, i) => (
                  <tr
                    key={row.ac_reg}
                    className={`
              ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              hover:bg-slate-200
              transition-colors
            `}
                  >
                    <td className="border px-2 py-1 text-center">{i + 1}</td>

                    <td className="border px-2 py-1 text-center">
                      {row.ac_reg}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* KIRI - TABLE */}
        {showTable && (
          <div className="col-span-3  rounded-lg overflow-auto">
            {loadingTable ? (
              <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : (
              <table className="w-full text-xs border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#00919f] text-white text-xs font-semibold text-center">
                    <th className=" px-2 py-1 w-[30px]">No</th>
                    <th className=" px-2 py-1  w-[70px]">A/C Reg</th>
                    <th className=" px-2 py-1 w-[60px]">Location</th>
                    <th className=" px-2 py-1 w-[80px]">Customer</th>
                    <th className=" px-2 py-1 w-[95px]">RTS</th>
                    <th className=" px-2 py-1 w-[40px]">TAT</th>

                    <th className=" px-2 py-1 w-[35px]">🗑️</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedTableData.map((row, rowIndex) => {
                    const today = new Date();
                    const rtsDate = row.rts ? new Date(row.rts) : null;
                    const isPast = rtsDate && rtsDate < today;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setActiveRow(row.id)}
                        className={`
            cursor-pointer
            ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
            hover:bg-slate-200
            ${activeRow === row.id ? 'bg-teal-200' : ''}
            transition-colors
          `}
                      >
                        <td className=" px-2 py-1 bg-inherit text-center">
                          {rowIndex + 1}
                        </td>

                        {/* AC REG editable */}
                        <td
                          className=" px-1 py-1 bg-inherit text-center "
                          onClick={() => {
                            setEditingCell({ id: row.id, field: 'ac_reg' });
                            setTempValue(row.ac_reg || '');
                          }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell?.field === 'ac_reg' ? (
                            <input
                              value={tempValue}
                              onChange={(e) =>
                                setTempValue(e.target.value.toUpperCase())
                              }
                              onBlur={() => {
                                setTableData((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, ac_reg: tempValue }
                                      : r
                                  )
                                );
                                updateCell(row.id, 'ac_reg', tempValue); // 🔹 Supabase update
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setTableData((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, ac_reg: tempValue }
                                        : r
                                    )
                                  );
                                  updateCell(row.id, 'ac_reg', tempValue); // 🔹 Supabase update
                                  setEditingCell(null);
                                }
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full bg-transparent px-1 py-0.5 text-[11px] rounded-md  focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                            />
                          ) : (
                            row.ac_reg
                          )}
                        </td>

                        <td
                          className=" px-1 py-1 bg-inherit text-center"
                          onClick={() => {
                            setEditingCell({ id: row.id, field: 'line' });
                            setTempValue(row.line || '');
                          }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell?.field === 'line' ? (
                            <>
                              <input
                                value={tempValue}
                                onChange={async (e) => {
                                  const finalValue =
                                    e.target.value.toUpperCase();

                                  setTempValue(finalValue);

                                  setTableData((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, line: finalValue }
                                        : r
                                    )
                                  );

                                  await updateCell(row.id, 'line', finalValue);
                                }}
                                onBlur={() => {
                                  setEditingCell(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingCell(null);
                                  }

                                  if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                                autoFocus
                                list={`line_list_${row.id}`}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] rounded-md  focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                              />

                              <datalist id={`line_list_${row.id}`}>
                                {LINE_OPTIONS.map((option) => (
                                  <option key={option} value={option} />
                                ))}
                              </datalist>
                            </>
                          ) : (
                            row.line || '-'
                          )}
                        </td>
                        <td
                          className=" px-1 py-1 bg-inherit text-center"
                          onClick={() => {
                            setEditingCell({ id: row.id, field: 'customer' });
                            setTempValue(row.customer || '');
                          }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell?.field === 'customer' ? (
                            <>
                              <input
                                value={tempValue}
                                onChange={async (e) => {
                                  const finalValue =
                                    e.target.value.toUpperCase();

                                  setTempValue(finalValue);

                                  setTableData((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, customer: finalValue }
                                        : r
                                    )
                                  );

                                  await updateCell(
                                    row.id,
                                    'customer',
                                    finalValue
                                  );
                                }}
                                onBlur={() => {
                                  setEditingCell(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingCell(null);
                                  }

                                  if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                                autoFocus
                                list={`customer_list_${row.id}`}
                                className="w-full bg-transparent px-1 py-0.5 text-[11px] rounded-md  focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                              />

                              <datalist id={`customer_list_${row.id}`}>
                                {CUSTOMER_OPTIONS.map((option) => (
                                  <option key={option} value={option} />
                                ))}
                              </datalist>
                            </>
                          ) : (
                            row.customer || '-'
                          )}
                        </td>

                        {/* RTS editable */}
                        <td
                          className={`w-[100px]  px-1 py-1 bg-inherit text-center ${
                            isPast ? 'text-red-600 font-semibold' : ''
                          }`}
                          onClick={() => {
                            setEditingCell({ id: row.id, field: 'rts' });
                            setTempValue(row.rts || '');
                          }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell?.field === 'rts' ? (
                            <input
                              type="date"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onBlur={() => {
                                setTableData((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, rts: tempValue }
                                      : r
                                  )
                                );
                                updateCell(row.id, 'rts', tempValue);
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setTableData((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, rts: tempValue }
                                        : r
                                    )
                                  );
                                  updateCell(row.id, 'rts', tempValue); // 🔹 Supabase update
                                  setEditingCell(null);
                                }
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              autoFocus
                              className="w-full bg-transparent px-1 py-0.5 text-[11px] rounded-md  focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                            />
                          ) : rtsDate ? (
                            rtsDate
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                              .replace(/ /g, '-')
                          ) : (
                            ''
                          )}
                        </td>
                        <td
                          className={` px-1 py-1 text-center font-semibold ${
                            calcTAT(row.rts) !== null && calcTAT(row.rts) < 0
                              ? 'text-red-600'
                              : calcTAT(row.rts) !== null &&
                                calcTAT(row.rts) <= 3
                              ? 'text-orange-500'
                              : 'text-green-600'
                          }`}
                        >
                          {calcTAT(row.rts) !== null
                            ? calcTAT(row.rts) < 0
                              ? 'RTS'
                              : calcTAT(row.rts)
                            : '-'}
                        </td>

                        <td className=" px-1 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedIds((prev) =>
                                e.target.checked
                                  ? [...prev, row.id]
                                  : prev.filter((id) => id !== row.id)
                              );
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        {/* KANAN - PDF */}
        <div
          className={` rounded-lg overflow-hidden ${
            showTable ? 'col-span-9' : 'col-span-12'
          }`}
        >
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              allow="autoplay"
              title="ABMP PDF"
            />
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Confirmation
            </h2>

            <p className="mb-4 text-gray-700">{confirmMessage}</p>

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
                    await pendingAction();
                    setPendingAction(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

interface PDSRow {
  id: number;
  pds_no: string;
  ac_reg: string;
  order: number;
  description: string;
  pn: string;
  sn: string;
  location: string;
  status_job: string;
}

const COLUMN_ORDER = [
  { key: 'no', label: 'NO' },
  { key: 'pds_no', label: 'PDS NO' },
  { key: 'ac_reg', label: 'A/C REG' },
  { key: 'order', label: 'ORDER' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'pn', label: 'P/N' },
  { key: 'sn', label: 'S/N' },
  { key: 'location', label: 'ITEM' },
  { key: 'status_job', label: 'STATUS' },
];

const columnWidths: Record<string, string> = {
  no: 'min-w-[50px]',
  pds_no: 'min-w-[90px]',
  ac_reg: 'min-w-[70px]',
  order: 'min-w-[90px]',
  description: 'min-w-[350px]',
  pn: 'min-w-[120px]',
  sn: 'min-w-[120px]',
  location: 'min-w-[120px]',
  status_job: 'min-w-[120px]',
};

export default function DailyMenuPDS() {
  const [rows, setRows] = useState<PDSRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 100;

  //-------------------------------------------------------
  // Fetch Data
  //-------------------------------------------------------

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('pds_view')
      .select('*')
      .order('pds_no', { ascending: false });

    if (!error && data) {
      setRows(data as PDSRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  //-------------------------------------------------------
  // Filter
  //-------------------------------------------------------

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;

    const keyword = searchTerm.toLowerCase();

    return rows.filter((row) => {
      return (
        String(row.order).toLowerCase().includes(keyword) ||
        (row.pds_no ?? '').toLowerCase().includes(keyword) ||
        (row.ac_reg ?? '').toLowerCase().includes(keyword) ||
        (row.description ?? '').toLowerCase().includes(keyword) ||
        (row.pn ?? '').toLowerCase().includes(keyword) ||
        (row.sn ?? '').toLowerCase().includes(keyword) ||
        (row.location ?? '').toLowerCase().includes(keyword) ||
        (row.status_job ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [rows, searchTerm]);

  //-------------------------------------------------------
  // Pagination
  //-------------------------------------------------------

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-[#141414] w-full h-full">
      <div className="bg-[#292929] px-3 pt-3 pb-6 max-h-[100vh] overflow-hidden w-full rounded-lg">

        {/* ================= HEADER ================= */}

        <div className="mb-3 flex flex-wrap gap-2 items-center">

          

          <input
            type="text"
            placeholder="Search PDS No / Order / A/C / Description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 border border-gray-500 bg-[#292929] text-white rounded-md px-2 py-1 text-[11px]"
          />
<button
            onClick={fetchData}
            className="border border-gray-500 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 shadow text-[11px]"
          >
            Refresh
          </button>

          <div className="text-white text-[11px] border border-gray-600 rounded px-2 py-1">
            Total :
            <span className="ml-1 font-semibold text-cyan-400">
              {filteredRows.length}
            </span>
          </div>

        </div>

        {/* ================= TABLE ================= */}

        <div className="w-full overflow-auto max-h-[70vh] rounded-md shadow-inner dark-scroll">

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

                {COLUMN_ORDER.map((col) => (

                  <th
                    key={col.key}
                    className="px-1 py-1 border-l border-[#141414]"
                  >
                    {col.label}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={COLUMN_ORDER.length}
                    className="text-center text-white py-8"
                  >
                    Loading...
                  </td>

                </tr>

              ) : paginatedRows.length === 0 ? (

                <tr>

                  <td
                    colSpan={COLUMN_ORDER.length}
                    className="text-center text-white py-8"
                  >
                    No Data Found
                  </td>

                </tr>

              ) : (

                paginatedRows.map((row, rowIndex) => (

                  <tr
                    key={row.id}
                    className={`
                      text-white
                      cursor-pointer
                      transition-colors duration-150
                      border-b border-white/30
                      ${
                        rowIndex % 2 === 0
                          ? 'bg-[#1e1e1e]'
                          : 'bg-[#292929]'
                      }
                      hover:bg-[#2e3f42]
                    `}
                  >
                    {COLUMN_ORDER.map(({ key }) => (
                      <td
                        key={key}
                        className={`px-1 py-2 border-l border-[#141414]
                          ${columnWidths[key] || ''}
                          ${
                            key === 'description'
                              ? 'text-left break-words whitespace-normal'
                              : 'text-center'
                          }`}
                      >
                        {key === 'no' ? (
                          (currentPage - 1) * rowsPerPage + rowIndex + 1
                        ) : key === 'status_job' ? (
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-white
                              ${
                                row.status_job === 'OPEN'
                                  ? 'bg-red-500'
                                  : row.status_job === 'PROGRESS'
                                  ? 'bg-yellow-500'
                                  : row.status_job === 'CLOSED'
                                  ? 'bg-green-500'
                                  : 'bg-gray-500'
                              }`}
                          >
                            {row.status_job || '-'}
                          </span>
                        ) : key === 'location' ? (
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-white
                              ${
                                row.location === 'AWAITING'
                                  ? 'bg-gray-500'
                                  : row.location === 'INCOMING'
                                  ? 'bg-blue-500'
                                  : row.location === 'WIP'
                                  ? 'bg-orange-500'
                                  : row.location === 'FSB'
                                  ? 'bg-purple-500'
                                  : row.location === 'RELEASE'
                                  ? 'bg-green-600'
                                  : 'bg-gray-700'
                              }`}
                          >
                            {row.location || '-'}
                          </span>
                        ) : (
                          (row as any)[key] ?? '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))

              )}

            </tbody>

          </table>

        </div>
        {/* ================= PAGINATION ================= */}

        <div className="flex items-center justify-between mt-3">
          <div className="text-[11px] text-gray-300">
            Showing{" "}
            <span className="text-cyan-400 font-semibold">
              {filteredRows.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="text-cyan-400 font-semibold">
              {Math.min(currentPage * rowsPerPage, filteredRows.length)}
            </span>{" "}
            of{" "}
            <span className="text-cyan-400 font-semibold">
              {filteredRows.length}
            </span>{" "}
            records
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 rounded border border-gray-600 bg-[#1f1f1f] text-white disabled:opacity-40"
            >
              ◁
            </button>

            <span className="text-white text-[11px] px-3">
              Page {currentPage} / {Math.max(totalPages, 1)}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-gray-600 bg-[#1f1f1f] text-white disabled:opacity-40"
            >
               ▷
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
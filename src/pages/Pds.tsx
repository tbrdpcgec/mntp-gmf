import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';

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
  scan_link: string | null;
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
  { key: 'scan_link', label: 'SCAN PDS' },
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
  scan_link: 'min-w-[130px]',
};

export default function DailyMenuPDS() {
  const [rows, setRows] = useState<PDSRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [openUpload, setOpenUpload] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [showOrderSuggestions, setShowOrderSuggestions] = useState(false);
  const [selectedPdsNo, setSelectedPdsNo] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const rowsPerPage = 100;

  //-------------------------------------------------------

  const handleUpdate = async (id, field, value) => {
    try {
      const { error } = await supabase
        .from('pds')
        .update({
          [field]: value,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error(err);
    }
  };

  //----------------------------------------

  const filteredOrders = rows
    .filter((r) => String(r.order).includes(selectedOrder))
    .slice(0, 10);

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

  const GOOGLE_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbzT2uuXwSp0SzJDHAuMCdi8_3llGfNrSDolxxpokbFxLk8FH9jekn6BACozw8JK9l7m/exec';

  const handleUpload = async () => {
    if (!selectedOrder) {
      Swal.fire({
        icon: 'warning',
        title: 'Order belum dipilih',
      });
      return;
    }

    if (!selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih file PDF terlebih dahulu',
      });
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      Swal.fire({
        icon: 'error',
        title: 'File harus PDF',
      });
      return;
    }

    const row = rows.find((r) => String(r.order) === selectedOrder);

    if (!row) {
      Swal.fire({
        icon: 'error',
        title: 'Order tidak ditemukan',
      });
      return;
    }

    setUploading(true);

    try {
      //--------------------------------------------------
      // Rename File
      //--------------------------------------------------

      const fileName = row.pds_no.replace(/\//g, '_') + '.pdf';

      //--------------------------------------------------
      // Convert PDF ke Base64
      //--------------------------------------------------

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];

          //--------------------------------------------------
          // Upload ke Apps Script
          //--------------------------------------------------

          //--------------------------------------------------
          // Upload ke Apps Script
          //--------------------------------------------------

          const formData = new URLSearchParams();

          formData.append('order', String(row.order));
          formData.append('pds', row.pds_no);

          formData.append('fileName', fileName);
          formData.append('mimeType', selectedFile.type);
          formData.append('fileData', base64);

          const res = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
          });

          const text = await res.text();

          console.log('Response:');
          console.log(text);

          const result = JSON.parse(text);

          console.log('1. JSON parsed');

          if (!result.success) {
            throw new Error(result.error);
          }

          console.log('2. Sebelum update Supabase');

          const { error } = await supabase
            .from('pds')
            .update({
              scan_link: result.url,
            })
            .eq('id', row.id);

          console.log('3. Update Supabase selesai');

          if (error) {
            console.log(error);
            throw error;
          }

          console.log('4. Sebelum setUploading');

          setUploading(false);

          console.log('5. uploading false');

          setOpenUpload(false);

          setSelectedOrder('');
          setSelectedFile(null);
          setShowOrderSuggestions(false);

          console.log('6. fetchData');

          await fetchData();

          console.log('7. fetchData selesai');

          await Swal.fire({
            icon: 'success',
            title: 'Scan PDS Uploaded',
            html: `
              <table style="width:100%;text-align:left">
                <tr>
                  <td><b>Order</b></td>
                  <td>${row.order}</td>
                </tr>
          
                <tr>
                  <td><b>PDS</b></td>
                  <td>${row.pds_no}</td>
                </tr>
          
                <tr>
                  <td><b>File</b></td>
                  <td>${fileName}</td>
                </tr>
              </table>
            `,
            confirmButtonText: 'Open Scan',
            showCancelButton: true,
            cancelButtonText: 'Close',
            confirmButtonColor: '#00838f',
          }).then((r) => {
            if (r.isConfirmed) {
              window.open(result.url, '_blank');
            }
          });
        } catch (err: any) {
          setUploading(false);

          Swal.fire({
            icon: 'error',

            title: 'Upload Failed',

            text: err.message,
          });
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setUploading(false);

      Swal.fire({
        icon: 'error',

        title: 'Error',

        text: err.message,
      });
    }
  };
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
            onClick={() => {
              setSelectedOrder('');
              setSelectedFile(null);
              setOpenUpload(true);
            }}
            className="border border-gray-500 rounded-md bg-green-600 hover:bg-green-700 text-white px-3 py-1 shadow text-[11px]"
          >
            Upload Scan
          </button>

          <button
            type="button"
            onClick={() =>
              window.open(
                'https://drive.google.com/drive/folders/1SENb4_QGFlHc-SVSu1GC-rKKYkKulW-n?usp=drive_link',
                '_blank'
              )
            }
            className="border border-gray-500 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 shadow text-[11px]"
          >
            📁 Open Drive
          </button>

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
                      ${rowIndex % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#292929]'}
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
                        ) : key === 'description' ||
                          key === 'ac_reg' ||
                          key === 'pn' ||
                          key === 'sn' ? (
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
                              className="border bg-transparent rounded px-1 py-0.5 w-full text-[11px]"
                            />
                          ) : (
                            <div
                              className="w-full min-h-[18px] text-center break-words whitespace-normal cursor-text"
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setEditingCell({ id: row.id, field: key });
                              }}
                              title="Klik kanan untuk edit"
                            >
                              {row[key] || '\u00A0'}
                            </div>
                          )
                        ) : key === 'scan_link' ? (
                          row.scan_link ? (
                            <a
                              href={row.scan_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 underline"
                            >
                              📄 View
                            </a>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )
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
            Showing{' '}
            <span className="text-cyan-400 font-semibold">
              {filteredRows.length === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="text-cyan-400 font-semibold">
              {Math.min(currentPage * rowsPerPage, filteredRows.length)}
            </span>{' '}
            of{' '}
            <span className="text-cyan-400 font-semibold">
              {filteredRows.length}
            </span>{' '}
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

      {openUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#202020] rounded-lg shadow-xl w-[500px] border border-gray-700">
            {/* Header */}
            <div className="border-b border-gray-700 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">
                Upload Scan PDS
              </h2>
            </div>

            {/* Body */}
            <div className="p-5">
              <label className="block text-sm font-medium text-white mb-2">
                Order Number
              </label>

              <input
                type="text"
                value={selectedOrder}
                onChange={(e) => {
                  const value = e.target.value;

                  setSelectedOrder(value);

                  setShowOrderSuggestions(true);

                  const row = rows.find((r) => String(r.order) === value);

                  setSelectedPdsNo(row?.pds_no || '');
                }}
                placeholder="Type Order..."
                className="w-full rounded border border-gray-600 bg-[#292929] text-white px-3 py-2 text-sm"
              />

              {showOrderSuggestions &&
                selectedOrder &&
                filteredOrders.length > 0 && (
                  <div className="mt-1 max-h-40 overflow-auto rounded border border-gray-600 bg-[#292929]">
                    {filteredOrders.map((r) => (
                      <div
                        key={r.order}
                        onClick={() => {
                          setSelectedOrder(String(r.order));

                          setSelectedPdsNo(r.pds_no);

                          setShowOrderSuggestions(false);
                        }}
                        className="cursor-pointer px-3 py-2 text-white hover:bg-[#00838f]"
                      >
                        {r.order}
                      </div>
                    ))}
                  </div>
                )}

              {/* Card PDS */}

              {selectedPdsNo && (
                <div className="mt-4 rounded-md border border-cyan-700 bg-[#292929] p-4">
                  <div className="text-gray-400 text-xs">PDS Number</div>

                  <div className="text-cyan-400 font-bold text-xl">
                    {selectedPdsNo}
                  </div>
                </div>
              )}

              {/* Drag Area */}

              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();

                  setDragActive(false);

                  const file = e.dataTransfer.files[0];

                  if (!file) return;

                  if (file.type !== 'application/pdf') {
                    alert('Only PDF allowed');

                    return;
                  }

                  setSelectedFile(file);
                }}
                className={`
            mt-5
            border-2
            border-dashed
            rounded-lg
            text-center
            p-8
            transition-all
            ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-gray-600 hover:border-cyan-500'
            }
          `}
              >
                <input
                  id="pdfUpload"
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                <label htmlFor="pdfUpload" className="cursor-pointer block">
                  <div className="text-6xl">☁️</div>

                  <div className="mt-3 text-white font-semibold">
                    Drag & Drop PDF Here
                  </div>

                  <div className="text-gray-400 mt-2 text-sm">
                    or click to browse
                  </div>

                  <div className="inline-block mt-5 bg-[#00838f] hover:bg-[#006d77] rounded-md px-4 py-2 text-white">
                    Choose PDF
                  </div>

                  <div className="mt-3 text-xs text-gray-500">PDF Only</div>
                </label>
              </div>

              {/* Selected File */}

              {selectedFile && (
                <div className="mt-4 rounded-md border border-green-700 bg-green-900/20 p-3">
                  <div className="text-green-400 font-semibold">
                    ✅ File Selected
                  </div>

                  <div className="mt-1 text-white">{selectedFile.name}</div>

                  {selectedPdsNo && (
                    <>
                      <div className="mt-3 text-xs text-gray-400">
                        Google Drive Name
                      </div>

                      <div className="text-cyan-400 font-semibold">
                        📄 {selectedPdsNo.replace(/\//g, '_')}.pdf
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="border-t border-gray-700 px-5 py-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpenUpload(false);

                  setSelectedOrder('');

                  setSelectedPdsNo('');

                  setSelectedFile(null);

                  setShowOrderSuggestions(false);
                }}
                className="border border-gray-500 rounded px-4 py-2 text-white hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                disabled={uploading}
                onClick={handleUpload}
                className="bg-green-600 hover:bg-green-700 rounded px-5 py-2 text-white"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

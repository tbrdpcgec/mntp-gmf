import { useState, useEffect } from 'react';

import { FaArrowLeft } from 'react-icons/fa';
import { FaFolder } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

import ArchivedTCR from './ArchivedTCR';
import ArchivedTBK from './ArchivedTBK';
import ArchivedTBK1 from './ArchivedTBK1';
import ArchivedTJK from './ArchivedTJK';

export default function SpecialProject() {
  const [activePage, setActivePage] = useState('');
  const { email } = useAuth();
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!email) return;

    const loadFeatureAccess = async () => {
      const { data, error } = await supabase
        .from('user_sidebar_access')
        .select('feature')
        .eq('email', email);

      if (error) {
        console.error(error);
        return;
      }

      const features = [
        ...new Set(data?.map((row) => row.feature).filter(Boolean)),
      ];

      setAllowedFeatures(features);
    };

    loadFeatureAccess();
  }, [email]);

  const canAccess = (feature: string) =>
    allowedFeatures.includes('FULL ACCESS') ||
    allowedFeatures.includes(feature);

  return (
    <div className="p-2">
      {/* TAB ATAS */}
      {activePage && (
        <div className="flex gap-2 mt-0 mb-2">
          {/* Archived-TCR */}
          {canAccess('Archived-TCR') && (
            <button
              onClick={() => setActivePage('Archived-TCR')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'Archived-TCR'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <FaFolder size={12} />
              Archived-TCR
            </button>
          )}

          {/* Archived-TBK */}
          {canAccess('Archived-TBK') && (
            <button
              onClick={() => setActivePage('Archived-TBK')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'Archived-TBK'
                  ? 'bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <FaFolder size={12} />
              Archived-TBK
            </button>
          )}
          {/* Archived-TBK1 */}
          {canAccess('Archived-TBK1') && (
            <button
              onClick={() => setActivePage('Archived-TBK1')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'Archived-TBK1'
                  ? 'bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <FaFolder size={12} />
              Archived-TBK1
            </button>
          )}
          {/* Archived-TJK */}
          {canAccess('Archived-TJK') && (
            <button
              onClick={() => setActivePage('Archived-TJK')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'Archived-TJK'
                  ? 'bg-orange-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <FaFolder size={12} />
              Archived-TJK
            </button>
          )}

          {/* BACK */}
          <button
            onClick={() => setActivePage('')}
            className="
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              bg-red-600 hover:bg-red-700
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
            "
          >
            <FaArrowLeft size={11} />
            Back
          </button>
        </div>
      )}

      {/* HALAMAN PILIH MENU */}
      {!activePage && (
        <div className="grid grid-cols-4 gap-6 mt-6">
          {/* Archived-TCR */}
          {canAccess('Archived-TCR') && (
            <div
              onClick={() => setActivePage('Archived-TCR')}
              className="
              group
              bg-gradient-to-br from-blue-600 to-blue-800
              hover:from-blue-500 hover:to-blue-700
              cursor-pointer
              rounded-3xl
              p-10
              text-white
              shadow-xl
              transition-all duration-300
              hover:scale-105
              hover:-translate-y-2
              hover:shadow-2xl
            "
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <FaFolder
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-6"
                />

<div
                className="
    w-full
    text-center
    text-xl sm:text-2xl md:text-3xl
    font-bold
    tracking-wide
    overflow-hidden
    whitespace-nowrap
    truncate
  "
              >
                  Archived-TCR
                </div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TCR
                </div>
              </div>
            </div>
          )}

          {/* Archived-TBK */}
          {canAccess('Archived-TBK') && (
            <div
              onClick={() => setActivePage('Archived-TBK')}
              className="
              group
              bg-gradient-to-br from-green-600 to-green-800
              hover:from-green-500 hover:to-green-700
              cursor-pointer
              rounded-3xl
              p-10
              text-white
              shadow-xl
              transition-all duration-300
              hover:scale-105
              hover:-translate-y-2
              hover:shadow-2xl
            "
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <FaFolder
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-6"
                />

<div
                className="
    w-full
    text-center
    text-xl sm:text-2xl md:text-3xl
    font-bold
    tracking-wide
    overflow-hidden
    whitespace-nowrap
    truncate
  "
              >
                  Archived-TBK
                </div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TBK
                </div>
              </div>
            </div>
          )}

          {/* Archived-TBK1 */}
          {canAccess('Archived-TBK1') && (
            <div
              onClick={() => setActivePage('Archived-TBK1')}
              className="
              group
              bg-gradient-to-br from-purple-600 to-purple-800
              hover:from-purple-500 hover:to-purple-700
              cursor-pointer
              rounded-3xl
              p-10
              text-white
              shadow-xl
              transition-all duration-300
              hover:scale-105
              hover:-translate-y-2
              hover:shadow-2xl
            "
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <FaFolder
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-6"
                />

<div
                className="
    w-full
    text-center
    text-xl sm:text-2xl md:text-3xl
    font-bold
    tracking-wide
    overflow-hidden
    whitespace-nowrap
    truncate
  "
              >
                  Archived-TBK1
                </div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TBK1
                </div>
              </div>
            </div>
          )}

          {/* Archived-TJK */}
          {canAccess('Archived-TJK') && (
            <div
              onClick={() => setActivePage('Archived-TJK')}
              className="
              group
              bg-gradient-to-br from-orange-500 to-orange-700
              hover:from-orange-400 hover:to-orange-600
              cursor-pointer
              rounded-3xl
              p-10
              text-white
              shadow-xl
              transition-all duration-300
              hover:scale-105
              hover:-translate-y-2
              hover:shadow-2xl
            "
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <FaFolder
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-12"
                />

<div
                className="
    w-full
    text-center
    text-xl sm:text-2xl md:text-3xl
    font-bold
    tracking-wide
    overflow-hidden
    whitespace-nowrap
    truncate
  "
              >
                  Archived-TJK
                </div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TJK
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      {activePage === 'Archived-TCR' && canAccess('Archived-TCR') && (
        <ArchivedTCR />
      )}
      {activePage === 'Archived-TBK' && canAccess('Archived-TBK') && (
        <ArchivedTBK />
      )}
      {activePage === 'Archived-TBK1' && canAccess('Archived-TBK1') && (
        <ArchivedTBK1 />
      )}
      {activePage === 'Archived-TJK' && canAccess('Archived-TJK') && (
        <ArchivedTJK />
      )}
    </div>
  );
}

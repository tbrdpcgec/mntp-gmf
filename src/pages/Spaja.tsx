import { useState, useEffect } from 'react';

import { FaArrowLeft } from 'react-icons/fa';
import { RiMailSendLine } from 'react-icons/ri';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

import SpTCR from './SpTCR';
import SpTBK from './SpTBK';
import SpTBK1 from './SpTBK1';
import SpTJK from './SpTJK';

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
          {/* SP-TCR */}
          {canAccess('SP-TCR') && (
            <button
              onClick={() => setActivePage('SP-TCR')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'SP-TCR'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <RiMailSendLine size={12} />
              SP-TCR
            </button>
          )}

          {/* SP-TBK */}
          {canAccess('SP-TBK') && (
            <button
              onClick={() => setActivePage('SP-TBK')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'SP-TBK'
                  ? 'bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <RiMailSendLine size={12} />
              SP-TBK
            </button>
          )}
          {/* SP-TBK1 */}
          {canAccess('SP-TBK1') && (
            <button
              onClick={() => setActivePage('SP-TBK1')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'SP-TBK1'
                  ? 'bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <RiMailSendLine size={12} />
              SP-TBK1
            </button>
          )}
          {/* SP-TJK */}
          {canAccess('SP-TJK') && (
            <button
              onClick={() => setActivePage('SP-TJK')}
              className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activePage === 'SP-TJK'
                  ? 'bg-orange-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
            >
              <RiMailSendLine size={12} />
              SP-TJK
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
          {/* SP-TCR */}
          {canAccess('SP-TCR') && (
            <div
              onClick={() => setActivePage('SP-TCR')}
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
                <RiMailSendLine
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-6"
                />

                <div className="text-3xl font-bold tracking-wide">SP-TCR</div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TCR
                </div>
              </div>
            </div>
          )}

          {/* SP-TBK */}
          {canAccess('SP-TBK') && (
            <div
              onClick={() => setActivePage('SP-TBK')}
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
                <RiMailSendLine
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-6"
                />

                <div className="text-3xl font-bold tracking-wide">SP-TBK</div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TBK
                </div>
              </div>
            </div>
          )}

          {/* SP-TBK1 */}
          {canAccess('SP-TBK1') && (
            <div
              onClick={() => setActivePage('SP-TBK1')}
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
                <RiMailSendLine
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-6"
                />

                <div className="text-3xl font-bold tracking-wide">SP-TBK1</div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TBK1
                </div>
              </div>
            </div>
          )}

          {/* SP-TJK */}
          {canAccess('SP-TJK') && (
            <div
              onClick={() => setActivePage('SP-TJK')}
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
                <RiMailSendLine
                  size={55}
                  className="transition-transform duration-300 group-hover:rotate-12"
                />

                <div className="text-3xl font-bold tracking-wide">SP-TJK</div>

                <div className="text-sm opacity-80 text-center">
                  Special Project TJK
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      {activePage === 'SP-TCR' && canAccess('SP-TCR') && <SpTCR />}
      {activePage === 'SP-TBK' && canAccess('SP-TBK') && <SpTBK />}
      {activePage === 'SP-TBK1' && canAccess('SP-TBK1') && <SpTBK1 />}
      {activePage === 'SP-TJK' && canAccess('SP-TJK') && <SpTJK />}
    </div>
  );
}

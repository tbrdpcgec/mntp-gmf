import { useState } from 'react';
import { RiBarChartBoxLine } from 'react-icons/ri';
import { FaArrowLeft, FaPlane, FaTools, FaCogs } from 'react-icons/fa';

import DashboardTcr from './DashboardTcr';
import DashboardTcs from './DashboardTcs';
import DashboardTcw from './DashboardTcw';
import PowerBIDashboard from './PowerBIDashboard';

export default function Dashboard() {
  const [activeDashboard, setActiveDashboard] = useState('');

  return (
    <div className="p-2">
      {/* TAB ATAS */}
      {activeDashboard && (
        <div className="flex gap-2 mt-0 mb-2">
          {/* TCR */}
          <button
            onClick={() => setActiveDashboard('TCR')}
            className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activeDashboard === 'TCR'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            <FaPlane size={12} />
            TCR
          </button>

          {/* TCS */}
          <button
            onClick={() => setActiveDashboard('TCS')}
            className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activeDashboard === 'TCS'
                  ? 'bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            <FaTools size={12} />
            TCS
          </button>

          {/* TCW */}
          <button
            onClick={() => setActiveDashboard('TCW')}
            className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activeDashboard === 'TCW'
                  ? 'bg-orange-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            <FaCogs size={12} />
            TCW
          </button>

          {/* POWER BI */}
          <button
            onClick={() => setActiveDashboard('POWERBI')}
            className={`
    flex items-center gap-2
    px-3 py-1.5 rounded-lg
    text-[11px] font-semibold text-white
    transition-all duration-200
    hover:scale-105 hover:shadow-lg
    ${
      activeDashboard === 'POWERBI'
        ? 'bg-purple-600'
        : 'bg-gray-700 hover:bg-gray-600'
    }
  `}
          >
            <RiBarChartBoxLine size={12} />
            POWER BI
          </button>

          {/* BACK */}
          <button
            onClick={() => setActiveDashboard('')}
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

      {/* HALAMAN PILIH UNIT */}
      {!activeDashboard && (
        <div className="grid grid-cols-4 gap-6 mt-6">
          {/* TCR */}
          <div
            onClick={() => setActiveDashboard('TCR')}
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
              <FaPlane
                size={55}
                className="transition-transform duration-300 group-hover:rotate-6"
              />

              <div className="text-3xl font-bold tracking-wide">TCR</div>

              <div className="text-sm opacity-80 text-center">
                Structure & Cabin Repair
              </div>
            </div>
          </div>

          {/* TCS */}
          <div
            onClick={() => setActiveDashboard('TCS')}
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
              <FaTools
                size={55}
                className="transition-transform duration-300 group-hover:rotate-6"
              />

              <div className="text-3xl font-bold tracking-wide">TCS</div>

              <div className="text-sm opacity-80 text-center">
                Plating • Welding • Painting
              </div>
            </div>
          </div>

          {/* TCW */}
          <div
            onClick={() => setActiveDashboard('TCW')}
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
              <FaCogs
                size={55}
                className="transition-transform duration-300 group-hover:rotate-12"
              />

              <div className="text-3xl font-bold tracking-wide">TCW</div>

              <div className="text-sm opacity-80 text-center">
                Landing Gear Workshop
              </div>
            </div>
          </div>

          {/* POWER BI */}
          <div
            onClick={() => setActiveDashboard('POWERBI')}
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
              <RiBarChartBoxLine
                size={55}
                className="transition-transform duration-300 group-hover:scale-110"
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
                C-Rating
              </div>

              <div className="text-sm opacity-80 text-center">
                C-Rating Dashboard
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      {activeDashboard === 'TCR' && <DashboardTcr />}
      {activeDashboard === 'TCS' && <DashboardTcs />}
      {activeDashboard === 'TCW' && <DashboardTcw />}
      {activeDashboard === 'POWERBI' && <PowerBIDashboard />}
    </div>
  );
}

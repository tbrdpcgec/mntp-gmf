import { useState } from 'react';

import { FaArrowLeft, FaTools, FaWarehouse } from 'react-icons/fa';

import DashboardTBKshop from './DashboardTBKshop';
import DashboardTBKhangar from './DashboardTBKhangar';

export default function DashboardTBK() {
  const [activeDashboard, setActiveDashboard] = useState('');

  return (
    <div className="p-2">
      {/* TAB ATAS */}
      {activeDashboard && (
        <div className="flex gap-2 mt-0 mb-2">
          {/* WORKSHOP */}
          <button
            onClick={() => setActiveDashboard('WORKSHOP')}
            className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activeDashboard === 'WORKSHOP'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            <FaTools size={12} />
            WORKSHOP
          </button>

          {/* HANGAR */}
          <button
            onClick={() => setActiveDashboard('HANGAR')}
            className={`
              flex items-center gap-2
              px-3 py-1.5 rounded-lg
              text-[11px] font-semibold text-white
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${
                activeDashboard === 'HANGAR'
                  ? 'bg-green-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            <FaWarehouse size={12} />
            HANGAR
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

      {/* PILIH DASHBOARD */}
      {!activeDashboard && (
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* WORKSHOP */}
          <div
            onClick={() => setActiveDashboard('WORKSHOP')}
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
              <FaTools
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
                WORKSHOP
              </div>

              <div className="text-sm opacity-80 text-center">
                TBK Workshop Dashboard
              </div>
            </div>
          </div>

          {/* HANGAR */}
          <div
            onClick={() => setActiveDashboard('HANGAR')}
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
              <FaWarehouse
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
                HANGAR
              </div>

              <div className="text-sm opacity-80 text-center">
                TBK Hangar Dashboard
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {activeDashboard === 'WORKSHOP' && <DashboardTBKshop />}
      {activeDashboard === 'HANGAR' && <DashboardTBKhangar />}
    </div>
  );
}

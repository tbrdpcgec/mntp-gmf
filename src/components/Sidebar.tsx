import {
  FaHome,
  FaChartBar,
  FaEdit,
  FaCalendarAlt,
  FaFileAlt,
  FaCogs,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiArchiveBox } from 'react-icons/hi2';
import { HiFolderOpen } from 'react-icons/hi';
import { FaFolder } from 'react-icons/fa';
import { GiHotMeal } from 'react-icons/gi';
import { FaPlaneDeparture } from 'react-icons/fa';
import { RiMailSendLine } from 'react-icons/ri';
import { IoSettingsSharp } from 'react-icons/io5';
import { FaCog } from 'react-icons/fa';
import { FaGlobe } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { useEffect } from 'react';

const menuItems = [
  { label: 'Home', icon: <FaHome />, path: '/' },
  { label: 'Dashboard', icon: <FaChartBar />, path: null },
  { label: 'Daily Menu TC', icon: <GiHotMeal />, path: null },

  { label: 'Daily Menu TBK', icon: <GiHotMeal />, path: null },
  { label: 'Daily Menu TJK', icon: <GiHotMeal />, path: null },
  { label: 'TCR Daily Report', icon: <FaFileAlt />, path: null },
  { label: 'TBK Daily Report', icon: <FaFileAlt />, path: null },
  { label: 'TJK Daily Report', icon: <FaFileAlt />, path: null },
  { label: 'Material', icon: <FaCog />, path: '/material' },
  { label: 'ABMP', icon: <FaPlaneDeparture />, path: '/abmp' },
  { label: 'SP', icon: <RiMailSendLine />, path: '/spaja' },
  { label: 'Archived', icon: <FaFolder />, path: '/archived' },
  { label: 'All Apps', icon: <FaGlobe />, path: '/apps' },
];

const dashboardSubmenu = [
  { label: 'TC', path: '/dashboard' },
  { label: 'TBK', path: '/dashboard/tbk' },
  { label: 'TJK', path: '/dashboard/tjk' },
];

const dailyReportTCRSubmenu = [
  { label: 'TCR-1 Sheetmetal', path: '/daily-report/w301' },
  { label: 'TCR-2 Composite', path: '/daily-report/w302' },
  { label: 'TCR-3 Seat', path: '/daily-report/w304' },
  { label: 'TCR-4 Cabin', path: '/daily-report/w305' },
  { label: 'TCR-5 Machining', path: '/daily-report/w303' },
];

const dailyReportTBKSubmenu = [
  { label: 'TBK Sheetmetal', path: '/daily-report/w301/tbk' },
  { label: 'TBK Composite', path: '/daily-report/w302/tbk' },
];

const dailyReportTJKSubmenu = [
  { label: 'TJK Sheetmetal', path: '/daily-report/w304/tjk' },
  { label: 'TJK Composite', path: '/daily-report/w305/tjk' },
];

const dailyMenuSubmenu = [
  { label: 'TCR Structure & Cabin', path: '/daily-menu/ws1' },
  { label: 'TCS Special Process', path: '/daily-menu/tcs' },
  { label: 'TCW Landing Gear', path: '/daily-menu/tcW' },
  { label: 'PD Sheet History', path: '/pds' },
];

const dailyMenuTBKSubmenu = [
  {
    label: 'Workshop',
    path: '/daily-menu/tbk/shop',
  },
  {
    label: 'Hangar',
    path: '/daily-menu/tbk/hangar',
  },
];

const dailyMenuTJKSubmenu = [
  {
    label: 'Workshop',
    path: '/daily-menu/tjk/shop',
  },
  {
    label: 'Hangar',
    path: '/daily-menu/tjk/hangar',
  },
];

const inputdataSubmenu = [
  { label: 'TCR', path: '/input' },
  { label: 'TCS', path: '/inputdata/tcs' },

  { label: 'TCW', path: '/inputdata/tcw' },
];

export default function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const location = useLocation();
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  const [isReportTCRExpanded, setIsReportTCRExpanded] = useState(false);
  const [isReportTBKExpanded, setIsReportTBKExpanded] = useState(false);
  const [isReportTJKExpanded, setIsReportTJKExpanded] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isInputDataExpanded, setIsInputDataExpanded] = useState(false);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isMenuTCExpanded, setIsMenuTCExpanded] = useState(false);
  const [isMenuTBKExpanded, setIsMenuTBKExpanded] = useState(false);
  const [isMenuTJKExpanded, setIsMenuTJKExpanded] = useState(false);

  const { email, loading } = useAuth();

  // =============================
  // ACCESS CONFIG
  // =============================

  const DEFAULT_ALLOWED_MENUS = ['Home', 'Dashboard'];

  const FULL_ACCESS = [
    'Home',
    'Dashboard',
    'TCR Daily Report',
    'TBK Daily Report',
    'TJK Daily Report',
    'Daily Menu TC',
    'Daily Menu TBK',
    'Daily Menu TJK',
    'Input Data',
    'Material',
    'ABMP',
    'SP',
    'Archived',
    'All Apps',
  ];

  const [userAllowedMenus, setUserAllowedMenus] = useState<string[]>(
    DEFAULT_ALLOWED_MENUS
  );

  const [userAllowedSubmenus, setUserAllowedSubmenus] = useState<
    Record<string, string[]>
  >({});

  const loadSidebarAccess = async (email: string) => {
    const { data, error } = await supabase
      .from('user_sidebar_access')
      .select('*')
      .eq('email', email);

    if (error) {
      console.error(error);
      return;
    }

    const hasFullAccess = data.some((row) => row.menu === 'FULL ACCESS');

    if (hasFullAccess) {
      setUserAllowedMenus(FULL_ACCESS);
      setUserAllowedSubmenus({});
      return;
    }

    const menus = [...DEFAULT_ALLOWED_MENUS];

    const submenus: Record<string, string[]> = {};

    data.forEach((row) => {
      if (!menus.includes(row.menu)) {
        menus.push(row.menu);
      }

      if (!submenus[row.menu]) {
        submenus[row.menu] = [];
      }

      submenus[row.menu].push(row.submenu);
    });

    setUserAllowedMenus(menus);
    setUserAllowedSubmenus(submenus);
  };

  useEffect(() => {
    if (email) {
      loadSidebarAccess(email);
    }
  }, [email]);

  const filteredMenuItems = menuItems.filter((item) =>
    userAllowedMenus.includes(item.label)
  );

  const filterSubmenu = (
    menuLabel: string,
    submenu: { label: string; path: string }[]
  ) => {
    const allowed = userAllowedSubmenus[menuLabel];

    // kalau user tidak punya rule → tampilkan semua
    if (!allowed) return submenu;

    return submenu.filter((sub) => allowed.includes(sub.label));
  };

  return (
    <div
      className={`
    custom-scrollbar
    ${isCollapsed ? 'w-0 overflow-hidden p-0' : 'w-44 p-2'}
    bg-gradient-to-t from-[#292929] to-[#212121]
    text-white h-screen space-y-1 fixed
    transition-all duration-300 overflow-y-auto text-xs
  `}
    >
      {!isCollapsed && (
        <div className="flex flex-col items-center">
          <img src="/homes.png" alt="App Logo" className="w-150 h-15" />
        </div>
      )}

      <ul className="space-y-1">
        {filteredMenuItems.map((item) => (
          <li key={item.label}>
            {/* Dropdown menu check */}
            {item.label === 'TCR Daily Report' ||
            item.label === 'TBK Daily Report' ||
            item.label === 'TJK Daily Report' ||
            item.label === 'Daily Menu TC' ||
            item.label === 'Daily Menu TBK' ||
            item.label === 'Daily Menu TJK' ||
            item.label === 'Input Data' ||
            item.label === 'Dashboard' ? (
              <div
                onClick={() =>
                  item.label === 'TCR Daily Report'
                    ? setIsReportTCRExpanded(!isReportTCRExpanded)
                    : item.label === 'TBK Daily Report'
                    ? setIsReportTBKExpanded(!isReportTBKExpanded)
                    : item.label === 'TJK Daily Report'
                    ? setIsReportTJKExpanded(!isReportTJKExpanded)
                    : item.label === 'Daily Menu TC'
                    ? setIsMenuTCExpanded(!isMenuTCExpanded)
                    : item.label === 'Daily Menu TBK'
                    ? setIsMenuTBKExpanded(!isMenuTBKExpanded)
                    : item.label === 'Daily Menu TJK'
                    ? setIsMenuTJKExpanded(!isMenuTJKExpanded)
                    : item.label === 'Input Data'
                    ? setIsInputDataExpanded(!isInputDataExpanded)
                    : item.label === 'Dashboard'
                    ? setIsDashboardExpanded(!isDashboardExpanded)
                    : null
                }
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-[#00707A] text-[#f0f0f0] transition-colors duration-200"
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                    <span className="ml-auto text-xs">
                      {(
                        item.label === 'TCR Daily Report'
                          ? isReportTCRExpanded
                          : item.label === 'TBK Daily Report'
                          ? isReportTBKExpanded
                          : item.label === 'TJK Daily Report'
                          ? isReportTJKExpanded
                          : item.label === 'Daily Menu TC'
                          ? isMenuTCExpanded
                          : item.label === 'Daily Menu TBK'
                          ? isMenuTBKExpanded
                          : item.label === 'Daily Menu TJK'
                          ? isMenuTJKExpanded
                          : isInputDataExpanded
                      )
                        ? '▾'
                        : '▸'}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <Link
                to={item.path!}
                className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-[#00707A] transition-colors duration-200 ${
                  location.pathname === item.path ? 'bg-[#00636B]' : ''
                } text-[#f0f0f0]`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )}

            {/* Daily Report TCR Submenu */}
            {!isCollapsed &&
              item.label === 'TCR Daily Report' &&
              isReportTCRExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('TCR Daily Report', dailyReportTCRSubmenu)
                    .length > 0 ? (
                    filterSubmenu(
                      'TCR Daily Report',
                      dailyReportTCRSubmenu
                    ).map((sub) => (
                      <li key={sub.label}>
                        <Link
                          to={sub.path}
                          className={`block px-2 py-1 rounded hover:bg-[#00707A] whitespace-nowrap overflow-hidden ${
                            location.pathname === sub.path ? 'bg-[#00636B]' : ''
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}

            {/* Daily Report Submenu */}
            {!isCollapsed &&
              item.label === 'TBK Daily Report' &&
              isReportTBKExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('TBK Daily Report', dailyReportTBKSubmenu)
                    .length > 0 ? (
                    filterSubmenu(
                      'TBK Daily Report',
                      dailyReportTBKSubmenu
                    ).map((sub) => (
                      <li key={sub.label}>
                        <Link
                          to={sub.path}
                          className={`block px-2 py-1 rounded hover:bg-[#00707A] whitespace-nowrap overflow-hidden ${
                            location.pathname === sub.path ? 'bg-[#00636B]' : ''
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}

            {/* Daily Report TJK Submenu */}
            {!isCollapsed &&
              item.label === 'TJK Daily Report' &&
              isReportTJKExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('TJK Daily Report', dailyReportTJKSubmenu)
                    .length > 0 ? (
                    filterSubmenu(
                      'TJK Daily Report',
                      dailyReportTJKSubmenu
                    ).map((sub) => (
                      <li key={sub.label}>
                        <Link
                          to={sub.path}
                          className={`block px-2 py-1 rounded hover:bg-[#00707A] whitespace-nowrap overflow-hidden ${
                            location.pathname === sub.path ? 'bg-[#00636B]' : ''
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}

            {/* Daily Menu Submenu */}
            {!isCollapsed &&
              item.label === 'Daily Menu TC' &&
              isMenuTCExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('Daily Menu TC', dailyMenuSubmenu).length >
                  0 ? (
                    filterSubmenu('Daily Menu TC', dailyMenuSubmenu).map(
                      (sub) => (
                        <li key={sub.label}>
                          <Link
                            to={sub.path}
                            className={`block px-2 py-1 rounded hover:bg-[#00707A] whitespace-nowrap overflow-hidden ${
                              location.pathname === sub.path
                                ? 'bg-[#00636B]'
                                : ''
                            }`}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      )
                    )
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}

            {/* Daily Menu TBK Submenu */}
            {!isCollapsed &&
              item.label === 'Daily Menu TBK' &&
              isMenuTBKExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('Daily Menu TBK', dailyMenuTBKSubmenu).length >
                  0 ? (
                    filterSubmenu('Daily Menu TBK', dailyMenuTBKSubmenu).map(
                      (sub) => (
                        <li key={sub.label}>
                          <Link
                            to={sub.path}
                            className={`block px-2 py-1 rounded hover:bg-[#00707A] whitespace-nowrap overflow-hidden ${
                              location.pathname === sub.path
                                ? 'bg-[#00636B]'
                                : ''
                            }`}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      )
                    )
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}

            {/* Daily Menu TJK Submenu */}
            {!isCollapsed &&
              item.label === 'Daily Menu TJK' &&
              isMenuTJKExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('Daily Menu TJK', dailyMenuTJKSubmenu).length >
                  0 ? (
                    filterSubmenu('Daily Menu TJK', dailyMenuTJKSubmenu).map(
                      (sub) => (
                        <li key={sub.label}>
                          <Link
                            to={sub.path}
                            className={`block px-2 py-1 rounded hover:bg-[#00707A] whitespace-nowrap overflow-hidden ${
                              location.pathname === sub.path
                                ? 'bg-[#00636B]'
                                : ''
                            }`}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      )
                    )
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}

            {/* Input Data Submenu */}
            {!isCollapsed &&
              item.label === 'Input Data' &&
              isInputDataExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('Input Data', inputdataSubmenu).length > 0 ? (
                    filterSubmenu('Input Data', inputdataSubmenu).map((sub) => (
                      <li key={sub.label}>
                        <Link
                          to={sub.path}
                          className={`block px-2 py-1 rounded hover:bg-[#00707A] whitespace-nowrap overflow-hidden ${
                            location.pathname === sub.path ? 'bg-[#00636B]' : ''
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}

            {/* Dashboard Submenu */}
            {!isCollapsed &&
              item.label === 'Dashboard' &&
              isDashboardExpanded && (
                <ul className="ml-6 mt-1 space-y-1 text-xs">
                  {filterSubmenu('Dashboard', dashboardSubmenu).length > 0 ? (
                    filterSubmenu('Dashboard', dashboardSubmenu).map((sub) => (
                      <li key={sub.label}>
                        <Link
                          to={sub.path}
                          className={`block px-2 py-1 rounded hover:bg-[#00707A] ${
                            location.pathname === sub.path ? 'bg-[#00636B]' : ''
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-1 text-gray-400 italic">
                      No access
                    </li>
                  )}
                </ul>
              )}
          </li>
        ))}
      </ul>
      {/* Version Info di pojok kiri bawah */}
      {!isCollapsed && (
        <div className="absolute bottom-6 left-2 text-xs text-[#f0f0f0]"></div>
      )}
    </div>
  );
}

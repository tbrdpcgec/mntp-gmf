// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import ProtectedLayout from './layouts/ProtectedLayout';

import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DashboardTcr from './pages/DashboardTcr';
import DashboardTcs from './pages/DashboardTcs';
import DashboardTcw from './pages/DashboardTcw';

import DashboardTBK from './pages/DashboardTBK';
import DashboardTBKshop from './pages/DashboardTBKshop';
import DashboardTBKhangar from './pages/DashboardTBKhangar';

import DashboardTJK from './pages/DashboardTJK';
import DashboardTJKshop from './pages/DashboardTJKshop';
import DashboardTJKhangar from './pages/DashboardTJKhangar';

import InputData from './pages/InputData';
import InputDataTcs from './pages/InputDataTcs';
import InputDataTcw from './pages/InputDataTcw';
import DailyMenu from './pages/DailyMenu';
import DailyMenuTcs from './pages/DailyMenuTcs';
import DailyMenuWS1 from './pages/DailyMenuWS1';
import DailyMenuTcw from './pages/DailyMenuTcw';
import DailyMenuTBKshop from './pages/DailyMenuTBKshop';
import DailyMenuTBKhangar from './pages/DailyMenuTBKhangar';

import DailyMenuTJKshop from './pages/DailyMenuTJKshop';
import DailyMenuTJKhangar from './pages/DailyMenuTJKhangar';

import W301 from './pages/W301';
import W302 from './pages/W302';
import W303 from './pages/W303';
import W304 from './pages/W304';
import W305 from './pages/W305';

import W301TBK from './pages/W301TBK';
import W302TBK from './pages/W302TBK';
import W305TJK from './pages/W305TJK';
import W304TJK from './pages/W304TJK';

import Material from './pages/Material';
import Apps from './pages/Apps';

import Abmp from './pages/Abmp';
import Spaja from './pages/Spaja';
import Archived from './pages/Archived';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* SEMUA PAGE PAKAI MAINLAYOUT */}
          <Route element={<MainLayout />}>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/tcr" element={<DashboardTcr />} />
            <Route path="/dashboard/tcs" element={<DashboardTcs />} />
            <Route path="/dashboard/tcw" element={<DashboardTcw />} />
            <Route path="/dashboard/tbk" element={<DashboardTBK />} />
            <Route path="/dashboard/tbkshop" element={<DashboardTBKshop />} />
            <Route
              path="/dashboard/tbkhangar"
              element={<DashboardTBKhangar />}
            />
            <Route path="/dashboard/tjk" element={<DashboardTJK />} />
            <Route path="/dashboard/tjkshop" element={<DashboardTJKshop />} />
            <Route
              path="/dashboard/tjkhangar"
              element={<DashboardTJKhangar />}
            />
            <Route path="/login" element={<Login />} />

            {/* PROTECTED */}
            <Route element={<ProtectedLayout />}>
              <Route path="/input" element={<InputData />} />
              <Route path="/inputdata/tcs" element={<InputDataTcs />} />
              <Route path="/inputdata/tcw" element={<InputDataTcw />} />

              <Route path="/daily-menu" element={<DailyMenu />} />

              <Route path="/daily-menu/tcw" element={<DailyMenuTcw />} />
              <Route path="/daily-menu/tcs" element={<DailyMenuTcs />} />
              <Route path="/daily-menu/ws1" element={<DailyMenuWS1 />} />
              <Route
                path="/daily-menu/tbk/shop"
                element={<DailyMenuTBKshop />}
              />
              <Route
                path="/daily-menu/tbk/hangar"
                element={<DailyMenuTBKhangar />}
              />

              <Route
                path="/daily-menu/tjk/shop"
                element={<DailyMenuTJKshop />}
              />
              <Route
                path="/daily-menu/tjk/hangar"
                element={<DailyMenuTJKhangar />}
              />

              <Route path="/daily-report/w301" element={<W301 />} />
              <Route path="/daily-report/w302" element={<W302 />} />
              <Route path="/daily-report/w303" element={<W303 />} />
              <Route path="/daily-report/w304" element={<W304 />} />
              <Route path="/daily-report/w305" element={<W305 />} />

              <Route path="/daily-report/w301/tbk" element={<W301TBK />} />
              <Route path="/daily-report/w302/tbk" element={<W302TBK />} />

              <Route path="/daily-report/w304/tjk" element={<W304TJK />} />
              <Route path="/daily-report/w305/tjk" element={<W305TJK />} />

              <Route path="/material" element={<Material />} />
              <Route path="/apps" element={<Apps />} />

              <Route path="/abmp" element={<Abmp />} />
              <Route path="/spaja" element={<Spaja />} />
              <Route path="/archived" element={<Archived />} />
            </Route>

            {/* FALLBACK → HITAM */}
            <Route path="*" element={<div className="flex-1 bg-black" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

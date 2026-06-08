// src/layouts/PublicLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';

export default function PublicLayout() {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLogin(!!data.session);
    });
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-3 bg-[#00838f]">
        <h1 className="text-white font-bold text-lg">MDR SYSTEM</h1>

        {!isLogin ? (
          <button
            onClick={() => navigate('/login')}
            className="bg-white px-3 py-1 rounded text-sm"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => navigate('/w301')}
            className="bg-white px-3 py-1 rounded text-sm"
          >
            Go to App
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}

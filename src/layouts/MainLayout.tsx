// src/layouts/MainLayout.tsx
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { FaComments } from 'react-icons/fa';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
import { GiHotMeal } from 'react-icons/gi';
import { useMemo } from 'react';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ChatPanel from '../components/ChatPanel';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { email } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const displayName = userEmail ? userEmail.split('@')[0] : '';
  const [showChat, setShowChat] = useState(false);
  const [showGroups, setShowGroups] = useState(true);
  const [showGroupList, setShowGroupList] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const [mentionCount, setMentionCount] = useState(0);

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  /* =============================
     LOGOUT
  ============================= */
  const handleLogout = async () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    await supabase.auth.signOut();
    setSession(null);
    setUserEmail(null);
    navigate('/login');
  };

  /* =============================
     IDLE TIMER
  ============================= */
  const resetIdleTimer = () => {
    if (!session) return;

    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    idleTimeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 30 * 60 * 1000); // 30 menit
  };

  /* =============================
     SESSION CHECK (1x)
  ============================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUserEmail(data.session?.user.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUserEmail(session?.user.email ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /* =============================
     USER ACTIVITY LISTENER
  ============================= */
  useEffect(() => {
    if (!session) return;

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [session]);

  useEffect(() => {
    const channel = supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* =============================
     HEADER TITLE
  ============================= */
  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard TC Component';
      case '/dashboard/tcs':
        return 'Dashboard TCS Spesial Process';
      case '/dashboard/tcw':
        return 'Dashboard TCW Landing Gear';
      case '/dashboard/tcr':
        return 'Dashboard TCR Structure & Cabin';
      case '/dashboard/tbk':
        return 'Dashboard TBK Structure Widebody';
      case '/dashboard/tbkshop':
        return 'Dashboard TBK Structure Shop Widebody';
      case '/dashboard/tbkhangar':
        return 'Dashboard TBK Structure Hangar Widebody';
      case '/dashboard/tjk':
        return 'Dashboard TJK Structure Widebody';
      case '/dashboard/tjkshop':
        return 'Dashboard TJK Structure Shop Widebody';
      case '/dashboard/tjkhangar':
        return 'Dashboard TJK Structure Hangar Widebody';

      case '/daily-menu/tcs':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TCS</span>
          </span>
        );

      case '/daily-menu/ws1':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TCR</span>
          </span>
        );

      case '/daily-menu/tcw':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TCW</span>
          </span>
        );

      case '/daily-menu/tbk/shop':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TBK SHOP</span>
          </span>
        );

      case '/daily-menu/tbk/hangar':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TBK HANGAR</span>
          </span>
        );

      case '/daily-menu/tjk/shop':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TJK SHOP</span>
          </span>
        );

      case '/daily-menu/tjk/hangar':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TJK HANGAR</span>
          </span>
        );

      case '/archived':
        return 'Archived';

      case '/daily-report':
        return 'Daily Report';

      case '/daily-report/w301':
        return 'Daily Report Sheetmetal TCR-1';

      case '/daily-report/w302':
        return 'Daily Report Composite TCR-2';

      case '/daily-report/w305':
        return 'Daily Report Cabin Shop TCR-4';

      case '/daily-report/w304':
        return 'Daily Report Seat Shop TCR-3';

      case '/daily-report/w303':
        return 'Daily Report Machining TCR-5';

      case '/daily-report/w301/tbk':
        return 'Daily Report Sheetmetal TBK SHOP';

      case '/daily-report/w302/tbk':
        return 'Daily Report Composite TBK SHOP';

      case '/daily-report/w305/tjk':
        return 'Daily Report Composite TJK SHOP';

      case '/daily-report/w304/tjk':
        return 'Daily Report Sheetmetal TJK SHOP';

      case '/material':
        return 'Material';

      case '/apps':
        return 'Apps';

      case '/abmp':
        return 'ABMP';

      case '/spaja':
        return 'SP-AJA';

      default:
        return 'Home';
    }
  };

  ////chat

  const loadMentionCount = async () => {
    if (!email) return;

    const { data } = await supabase.from('chat_messages').select('*');

    const username = email?.split('@')[0].toLowerCase();

    const count =
      data?.filter((msg) => {
        const tagged = msg.message?.toLowerCase().includes(`@${username}`);

        const alreadyRead = (msg.mention_read_by || []).includes(email);

        return tagged && !alreadyRead;
      }).length || 0;

    setMentionCount(count);
  };

  useEffect(() => {
    loadMentionCount();
  }, [email]);

  useEffect(() => {
    const channel = supabase
      .channel('mention-notification')

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          loadMentionCount();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [email]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setShowChat(false);
      }
    };

    if (showChat) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChat]);

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div
          className={`
    flex-1
    flex
    flex-col
    transition-all
    duration-300
    ${isCollapsed ? 'ml-0' : 'ml-44'}
  `}
        >
          {/* HEADER */}
          {/* HEADER */}
          {/* HEADER */}
          <div
            className="
flex
items-center
justify-between
bg-[#00838f]
px-4
py-2
sticky
top-0
z-10
w-full
"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => setIsCollapsed(!isCollapsed)}>
                <FaBars className="text-white" />
              </button>

              <h1
                className="
text-white
font-semibold
truncate
"
              >
                {getTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* DATE */}
              <div className="text-xs text-white opacity-90">{today}</div>

              {session ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="text-white text-xl"
                    >
                      <div className="relative">
                        <HiChatBubbleLeftRight />

                        {mentionCount > 0 && (
                          <span
                            className="
            absolute
            -top-2
            -right-2
            bg-red-600
            text-white
            text-[10px]
            rounded-full
            min-w-[18px]
            h-[18px]
            flex
            items-center
            justify-center
          "
                          >
                            {mentionCount}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* USER */}
                  <div className="flex items-center gap-2 text-sm text-white">
                    <FaUserCircle />
                    <span>{displayName}</span>
                  </div>

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-white text-[#212121] px-2 py-1 rounded text-xs hover:bg-red-600 hover:text-white transition"
                  >
                    <MdLogout />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                /* LOGIN */
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-black px-3 py-1 text-xs rounded"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {showChat && (
            <div
              ref={chatRef}
              className="fixed top-14 right-4 right-4 w-[360px] h-[480px] bg-white rounded-lg shadow-2xl z-50"
            >
              <ChatPanel loadMentionCount={loadMentionCount} />
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 overflow-auto p-4 bg-[#141414]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

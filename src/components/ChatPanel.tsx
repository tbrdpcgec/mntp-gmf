import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ChatPanel({
  loadMentionCount,
}: {
  loadMentionCount: () => Promise<void>;
}) {
  const { email } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [users, setUsers] = useState<string[]>([]);
  const [mentionList, setMentionList] = useState<string[]>([]);
  const [showMention, setShowMention] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mentionCount, setMentionCount] = useState(0);

  const loadUsers = async () => {
    const { data } = await supabase.from('user_sidebar_access').select('email');

    const uniqueEmails = [
      ...new Set(
        (data || []).map((x) => x.email?.split('@')[0]).filter(Boolean)
      ),
    ];

    setUsers(uniqueEmails);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', {
        ascending: true,
      });

    setMessages(data || []);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    loadMessages();
    loadUsers();
    loadMentionCount();

    const channel = supabase
      .channel('chat-global')

      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          loadMessages();
          loadMentionCount();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setNewMessage(value);

    const match = value.match(/@(\S*)$/);

    if (!match) {
      setShowMention(false);
      return;
    }

    const keyword = match[1].toLowerCase();

    const filtered = users.filter((u) => u.toLowerCase().includes(keyword));

    setMentionList(filtered);
    setShowMention(true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const msg = newMessage;

    await supabase.from('chat_messages').insert({
      sender_email: email,
      message: msg,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender_email: email,
        message: msg,
        created_at: new Date().toISOString(),
      },
    ]);

    setNewMessage('');
    setShowMention(false);
  };

  const markMentionRead = async (id: number) => {
    const msg = messages.find((x) => x.id === id);

    if (!msg) return;

    await supabase
      .from('chat_messages')
      .update({
        mention_read_by: [...(msg.mention_read_by || []), email],
      })
      .eq('id', id);

    await loadMessages();

    // langsung update badge MainLayout
    await loadMentionCount();
  };

  const username = email?.split('@')[0].toLowerCase();

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white bg-[#00838f] text-white px-3 py-2 flex justify-between text-sm">
        <div>Group Chat Coordination</div>
      </div>

      {/* MESSAGE LIST */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-2 ${
              msg.sender_email === email ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`
    max-w-[85%]
    px-3
    py-2
    rounded-lg
    ${
      msg.sender_email === email
        ? 'bg-[#00838f] text-white text-sm'
        : 'bg-gray-200 text-black text-sm'
    }
  `}
            >
              <div
                className={`text-[11px] mb-1 ${
                  msg.sender_email === email ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {msg.sender_email}
              </div>

              <div className="whitespace-pre-wrap break-words">
                {msg.message.split(' ').map((word, i) => {
                  if (word.startsWith('@')) {
                    return (
                      <span
                        key={i}
                        className={
                          msg.sender_email === email
                            ? 'text-yellow-200 font-semibold'
                            : 'text-blue-600 font-semibold'
                        }
                      >
                        {word}{' '}
                      </span>
                    );
                  }

                  return word + ' ';
                })}
              </div>

              {msg.message?.toLowerCase().includes(`@${username}`) &&
                !(msg.mention_read_by || []).includes(email) && (
                  <button
                    onClick={() => markMentionRead(msg.id)}
                    className="
  mt-2
  text-xs
  bg-[#00838f]
  text-white
  px-2
  py-1
  rounded
"
                  >
                    ✓ Read
                  </button>
                )}

              <div
                className={`
    text-[10px]
    mt-1
    ${msg.sender_email === email ? 'text-white/60' : 'text-gray-500'}
  `}
              >
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {showMention && mentionList.length > 0 && (
        <div
          className="
      absolute
      bottom-14
      left-2
      right-2
      bg-white
      border
      rounded
      shadow-lg
      max-h-48
      overflow-y-auto
      z-50
    "
        >
          {mentionList.map((user) => (
            <div
              key={user}
              onClick={() => {
                setNewMessage(newMessage.replace(/@\S*$/, `@${user} `));

                setShowMention(false);
              }}
              className="
          px-3 py-2
          hover:bg-gray-100
          cursor-pointer
          text-sm
        "
            >
              {user}
            </div>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="relative p-2 border-t flex gap-2">
        <input
          value={newMessage}
          onChange={handleMessageChange}
          className="text-sm flex-1 border rounded px-2 py-1"
          placeholder="Type a message... Use @ to mention"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          className="
      bg-[#00838f]
      text-white
      px-3
      rounded
      text-sm
    "
        >
          Send
        </button>
      </div>
    </div>
  );
}

// src/pages/Login.tsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/'); // Ganti dengan halaman setelah login
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/back.png')" }}
    >
      <form
        onSubmit={handleLogin}
        className="
    bg-slate-900/60             /* semi transparan gelap */
    border border-white/10
    shadow-lg shadow-cyan-500/50
    rounded-xl
    p-5 w-[300px] space-y-2
    text-white
  "
      >
        <h2 className="text-2xl font-bold text-center tracking-wide drop-shadow-lg">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="
      w-full p-2 rounded-md
      bg-white/20 border border-white/30
      placeholder-white/70
      focus:outline-none focus:ring-2 focus:ring-cyan-400
      text-white
    "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="
      w-full p-2 rounded-md
      bg-white/20 border border-white/30
      placeholder-white/70
      focus:outline-none focus:ring-2 focus:ring-cyan-400
      text-white
    "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="
      w-full p-2 rounded-md
      bg-gradient-to-r from-cyan-500 to-blue-500
      hover:from-blue-500 hover:to-cyan-500
      shadow-md shadow-cyan-500/40
      text-white font-semibold tracking-wide
      transition duration-300
    "
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

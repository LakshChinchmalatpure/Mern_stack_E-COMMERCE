import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Sparkles } from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === 'login' ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === 'login' 
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.user && data.token) {
        onAuthSuccess(data.user, data.token);
        onClose();
        resetForm();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await response.json();

      if (response.ok && data.user && data.token) {
        onAuthSuccess(data.user, data.token);
        onClose();
        resetForm();
      } else {
        setError(data.error || "Quick login failed");
      }
    } catch (err) {
      setError("Server connection failure");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "" });
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-xs"></div>

      {/* Card Body */}
      <div className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight font-sans">
              {mode === 'login' ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === 'login' ? "Login to access saved carts & orders" : "Register for a secure shopping workspace"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3.5 text-xs text-red-600 font-semibold leading-normal">
            {error}
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Your Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="customer@gmail.com"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : mode === 'login' ? "Sign In" : "Register"}
          </button>
        </form>

        {/* Quick Testing Accounts Section */}
        {mode === 'login' && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">Testing Credentials</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin("customer@gmail.com", "customer123")}
                className="flex flex-col items-start rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-left transition hover:bg-gray-100/50"
              >
                <span className="text-[10px] font-bold text-gray-800">Customer Mode</span>
                <span className="text-[9px] text-gray-400 mt-0.5 font-mono">customer@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@gmail.com", "admin123")}
                className="flex flex-col items-start rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 text-left transition hover:bg-gray-100/50"
              >
                <span className="text-[10px] font-bold text-gray-800 flex items-center gap-0.5">
                  <span>Admin Mode</span>
                  <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                </span>
                <span className="text-[9px] text-gray-400 mt-0.5 font-mono">admin@gmail.com</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle Mode */}
        <div className="text-center text-xs text-gray-500">
          {mode === 'login' ? (
            <span>New shopper? <button onClick={() => setMode('register')} className="text-indigo-600 font-semibold hover:underline">Create an account</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => setMode('login')} className="text-indigo-600 font-semibold hover:underline">Sign in</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-mdt-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-mdt-panel border-2 border-mdt-border rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🚔</div>
            <h1 className="text-2xl font-bold text-mdt-text">MDT System</h1>
            <p className="text-mdt-muted text-sm mt-1">Mobile Data Terminal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-mdt-critical/20 border border-mdt-critical rounded-lg text-mdt-critical text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-mdt-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-lg text-mdt-text focus:border-mdt-info focus:outline-none text-lg"
                placeholder="officer@department.gov"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-mdt-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-lg text-mdt-text focus:border-mdt-info focus:outline-none text-lg"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-mdt-info text-black font-bold rounded-lg text-lg hover:bg-mdt-info/90 disabled:opacity-50 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-mdt-muted text-xs">
            Authorized personnel only. All access is logged.
          </p>
        </div>
      </div>
    </div>
  );
}

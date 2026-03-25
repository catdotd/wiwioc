// frontend/src/layout/Layout.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ title, navItems, activeKey, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-4">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-1 text-sm text-gray-600">
              Visual review of JSON templates via flat list + visual diffs
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map((it) => {
                const active = activeKey === it.key;
                return (
                  <button
                    key={it.key}
                    onClick={it.onClick}
                    className={[
                      "rounded-xl border px-3 py-1.5 text-sm",
                      active
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {it.label}
                  </button>
                );
              })}
            </nav>

            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user.username || user.email}
                </span>
                <button
                  onClick={logout}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
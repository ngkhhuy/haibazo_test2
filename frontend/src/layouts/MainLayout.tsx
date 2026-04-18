import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

type MenuItem = {
  label: string;
  basePath: string;
  icon: string;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Authors", basePath: "/authors", icon: "✍️" },
  { label: "Books", basePath: "/books", icon: "📚" },
  { label: "Reviews", basePath: "/reviews", icon: "💬" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-1.5 rounded text-sm transition-colors ${
    isActive
      ? "bg-indigo-600 text-white font-medium"
      : "text-slate-300 hover:bg-slate-700 hover:text-white"
  }`;

export default function MainLayout() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Authors: true,
    Books: true,
    Reviews: true,
  });

  const toggle = (label: string) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-slate-800 flex flex-col shadow-lg">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-700">
          <span className="text-white font-bold text-lg tracking-wide">📖 Book Review</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {MENU_ITEMS.map(({ label, basePath, icon }) => (
            <div key={label}>
              {/* Parent menu button */}
              <button
                onClick={() => toggle(label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-slate-200 hover:bg-slate-700 transition-colors text-sm font-semibold"
              >
                <span>
                  <span className="mr-2">{icon}</span>
                  {label}
                </span>
                <span className="text-slate-400 text-xs">
                  {openMenus[label] ? "▾" : "▸"}
                </span>
              </button>

              {/* Sub-menu */}
              {openMenus[label] && (
                <div className="ml-4 mt-1 space-y-0.5">
                  <NavLink to={basePath} end className={navLinkClass}>
                    List
                  </NavLink>
                  <NavLink to={`${basePath}/create`} className={navLinkClass}>
                    Create
                  </NavLink>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700 text-slate-500 text-xs">
          Haibazo © 2026
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white shadow-sm flex items-center px-6 border-b border-slate-200">
          <h1 className="text-slate-700 font-semibold text-base">HAIBAZO BOOK REVIEWS</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

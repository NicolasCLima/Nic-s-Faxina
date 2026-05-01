import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, LayoutDashboard, CalendarPlus, Settings2, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/agendamentos', icon: <CalendarPlus size={18} />, label: 'Agendamentos' },
  { to: '/gestao', icon: <Settings2 size={18} />, label: 'Gestão' },
];

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('Até logo!');
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-sand-50">
      {/* Sidebar */}
      <aside className="w-64 bg-bark-800 flex flex-col text-sand-100 shadow-warm-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-bark-700">
          <div className="w-9 h-9 bg-sand-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-bark-900" />
          </div>
          <span className="font-display text-xl font-semibold">Faxina+</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-sand-400 text-bark-900 shadow-sm'
                    : 'text-sand-300 hover:bg-bark-700 hover:text-sand-100'
                }`}
              >
                <span className={active ? 'text-bark-800' : 'text-sand-400 group-hover:text-sand-200'}>{icon}</span>
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-bark-700" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-bark-700">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-sand-400 rounded-full flex items-center justify-center text-bark-900 font-semibold text-sm flex-shrink-0">
              {user?.nome?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sand-100 text-sm font-medium truncate">{user?.nome}</p>
              <p className="text-sand-400 text-xs truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sand-400 hover:text-red-300 hover:bg-bark-700 rounded-xl text-sm transition-all duration-200"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white/70 backdrop-blur-sm border-b border-sand-200 px-8 py-5 sticky top-0 z-10">
          <h1 className="font-display text-2xl font-semibold text-bark-900">{title}</h1>
        </header>
        <div className="p-8 page-enter">{children}</div>
      </main>
    </div>
  );
}

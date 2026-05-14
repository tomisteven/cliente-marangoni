import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Trophy className="w-8 h-8" />
              <span className="hidden sm:inline">Marangoni Torneos</span>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
                <Link to="/tournaments" className="hover:text-primary transition-colors">Torneos</Link>
                <Link to="/rankings" className="hover:text-primary transition-colors">Rankings</Link>
                {['administrador', 'organizador', 'profesor'].includes(user.rol) && (
                  <Link to="/admin" className="hover:text-primary transition-colors">Administrador</Link>
                )}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-800">
                  <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{user.nombre}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">Iniciar Sesión</Link>
                <Link to="/register" className="px-4 py-2 bg-primary text-slate-950 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all">Registrarse</Link>
              </div>
            )}

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-slate-800 py-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; 2026 Marangoni Padel & Tenis. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Layout;

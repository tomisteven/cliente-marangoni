import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Layout from './layouts/Layout';
import api from './api/axios';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import TournamentList from './pages/TournamentList';
import CreateTournament from './pages/CreateTournament';
import EditTournament from './pages/EditTournament';
import TournamentDetail from './pages/TournamentDetail';
import MatchEdit from './pages/MatchEdit';
import RankingList from './pages/RankingList';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

const Home = () => {
  const [siteStats, setSiteStats] = useState({ users: 0, tournaments: 0, matches: 0 });
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tournamentsRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/tournaments'),
        ]);
        const allUsers = usersRes.data.data.filter(u => u.rol === 'jugador');
        const allTournaments = tournamentsRes.data.data;
        const totalMatches = allTournaments.reduce((acc, t) => acc + (t.bracket?.matches?.length || 0), 0);

        setSiteStats({
          users: allUsers.length,
          tournaments: allTournaments.length,
          matches: totalMatches,
        });
        setRecentTournaments(allTournaments.slice(0, 3));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const disciplinaLabel = (d) => d === 'padel' ? 'Pádel' : 'Tenis';
  const estadoColor = (e) => {
    if (e === 'activo') return 'bg-primary/20 text-primary border-primary/20';
    if (e === 'finalizado') return 'bg-slate-700/50 text-slate-400 border-slate-700';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
      {/* Hero */}
      <div className="text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-8">
          Sistema de Torneos Marangoni
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
          Domina la Cancha
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          La plataforma definitiva para gestionar torneos de pádel y tenis. Compite, sube en el ranking y llevá tus estadísticas al siguiente nivel.
        </p>
      </div>

      {/* Live Stats */}
      <div className="grid md:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass p-8 rounded-[40px] border-white/5 animate-pulse h-40" />
          ))
        ) : (
          [
            { title: 'Jugadores Registrados', value: siteStats.users, desc: 'Comunidad activa', icon: '👤', color: 'text-blue-400' },
            { title: 'Torneos en el Sistema', value: siteStats.tournaments, desc: 'Inscribite ahora', icon: '🏆', color: 'text-primary' },
            { title: 'Partidos Disputados', value: siteStats.matches, desc: 'En la plataforma', icon: '🎾', color: 'text-orange-400' }
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-[40px] border-white/5 text-center group hover:bg-white/10 transition-all">
              <span className="text-4xl mb-4 block">{stat.icon}</span>
              <h3 className="text-slate-400 font-medium mb-2 text-sm uppercase tracking-wider">{stat.title}</h3>
              <p className={`text-5xl font-black mb-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-500 text-xs font-bold">{stat.desc}</p>
            </div>
          ))
        )}
      </div>

      {/* Disciplines */}
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { key: 'padel', label: 'Pádel', emoji: '🏓', desc: 'Modalidad de dobles con pareja. Sistema de inscripción, llaves y ranking por pareja.', color: 'from-primary/20 to-transparent' },
          { key: 'tenis', label: 'Tenis', emoji: '🎾', desc: 'Individual o dobles. Clasificación por grupos, eliminación directa y ranking propio.', color: 'from-secondary/20 to-transparent' },
        ].map(d => (
          <div key={d.key} className={`glass p-10 rounded-[40px] border-white/5 bg-gradient-to-br ${d.color} relative overflow-hidden group hover:scale-[1.02] transition-all`}>
            <span className="text-6xl block mb-6">{d.emoji}</span>
            <h3 className="text-3xl font-black text-white mb-3">{d.label}</h3>
            <p className="text-slate-400 leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Tournaments */}
      {!loading && recentTournaments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-white">Torneos Recientes</h2>
            <a href="/tournaments" className="text-primary text-sm font-bold hover:underline">Ver todos →</a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recentTournaments.map(t => (
              <a key={t._id} href={`/tournaments/${t._id}`} className="glass p-6 rounded-[32px] border-white/5 hover:bg-white/10 transition-all block group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl">{t.disciplina === 'padel' ? '🏓' : '🎾'}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${estadoColor(t.estado)}`}>
                    {t.estado}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mb-1 group-hover:text-primary transition-colors">{t.nombre}</h3>
                <p className="text-xs text-slate-500 mb-3">{disciplinaLabel(t.disciplina)}</p>
                <div className="flex justify-between text-xs text-slate-400 border-t border-white/5 pt-3 mt-3">
                  <span>👥 {t.inscripciones?.length || 0} inscriptos</span>
                  <span>📅 {new Date(t.fechaInicio).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Pages (without Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main App (with Layout) */}
          <Route element={<Layout><PrivateRoute /></Layout>}>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/rankings" element={<RankingList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Route>

          {/* Admin & Organizer Routes */}
          <Route element={<Layout><PrivateRoute roles={['administrador', 'organizador', 'profesor']} /></Layout>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tournaments/create" element={<CreateTournament />} />
            <Route path="/tournaments/:id/edit" element={<EditTournament />} />
            <Route path="/matches/:id/edit" element={<MatchEdit />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

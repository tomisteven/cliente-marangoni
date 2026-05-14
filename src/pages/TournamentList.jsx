import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, Trophy, ChevronRight, Plus, ShieldCheck, ChevronLeft } from 'lucide-react';

const TournamentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data } = await api.get('/tournaments');
        setTournaments(data.data);
      } catch (error) {
        console.error('Error fetching tournaments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(t => 
    filter === 'todos' || t.disciplina === filter
  );

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Explorar Torneos</h1>
          <p className="text-slate-400">Encuentra tu próxima competencia</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
            {['todos', 'padel', 'tenis'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                  filter === f ? 'bg-primary text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {['administrador', 'organizador', 'profesor'].includes(user.rol) && (
            <Link 
              to="/tournaments/create" 
              className="px-6 py-3 bg-white text-slate-950 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Crear Torneo
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTournaments.map((t) => (
          <Link 
            key={t._id} 
            to={`/tournaments/${t._id}`}
            className="group glass p-6 rounded-3xl hover:border-primary/50 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                t.disciplina === 'padel' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {t.disciplina}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                t.estado === 'inscripcion' ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-500'
              }`}>
                {t.estado}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{t.nombre}</h3>
            
            <div className="space-y-3 mb-8">
              {t.estado === 'finalizado' && t.ganador && (
                <div className="flex items-center gap-3 text-yellow-500 font-bold text-sm bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                  <Trophy className="w-4 h-4" />
                  <span>Ganador: {t.ganador.nombre}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{new Date(t.fechaInicio).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>{t.inscripciones?.length || 0} / {t.maxJugadores} {t.disciplina === 'padel' ? 'Parejas' : 'Jugadores'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>{t.categoria || 'Categoría Única'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <span className="text-xs text-slate-500">Org: {t.organizadorId.nombre}</span>
              <div className="flex items-center gap-1 text-primary font-bold text-sm">
                Ver Detalles <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredTournaments.length === 0 && (
        <div className="text-center py-24 glass rounded-3xl">
          <p className="text-slate-500">No se encontraron torneos en esta categoría.</p>
        </div>
      )}
    </div>
  );
};

export default TournamentList;

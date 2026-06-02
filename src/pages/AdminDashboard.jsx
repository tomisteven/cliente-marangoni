import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Trophy, Activity, Shield, LayoutGrid, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import AdminPlayers from '../components/AdminPlayers';

const RebuildStatsButton = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleRebuild = async () => {
    if (!window.confirm('¿Estás seguro? Esto borrará y reconstruirá todas las estadísticas y el ranking desde cero a partir de los partidos existentes.')) return;
    setStatus('loading');
    setMessage('');
    try {
      const { data } = await api.post('/stats/rebuild');
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Error al recalcular.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 flex-shrink-0">
      <button
        onClick={handleRebuild}
        disabled={status === 'loading'}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-black text-sm hover:bg-orange-500/20 transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
        {status === 'loading' ? 'Procesando...' : 'Recalcular'}
      </button>
      {status === 'success' && (
        <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {message}</p>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {message}</p>
      )}
    </div>
  );
};


const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, tournaments: 0, matches: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [uRes, tRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/tournaments')
        ]);
        setStats({ 
          users: uRes.data.data.length, 
          tournaments: tRes.data.data.length, 
          matches: tRes.data.data.reduce((acc, t) => acc + (t.bracket?.matches?.length || 0), 0) 
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-white mb-2">Panel Central</h1>
          <p className="text-slate-400">Gestión integral del Sistema de Torneos Marangoni.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 h-fit">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview' ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Resumen
          </button>
          <button 
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'players' ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Usuarios
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400"><Users className="w-6 h-6" /></div>
                <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Usuarios Registrados</h3>
              </div>
              <p className="text-5xl font-black text-white">{stats.users}</p>
            </div>
            
            <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Trophy className="w-6 h-6" /></div>
                <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Torneos Activos</h3>
              </div>
              <p className="text-5xl font-black text-white">{stats.tournaments}</p>
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-400"><Activity className="w-6 h-6" /></div>
                <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Partidos Totales</h3>
              </div>
              <p className="text-5xl font-black text-white">{stats.matches}</p>
            </div>
          </div>

          <div className="glass p-12 rounded-[40px] border-white/5 text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6 opacity-40" />
            <h3 className="text-2xl font-bold text-white mb-4">Acceso Seguro de Administrador</h3>
            <p className="text-slate-400 max-w-lg mx-auto">
              Utiliza las pestañas superiores para navegar entre los distintos módulos de gestión. Puedes ver la lista completa de jugadores, darlos de baja o revisar sus perfiles individuales.
            </p>
          </div>

          {/* Rebuild Stats */}
          <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Recalcular Estadísticas y Ranking</h3>
              <p className="text-slate-400 text-sm">
                Reconstruye todos los datos de estadísticas y ranking desde cero, basándose en los partidos registrados en el sistema. Úsalo si los datos se ven desincronizados.
              </p>
            </div>
            <RebuildStatsButton />
          </div>
        </>
      ) : (
        <AdminPlayers />
      )}
    </div>
  );
};

export default AdminDashboard;

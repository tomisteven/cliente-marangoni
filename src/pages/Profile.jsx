import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Trophy, Zap, Target, Award, Calendar, Loader2, ShieldCheck, ChevronLeft, Edit2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const profileId = id || currentUser?._id;
  const isOwnProfile = !id || id === currentUser?._id;
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disciplina, setDisciplina] = useState('padel');
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    dni: '',
    nacionalidad: '',
    sexo: 'hombre',
    domicilio: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!profileId) {
      // If we are at /profile and currentUser is still null, we wait.
      // But if we've waited enough and no id is there, we stop loading.
      const timer = setTimeout(() => {
        if (!profileId) setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }

    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/stats/player/${profileId}`);
        setStats(data.data);
        setEditForm({
          nombre: data.data.jugadorId.nombre || '',
          apellido: data.data.jugadorId.apellido || '',
          telefono: data.data.jugadorId.telefono || '',
          dni: data.data.jugadorId.dni || '',
          nacionalidad: data.data.jugadorId.nacionalidad || '',
          sexo: data.data.jugadorId.sexo || 'hombre',
          domicilio: data.data.jugadorId.domicilio || ''
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMatches = async () => {
      try {
        setMatchesLoading(true);
        const { data } = await api.get(`/matches/user/${profileId}`);
        setMatches(data.data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setMatchesLoading(false);
      }
    };

    fetchStats();
    fetchMatches();
  }, [profileId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await api.put('/auth/update-profile', editForm);
      // Refresh stats to get updated user info
      const { data } = await api.get(`/stats/player/${profileId}`);
      setStats(data.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  if (!stats) return <div className="text-center py-24 text-slate-500">Estadísticas no encontradas.</div>;

  const dStats = stats.porDisciplina[disciplina];
  const isPlayer = stats.jugadorId.rol === 'jugador';
  
  const pieData = [
    { name: 'Ganados', value: dStats.ganados, color: '#00ff88' },
    { name: 'Perdidos', value: dStats.perdidos, color: '#1e293b' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver
      </button>

      {/* Profile Header */}
      <div className="glass p-8 rounded-3xl border-white/10 mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="w-32 h-32 rounded-3xl bg-slate-800 flex items-center justify-center border-2 border-primary/20 relative z-10">
          {stats.jugadorId.avatar ? <img src={stats.jugadorId.avatar} className="rounded-3xl" alt="avatar" /> : <User className="w-16 h-16 text-slate-500" />}
        </div>
        
        <div className="flex-grow text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-white">{stats.jugadorId.nombre} {stats.jugadorId.apellido}</h1>
            <span className="w-fit mx-auto md:mx-0 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
              {stats.jugadorId.rol}
            </span>
            {isOwnProfile && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-fit mx-auto md:mx-0 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Editar Perfil
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400">
            <span className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> {isPlayer ? 'Jugador' : 'Personal'} de {stats.jugadorId.disciplinas.map(d => d === 'padel' ? 'Pádel' : 'Tenis').join(' & ')}</span>
            {stats.jugadorId.categoria && (
              <span className="flex items-center gap-2 text-purple-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> Categoría {stats.jugadorId.categoria}
              </span>
            )}
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Miembro desde 2026</span>
          </div>
        </div>

        {isPlayer && (
          <div className="flex gap-4 bg-slate-950/50 p-1 rounded-2xl border border-slate-800 relative z-10">
            {['padel', 'tenis'].map(d => (
              <button
                key={d}
                onClick={() => setDisciplina(d)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                  disciplina === d ? 'bg-primary text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'padel' ? 'Pádel' : 'Tenis'}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isPlayer ? (
        <div className="glass p-12 rounded-[40px] border-white/5 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Perfil de {stats.jugadorId.rol}</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            Has accedido a tu perfil de gestión. Aquí puedes mantener tus datos personales actualizados. Las estadísticas competitivas solo están disponibles para perfiles de jugadores.
          </p>
          {isOwnProfile && (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all"
            >
              Completar mis datos
            </button>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Stats Cards */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm mb-1">Partidos</p>
              <p className="text-3xl font-black text-white">{dStats.partidosJugados}</p>
            </div>
            <div className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                <Target className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm mb-1">Victorias</p>
              <p className="text-3xl font-black text-white">{dStats.ganados}</p>
            </div>
            <div className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm mb-1">Torneos Ganados</p>
              <p className="text-3xl font-black text-white">{dStats.torneoGanados}</p>
            </div>
            <div className="glass p-6 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm mb-1">Torneos Jugados</p>
              <p className="text-3xl font-black text-white">{dStats.torneoJugados}</p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-8">Efectividad en la Cancha</h3>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-400">Porcentaje de Victorias</span>
                    <span className="text-sm font-bold text-primary">{Math.round((dStats.ganados / (dStats.partidosJugados || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(dStats.ganados / (dStats.partidosJugados || 1)) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-400">Eficacia en Sets</span>
                    <span className="text-sm font-bold text-secondary">{Math.round((dStats.setsGanados / ((dStats.setsGanados + dStats.setsPerdidos) || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${(dStats.setsGanados / ((dStats.setsGanados + dStats.setsPerdidos) || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Mis Partidos</h3>
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{matches.length} partidos totales</span>
            </div>
            
            <div className="space-y-4">
              {matchesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : matches.length > 0 ? (
                matches.map(m => {
                  const isPadel = m.torneoId?.disciplina === 'padel';
                  const p1Name = isPadel ? m.pareja1?.map(p => p.nombre).join(' + ') : m.jugador1?.nombre;
                  const p2Name = isPadel ? m.pareja2?.map(p => p.nombre).join(' + ') : m.jugador2?.nombre;
                  const res = m.resultado?.sets || [];
                  const ganadorId = m.resultado?.ganador?.toString();
                  
                  const isInTeam1 = isPadel 
                    ? m.pareja1?.some(p => (p._id || p).toString() === profileId.toString())
                    : (m.jugador1?._id || m.jugador1)?.toString() === profileId.toString();
                  
                  const team1Won = isPadel
                    ? m.pareja1?.some(p => (p._id || p).toString() === ganadorId)
                    : (m.jugador1?._id || m.jugador1)?.toString() === ganadorId;

                  const isWinner = isInTeam1 ? team1Won : !team1Won;

                  return (
                    <div key={m._id} className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="w-full md:w-1/4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{m.torneoId?.nombre || 'Torneo'}</p>
                        <p className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex-grow flex items-center justify-center gap-8 w-full md:w-auto">
                        <div className={`text-right w-1/3 text-xs font-bold ${isWinner && isInTeam1 ? 'text-white' : 'text-slate-400'}`}>{p1Name || '??'}</div>
                        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-white/10 font-black text-white text-sm">
                          {res.length > 0 ? res.map(s => `${s.jugador1}-${s.jugador2}`).join(' / ') : 'PENDIENTE'}
                        </div>
                        <div className={`text-left w-1/3 text-xs font-bold ${isWinner && !isInTeam1 ? 'text-white' : 'text-slate-400'}`}>{p2Name || '??'}</div>
                      </div>

                      <div className="w-full md:w-24 flex flex-col items-center gap-2">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          isWinner ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                        }`}>
                          {isWinner ? 'GANADO' : 'PERDIDO'}
                        </span>
                        {['administrador', 'organizador', 'profesor'].includes(currentUser.rol) && (
                          <button 
                            onClick={() => navigate(`/matches/${m._id}/edit`)}
                            className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Editar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 italic">No hay partidos registrados para este perfil.</div>
              )}
            </div>
          </div>
        </div>

        {/* Side Column: H2H or History */}
        <div className="glass p-8 rounded-3xl border-white/5 space-y-8 h-fit sticky top-8">
          <h3 className="text-xl font-bold text-white">Historial Cara a Cara</h3>
          <div className="space-y-4">
            {stats.historialVsJugadores.slice(0, 8).map(h => (
              <div key={h.rivalId._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
                    {h.rivalId.avatar ? <img src={h.rivalId.avatar} className="w-full h-full object-cover" alt="avatar" /> : <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-bold text-slate-300">{h.rivalId.nombre}</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-black">{h.ganados}V</span>
                  <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-black">{h.perdidos}D</span>
                </div>
              </div>
            ))}
            {stats.historialVsJugadores.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8 italic">Sin partidos registrados aún.</p>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="glass w-full max-w-2xl p-8 rounded-[40px] border-white/10 relative z-10 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black text-white mb-8">Editar Datos Personales</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2">Nombre</label>
                  <input 
                    type="text" 
                    value={editForm.nombre}
                    onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2">Apellido</label>
                  <input 
                    type="text" 
                    value={editForm.apellido}
                    onChange={e => setEditForm({...editForm, apellido: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2">DNI</label>
                  <input 
                    type="text" 
                    value={editForm.dni}
                    onChange={e => setEditForm({...editForm, dni: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2">Teléfono</label>
                  <input 
                    type="text" 
                    value={editForm.telefono}
                    onChange={e => setEditForm({...editForm, telefono: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2">Nacionalidad</label>
                  <input 
                    type="text" 
                    value={editForm.nacionalidad}
                    onChange={e => setEditForm({...editForm, nacionalidad: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2">Sexo</label>
                  <select 
                    value={editForm.sexo}
                    onChange={e => setEditForm({...editForm, sexo: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 ml-2">Domicilio</label>
                <input 
                  type="text" 
                  value={editForm.domicilio}
                  onChange={e => setEditForm({...editForm, domicilio: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-2xl border border-white/5 text-slate-400 font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

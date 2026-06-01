import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, Trophy, ChevronLeft, ShieldCheck, Play, User, Settings, ExternalLink, Trash2, UserPlus, ChevronRight, Search, Check, Loader2, LayoutGrid, Award, X, Maximize, Minimize } from 'lucide-react';
import BracketMatch from '../components/BracketMatch';
import AdminEnrollment from '../components/AdminEnrollment';
import AdminZones from '../components/AdminZones';
import GroupStage from '../components/GroupStage';
import ManualMatchCreator from '../components/ManualMatchCreator';

const TournamentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bracketRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'zonas', 'grupos', 'cuadro'
  const [bracketType, setBracketType] = useState('principal'); // 'principal', 'perdedores'
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/matches/${id}`)
      ]);
      setTournament(tRes.data.data);
      setMatches(mRes.data.data);
      
      // Auto-set tab if not set
      if (!activeTab) {
        const hasGroupMatches = mRes.data.data.some(m => m.grupo);
        const hasBracket = mRes.data.data.some(m => !m.grupo);
        const isManualZones = ['eliminacion_directa_perdedores', 'grupos_1y2_eliminacion'].includes(tRes.data.data.formato);
        const estado = tRes.data.data.estado;
        
        if (isManualZones && (estado === 'inscripcion' || (estado === 'en_curso' && !hasGroupMatches))) {
          setActiveTab('zonas');
        } else if (hasBracket) {
          setActiveTab('cuadro');
        } else {
          setActiveTab('grupos');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnroll = async () => {
    if (tournament.disciplina === 'padel' && !selectedPartner) {
      await fetchUsers();
      setShowPartnerModal(true);
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/tournaments/${id}/enroll`, { 
        tournamentId: id,
        jugador2Id: selectedPartner?._id 
      });
      setShowPartnerModal(false);
      setSelectedPartner(null);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al inscribirse');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStart = async () => {
    try {
      await api.post(`/tournaments/${id}/start`);
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al iniciar');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este torneo? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/tournaments/${id}`);
      navigate('/tournaments');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleAdvance = async () => {
    try {
      await api.post(`/tournaments/${id}/advance`);
      await fetchData();
      setActiveTab('cuadro'); // Switch to bracket view automatically
    } catch (error) {
      alert(error.response?.data?.message || 'Error al generar eliminatorias');
    }
  };

  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState(null);
  const [editingParticipants, setEditingParticipants] = useState(false);

  const handleUpdateParticipants = async (e) => {
    e.preventDefault();
    setEditingParticipants(true);
    try {
      const isDoubles = tournament.disciplina === 'padel';
      const payload = isDoubles 
        ? { pareja1: selectedMatchForEdit.pareja1, pareja2: selectedMatchForEdit.pareja2 }
        : { jugador1: selectedMatchForEdit.jugador1, jugador2: selectedMatchForEdit.jugador2 };

      await api.put(`/matches/${selectedMatchForEdit._id}/participants`, payload);
      setSelectedMatchForEdit(null);
      await fetchData();
    } catch (error) {
      alert('Error al actualizar jugadores');
    } finally {
      setEditingParticipants(false);
    }
  };


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      bracketRef.current.requestFullscreen().catch(err => {
        alert(`Error al intentar poner en pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  if (!tournament) return <div className="text-center py-24">Torneo no encontrado</div>;

  const isEnrolled = tournament.inscripciones?.some(i => 
    i.jugador1?._id === user.id || (i.jugador2 && i.jugador2?._id === user.id)
  );
  const isOrganizer = tournament.organizadorId._id === user.id || user.rol === 'administrador';
  const handleDeleteMatch = async (matchId) => {
    try {
      await api.delete(`/matches/${matchId}`);
      await fetchData();
    } catch (error) {
      alert('Error al eliminar partido');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/tournaments')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Volver
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            tournament.disciplina === 'padel' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
          }`}>
            {tournament.disciplina} • {tournament.categoria || 'Cat. Libre'}
          </div>
          <div className="px-4 py-1.5 bg-slate-800 rounded-full text-xs font-bold text-slate-300 uppercase tracking-widest">
            {tournament.estado.replace('_', ' ')}
          </div>
          {isOrganizer && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(`/tournaments/${id}/edit`)}
                className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-slate-950 transition-all shadow-lg"
                title="Editar Torneo"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                title="Eliminar Torneo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 mb-12">
        {/* Info Card */}
        <div className="lg:col-span-3 glass p-8 rounded-3xl border-white/10 flex flex-col md:flex-row justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white mb-4">{tournament.nombre}</h1>
            <p className="text-slate-400 max-w-2xl mb-8">{tournament.descripcion || 'Torneo oficial Marangoni.'}</p>
            
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Fecha</p>
                  <p className="text-sm font-bold text-white">{new Date(tournament.fechaInicio).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Inscritos</p>
                  <p className="text-sm font-bold text-white">{tournament.inscripciones?.length} / {tournament.maxJugadores}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Formato</p>
                  <p className="text-sm font-bold text-white capitalize">{tournament.formato.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-[200px] gap-4 relative z-10">
            {tournament.estado === 'inscripcion' && !isEnrolled && (
              <button onClick={handleEnroll} disabled={enrolling} className="w-full bg-primary text-slate-950 font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
                {enrolling ? 'Procesando...' : 'Inscribirse Ahora'}
              </button>
            )}
            {isEnrolled && tournament.estado === 'inscripcion' && (
              <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-2xl text-center font-bold">✓ Inscrito</div>
            )}
            {isOrganizer && tournament.estado === 'inscripcion' && (
              <button onClick={handleStart} className="w-full bg-white text-slate-950 font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-lg">
                <Play className="w-4 h-4 inline mr-2 fill-current" /> Iniciar Cuadro
              </button>
            )}
          </div>
        </div>

        {/* Winner Banner */}
        {tournament.estado === 'finalizado' && tournament.ganador && (
          <div className="lg:col-span-4 mt-4">
            <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent border border-yellow-500/30 p-8 rounded-[40px] flex items-center justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.1),transparent)] opacity-50"></div>
              
              <div className="flex items-center gap-8 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 bg-yellow-500 rounded-[24px] flex items-center justify-center shadow-2xl shadow-yellow-500/50 transform group-hover:rotate-12 transition-transform duration-500">
                    <Trophy className="w-10 h-10 text-slate-950" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-black text-slate-950">#1</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-2">Campeón Indiscutido</p>
                  <h2 className="text-4xl font-black text-white tracking-tight">{tournament.ganador.nombre} {tournament.ganador.apellido}</h2>
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-end gap-2 relative z-10">
                <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-right">Menciones Especiales</p>
                </div>
                <p className="text-sm text-slate-400 font-medium italic">"El esfuerzo de hoy es la victoria de mañana"</p>
              </div>
            </div>
          </div>
        )}

        {/* Participants Summary */}
        <div className="glass p-8 rounded-[32px] border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Gestión de Jugadores</h3>
              <span className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                {tournament.inscripciones?.length} / {tournament.maxJugadores}
              </span>
            </div>
            
            <div className="flex -space-x-3 overflow-hidden p-2">
              {tournament.inscripciones?.slice(0, 8).map((insc, i) => (
                <div key={i} className="relative group">
                  <img
                    className="inline-block h-10 w-10 rounded-2xl ring-4 ring-slate-950 object-cover"
                    src={insc.jugador1?.avatar || `https://ui-avatars.com/api/?name=${insc.jugador1?.nombre}`}
                    alt=""
                    title={insc.jugador2 ? `${insc.jugador1?.nombre} + ${insc.jugador2?.nombre}` : insc.jugador1?.nombre}
                  />
                  {insc.jugador2 && (
                    <img
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg ring-2 ring-slate-950 object-cover"
                      src={insc.jugador2?.avatar || `https://ui-avatars.com/api/?name=${insc.jugador2?.nombre}`}
                      alt=""
                    />
                  )}
                </div>
              ))}
              {tournament.inscripciones?.length > 8 && (
                <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-slate-800 text-xs font-black text-slate-400 ring-4 ring-slate-950">
                  +{tournament.inscripciones?.length - 8}
                </div>
              )}
            </div>
          </div>
          
          <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
            Lista Completa <ExternalLink className="w-3 h-3" />
          </button>

          {isOrganizer && tournament.estado === 'inscripcion' && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">Gestión rápida desde lateral</p>
              <div className="bg-primary/5 p-4 rounded-2xl text-[10px] text-primary font-bold text-center">
                Usa el panel inferior para gestionar jugadores en formato tabla.
              </div>
            </div>
          )}
        </div>
      </div>

      {isOrganizer && tournament.estado === 'inscripcion' && (
        <div className="mb-12">
          <AdminEnrollment 
            tournamentId={id} 
            tournamentDisciplina={tournament.disciplina}
            onEnrolled={fetchData} 
            inscriptions={tournament.inscripciones}
            enrolledIds={tournament.inscripciones?.flatMap(i => [i.jugador1?._id, i.jugador2?._id].filter(id => id))}
          />
        </div>
      )}

      {/* Full Width Bracket Section */}
      <div 
        ref={bracketRef} 
        className={`glass rounded-[40px] border-white/5 overflow-hidden min-h-[600px] flex flex-col ${isFullscreen ? 'bg-slate-950 p-4' : ''}`}
      >
        <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black text-white">Competencia</h2>
            
            <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/10">
              {isOrganizer && ['eliminacion_directa_perdedores', 'grupos_1y2_eliminacion'].includes(tournament.formato) && (
                <button 
                  onClick={() => setActiveTab('zonas')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'zonas' ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Zonas
                </button>
              )}
              {(matches.some(m => m.grupo) || activeTab === 'zonas') && (
                <button 
                  onClick={() => setActiveTab('grupos')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'grupos' ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Users className="w-3.5 h-3.5" /> Fase de Grupos
                </button>
              )}
              {(matches.some(m => !m.grupo) || tournament.estado === 'en_curso') && (
                <button 
                  onClick={() => setActiveTab('cuadro')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'cuadro' ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Trophy className="w-3.5 h-3.5" /> Eliminatorias
                </button>
              )}
            </div>

            {activeTab === 'cuadro' && tournament.bracketSecundario && (
              <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setBracketType('principal')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bracketType === 'principal' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Cuadro Principal
                </button>
                <button 
                  onClick={() => setBracketType('perdedores')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bracketType === 'perdedores' ? 'bg-secondary/20 text-secondary' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Perdedores
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest no-print">
              <span>En Juego: {matches.filter(m => m.estado === 'en_curso').length}</span>
              <span>Finalizados: {matches.filter(m => m.estado === 'finalizado').length}</span>
            </div>
            
            <button 
              onClick={toggleFullscreen}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/5"
            >
              {isFullscreen ? (
                <><Minimize className="w-4 h-4" /> Salir</>
              ) : (
                <><Maximize className="w-4 h-4" /> Pantalla Completa</>
              )}
            </button>
          </div>
        </div>
        
        {isOrganizer && tournament.estado === 'en_curso' && tournament.formato === 'manual' && (
          <div className="px-8 pt-8">
            <ManualMatchCreator 
              tournamentId={id} 
              players={tournament.inscripciones} 
              onCreated={fetchData} 
            />
          </div>
        )}

        <div className="flex-grow overflow-x-auto p-12 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-transparent">
          {activeTab === 'zonas' ? (
            <AdminZones 
              tournamentId={id}
              zones={tournament.zonas}
              inscriptions={tournament.inscripciones}
              onUpdate={fetchData}
              disciplina={tournament.disciplina}
            />
          ) : ['borrador', 'inscripcion'].includes(tournament.estado) && activeTab !== 'zonas' ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
              <Trophy className="w-24 h-24 mb-6" />
              <p className="text-xl font-bold uppercase tracking-widest">El cuadro se generará al iniciar el torneo</p>
            </div>
          ) : activeTab === 'grupos' ? (
            <GroupStage 
              tournament={tournament}
              matches={matches.filter(m => m.grupo)}
              isOrganizer={isOrganizer}
              onEditMatch={(mid) => navigate(`/matches/${mid}/edit`)}
              onDeleteMatch={handleDeleteMatch}
              onAdvance={handleAdvance}
            />
          ) : (
            <div className="flex gap-16 min-w-max items-center">
              {Array.from({ length: (bracketType === 'principal' ? tournament.bracket?.rounds : tournament.bracketSecundario?.rounds) || 0 }).map((_, i) => {
                const roundMatches = matches.filter(m => !m.grupo && m.ronda === i + 1 && m.tipoCuadro === bracketType);
                const roundColors = [
                  'text-primary border-primary/20 bg-primary/5',
                  'text-secondary border-secondary/20 bg-secondary/5',
                  'text-purple-400 border-purple-400/20 bg-purple-400/5',
                  'text-orange-400 border-orange-400/20 bg-orange-400/5',
                  'text-pink-400 border-pink-400/20 bg-pink-400/5'
                ];
                const colorClass = roundColors[i % roundColors.length];

                const getRoundName = (roundIdx, totalRounds) => {
                  const remainingRounds = totalRounds - roundIdx;
                  if (remainingRounds === 1) return '🏆 Gran Final';
                  if (remainingRounds === 2) return 'Semifinales';
                  if (remainingRounds === 3) return 'Cuartos de Final';
                  if (remainingRounds === 4) return 'Octavos de Final';
                  if (remainingRounds === 5) return 'Dieciseisavos (16avos)';
                  return `Ronda ${roundIdx + 1}`;
                };

                return (
                  <div key={i} className="flex flex-col gap-12">
                    <h4 className={`text-center font-black text-[10px] uppercase tracking-[0.3em] mb-4 py-2 px-4 rounded-lg border ${colorClass}`}>
                      {getRoundName(i, (bracketType === 'principal' ? tournament.bracket?.rounds : tournament.bracketSecundario?.rounds))}
                    </h4>
                    <div className="flex flex-col gap-8 justify-around h-full">
                      {roundMatches.map(match => (
                        <BracketMatch 
                          key={match._id} 
                          match={match} 
                          isOrganizer={isOrganizer} 
                          roundColor={colorClass}
                          onEdit={(id) => navigate(`/matches/${id}/edit`)} 
                          onDelete={handleDeleteMatch}
                          onEditParticipants={(m) => setSelectedMatchForEdit({
                            ...m,
                            jugador1: m.jugador1?._id || m.jugador1,
                            jugador2: m.jugador2?._id || m.jugador2,
                            pareja1: m.pareja1?.map(p => p._id || p),
                            pareja2: m.pareja2?.map(p => p._id || p)
                          })}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Partner Selection Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowPartnerModal(false)}></div>
          <div className="relative glass rounded-[40px] border border-white/10 w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">Elige a tu compañero</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Busca por nombre o email</p>
              </div>
              <button onClick={() => setShowPartnerModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Buscar jugador..."
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-primary outline-none transition-all"
                  value={partnerSearch}
                  onChange={(e) => setPartnerSearch(e.target.value)}
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                {users
                  .filter(u => 
                    u._id !== user.id && 
                    !enrolledIds.includes(u._id) &&
                    (u.nombre.toLowerCase().includes(partnerSearch.toLowerCase()) || u.email.toLowerCase().includes(partnerSearch.toLowerCase()))
                  )
                  .map(u => (
                    <button 
                      key={u._id}
                      onClick={() => setSelectedPartner(u)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedPartner?._id === u._id 
                        ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                          {u.nombre[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{u.nombre} {u.apellido}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{u.email}</p>
                        </div>
                      </div>
                      {selectedPartner?._id === u._id && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  ))
                }
              </div>

              <button 
                onClick={handleEnroll}
                disabled={!selectedPartner || enrolling}
                className="w-full bg-primary text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Confirmar Inscripción
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Participant Edit Modal */}
      {selectedMatchForEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedMatchForEdit(null)}></div>
          <div className="relative glass rounded-[40px] border border-white/10 w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">Editar Jugadores del Partido</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Selecciona los participantes manualmente</p>
              </div>
              <button onClick={() => setSelectedMatchForEdit(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateParticipants} className="p-8 space-y-8">
              {tournament.disciplina === 'padel' ? (
                // Lógica de Dobles (Selección por Parejas inscritas)
                <div className="space-y-6">
                  {[1, 2].map(num => (
                    <div key={num}>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Pareja {num}</label>
                      <select 
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-primary outline-none transition-all"
                        value={tournament.inscripciones.find(i => 
                          i.jugador1?._id === selectedMatchForEdit[`pareja${num}`]?.[0] && 
                          i.jugador2?._id === selectedMatchForEdit[`pareja${num}`]?.[1]
                        )?._id || ''}
                        onChange={(e) => {
                          const insc = tournament.inscripciones.find(i => i._id === e.target.value);
                          const pair = insc ? [insc.jugador1._id, insc.jugador2._id] : [];
                          setSelectedMatchForEdit({...selectedMatchForEdit, [`pareja${num}`]: pair});
                        }}
                      >
                        <option value="">Seleccionar Pareja</option>
                        {tournament.inscripciones.map(insc => (
                          <option key={insc._id} value={insc._id}>
                            {insc.jugador1.nombre} {insc.jugador1.apellido} + {insc.jugador2?.nombre} {insc.jugador2?.apellido}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                // Lógica de Singles
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(num => (
                    <div key={num}>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Jugador {num}</label>
                      <select 
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-primary outline-none transition-all"
                        value={selectedMatchForEdit[`jugador${num}`] || ''}
                        onChange={(e) => setSelectedMatchForEdit({...selectedMatchForEdit, [`jugador${num}`]: e.target.value})}
                      >
                        <option value="">Seleccionar Jugador</option>
                        {tournament.inscripciones.map(insc => (
                          <option key={insc._id} value={insc.jugador1._id}>
                            {insc.jugador1.nombre} {insc.jugador1.apellido}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedMatchForEdit(null)}
                  className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={editingParticipants}
                  className="flex-[2] bg-primary text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {editingParticipants ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;

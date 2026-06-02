import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  Trophy,
  ChevronRight,
  Plus,
  ShieldCheck,
  ChevronLeft,
  Copy,
  Check,
  LayoutGrid,
  List,
  Play,
  Clock
} from 'lucide-react';

const TournamentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom Filters
  const [disciplineFilter, setDisciplineFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const handleCopyLink = (e, tournamentId) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/tournaments/${tournamentId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(tournamentId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Error al copiar el enlace', err);
    });
  };

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

  const filteredTournaments = tournaments.filter(t => {
    const matchesDiscipline = disciplineFilter === 'todos' || t.disciplina === disciplineFilter;
    const matchesStatus = statusFilter === 'todos' || t.estado === statusFilter;
    return matchesDiscipline && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Helper to render capacity percentage
  const getCapacityPercent = (t) => {
    const registered = t.inscripciones?.length || 0;
    const max = t.maxJugadores || 1;
    return Math.min(Math.round((registered / max) * 100), 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Volver button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver
      </button>

      {/* Header section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">


        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Discipline Selector */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            {['todos', 'padel', 'tenis'].map(f => (
              <button
                key={f}
                onClick={() => setDisciplineFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${disciplineFilter === f ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            {[
              { val: 'todos', label: 'Todos' },
              { val: 'inscripcion', label: 'Inscripción' },
              { val: 'en_curso', label: 'En Curso' },
              { val: 'finalizado', label: 'Finalizados' }
            ].map(s => (
              <button
                key={s.val}
                onClick={() => setStatusFilter(s.val)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${statusFilter === s.val ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* View Mode Grid / List */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Vista Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Vista Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Create Button */}
          {user && ['administrador', 'organizador', 'profesor'].includes(user.rol) && (
            <Link
              to="/tournaments/create"
              className="px-6 py-3.5 bg-primary text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/10 ml-auto xl:ml-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Crear Torneo
            </Link>
          )}
        </div>
      </div>

      {/* Grid View rendering */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((t) => {
            const isCompleted = t.estado === 'finalizado';
            const isActive = t.estado === 'en_curso';
            const isEnroll = t.estado === 'inscripcion';

            // Layout styling depending on status
            let borderClass = 'border-white/5 hover:border-slate-700/80';
            let glowClass = '';
            let statusLabel = 'Inscripción Abierta';
            let badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';

            if (isCompleted) {
              borderClass = 'border-amber-500/10 hover:border-amber-500/30';
              glowClass = 'hover:shadow-amber-500/5 shadow-2xl';
              statusLabel = 'Torneo Finalizado';
              badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            } else if (isActive) {
              borderClass = 'border-blue-500/10 hover:border-blue-500/30';
              glowClass = 'hover:shadow-blue-500/5 shadow-2xl';
              statusLabel = 'En Juego';
              badgeColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            }

            return (
              <Link
                key={t._id}
                to={`/tournaments/${t._id}`}
                className={`group glass p-7 rounded-[36px] transition-all relative overflow-hidden flex flex-col justify-between min-h-[380px] ${borderClass} ${glowClass}`}
              >
                {/* Visual state accents */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all"></div>
                )}
                {isActive && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all"></div>
                )}
                {isEnroll && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
                )}

                <div>
                  {/* Card Header Tags */}
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${t.disciplina === 'padel' ? 'bg-green-500/10 text-green-400' : 'bg-sky-500/10 text-sky-400'
                      }`}>
                      {t.disciplina}
                    </span>

                    <span className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${badgeColor}`}>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>}
                      {statusLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-black text-white tracking-tight mb-4 group-hover:text-primary transition-colors leading-tight">
                    {t.nombre}
                  </h3>

                  {/* Description or details */}
                  <div className="space-y-4 mb-6 relative z-10">
                    {isCompleted && t.ganador ? (
                      <div className="flex items-center gap-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-300">
                        <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-wider text-amber-500/80 leading-none mb-1">Campeón</p>
                          <p className="text-sm font-bold truncate">{t.ganador.nombre}</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Meta stats grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Fecha</p>
                          <p className="text-xs font-bold text-slate-300">{new Date(t.fechaInicio).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Categoría</p>
                          <p className="text-xs font-bold text-slate-300 truncate max-w-[90px]">{t.categoria || 'Cat. Libre'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-6 border-t border-slate-800/80 relative z-10">
                  {/* Capacity Progress Bar (For open/active tournaments) */}
                  {!isCompleted && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-slate-400 font-bold mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>Cupos: {t.inscripciones?.length || 0} / {t.maxJugadores}</span>
                        </span>
                        <span>{getCapacityPercent(t)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-blue-500' : 'bg-primary'
                            }`}
                          style={{ width: `${getCapacityPercent(t)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Org: {t.organizadorId?.nombre || 'Club'}
                      </span>
                      <button
                        onClick={(e) => handleCopyLink(e, t._id)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all flex items-center justify-center"
                        title="Copiar Link del Torneo"
                      >
                        {copiedId === t._id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-primary font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      {isActive ? 'Ver Cuadro' : isCompleted ? 'Resultados' : 'Detalles'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List View rendering - Highly Premium Table style */
        <div className="glass rounded-[36px] border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/20">
                  <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Torneo</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Disciplina</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Detalles</th>
                  <th className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredTournaments.map((t) => {
                  const isCompleted = t.estado === 'finalizado';
                  const isActive = t.estado === 'en_curso';

                  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  let statusText = 'Inscripción';
                  if (isCompleted) {
                    badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    statusText = 'Finalizado';
                  } else if (isActive) {
                    badgeColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    statusText = 'En Juego';
                  }

                  return (
                    <tr
                      key={t._id}
                      onClick={() => navigate(`/tournaments/${t._id}`)}
                      className="hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      {/* Name / Organizer */}
                      <td className="py-6 px-8">
                        <div>
                          <p className="text-lg font-black text-white group-hover:text-primary transition-colors">{t.nombre}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mt-0.5">Org: {t.organizadorId?.nombre}</p>
                        </div>
                      </td>

                      {/* Discipline */}
                      <td className="py-6 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${t.disciplina === 'padel' ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-sky-500/10 text-sky-400 border border-sky-500/10'
                          }`}>
                          {t.disciplina}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-6 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${badgeColor}`}>
                          {isActive && <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></span>}
                          {statusText}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-6 px-6 text-sm font-bold text-slate-300">
                        {new Date(t.fechaInicio).toLocaleDateString()}
                      </td>

                      {/* Category */}
                      <td className="py-6 px-6 text-sm font-bold text-slate-400">
                        {t.categoria || 'Cat. Libre'}
                      </td>

                      {/* Inscriptions / Winner */}
                      <td className="py-6 px-6">
                        {isCompleted && t.ganador ? (
                          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                            <Trophy className="w-3.5 h-3.5" /> {t.ganador.nombre}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">{t.inscripciones?.length || 0} / {t.maxJugadores}</span>
                            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isActive ? 'bg-blue-500' : 'bg-primary'}`}
                                style={{ width: `${getCapacityPercent(t)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-6 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => handleCopyLink(e, t._id)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-primary transition-all flex items-center justify-center shadow"
                            title="Copiar Link"
                          >
                            {copiedId === t._id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <Link
                            to={`/tournaments/${t._id}`}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-slate-950 rounded-xl transition-all flex items-center justify-center shadow"
                          >
                            <ChevronRight className="w-4 h-4 stroke-[3]" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTournaments.length === 0 && (
        <div className="text-center py-24 glass rounded-[40px] border-white/5">
          <p className="text-slate-500 text-lg font-medium">No se encontraron torneos en esta sección.</p>
        </div>
      )}
    </div>
  );
};

export default TournamentList;

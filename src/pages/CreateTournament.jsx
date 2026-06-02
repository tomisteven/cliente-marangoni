import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Calendar, Users, Settings, Plus, Loader2, Info, CheckCircle2, Layers, Swords } from 'lucide-react';

const FORMAT_INFO = {
  'grupos_+_eliminacion': {
    titulo: 'Grupos + Eliminación Directa',
    emoji: '🏆',
    color: 'primary',
    descripcion: 'El formato más utilizado en torneos profesionales (Copa del Mundo, ATP, etc.). Combina una fase de grupos justa con una eliminación directa emocionante.',
    fases: [
      { icon: '📋', label: 'Fase de Grupos', desc: 'Todos juegan contra todos dentro de su grupo (round robin). Los mejores clasifican.' },
      { icon: '⚔️', label: 'Eliminación Directa', desc: 'Los clasificados se enfrentan en bracket. Quien pierde queda afuera hasta el campeón.' },
    ],
    stats: [
      { label: 'Partidos mínimos por jugador', value: '3+' },
      { label: 'Grupos (16 jugadores)', value: '4 grupos de 4' },
      { label: 'Total partidos aprox.', value: '~31' },
    ]
  },
  'eliminacion_directa_perdedores': {
    titulo: 'Grupos + Eliminación Directa + Perdedores',
    emoji: '🎾',
    color: 'secondary',
    descripcion: 'El formato más justo del circuito. Nadie queda eliminado tras una sola derrota: hay dos cuadros activos y dos campeones al final.',
    fases: [
      { icon: '📋', label: 'Fase de Grupos (Zonas)', desc: 'El organizador arma las zonas manualmente. Todos juegan contra todos dentro de su zona.' },
      { icon: '🥇', label: 'Cuadro Principal', desc: 'Los 2 mejores de cada zona compiten por el título absoluto.' },
      { icon: '🥈', label: 'Cuadro de Perdedores', desc: 'Los eliminados en grupos tienen una segunda oportunidad de ganar su propio cuadro.' },
    ],
    stats: [
      { label: 'Partidos mínimos por jugador', value: '4-6' },
      { label: 'Total partidos aprox. (16 jug.)', value: '~38' },
      { label: 'Campeones al final', value: '2 (principal + perdedores)' },
    ]
  },
  'grupos_1y2_eliminacion': {
    titulo: 'Zona de grupos + 1º y 2º + eliminación directa',
    emoji: '🔥',
    color: 'purple',
    descripcion: 'Formato competitivo donde el sembrado de la llave de eliminación es estricto: los mejores (1º) juegan contra otros líderes de zona, y los segundos (2º) entre sí.',
    fases: [
      { icon: '📋', label: 'Fase de Grupos (Zonas)', desc: 'Zonas armadas de forma manual. Clasifican los 2 mejores de cada una.' },
      { icon: '🥇', label: 'Cruces de Líderes', desc: 'Los primeros (1º) se enfrentan entre sí en su mitad de la llave.' },
      { icon: '🥈', label: 'Cruces de Segundos', desc: 'Los segundos (2º) se enfrentan entre sí en la otra mitad de la llave.' },
      { icon: '🏆', label: 'Gran Final', desc: 'El mejor del cuadro de primeros se enfrenta al mejor del cuadro de segundos por la gloria.' }
    ],
    stats: [
      { label: 'Partidos mínimos por jugador', value: '3-4' },
      { label: 'Cruces de Eliminación', value: '1º vs 1º y 2º vs 2º' },
      { label: 'Total partidos aprox. (16 jug.)', value: '~31' }
    ]
  },
  'eliminacion_directa': {
    titulo: 'Eliminación Directa',
    emoji: '⚡',
    color: 'orange',
    descripcion: 'El formato más rápido y directo. El organizador arma manualmente los cruces de la primera ronda y desde ahí es eliminación directa pura: quien pierde, queda afuera.',
    fases: [
      { icon: '✏️', label: 'Armado Manual de Cruces', desc: 'El organizador decide quién juega contra quién en la primera ronda (8vos o cuartos).' },
      { icon: '⚔️', label: 'Eliminación Directa', desc: 'Desde la primera ronda, quien pierde queda eliminado. El ganador avanza hasta la final.' },
      { icon: '🏆', label: 'Gran Final', desc: 'Los dos últimos en pie se enfrentan por el título.' }
    ],
    stats: [
      { label: 'Partidos por jugador (mín)', value: '1' },
      { label: 'Primera ronda', value: '8vos o Cuartos' },
      { label: 'Total partidos aprox. (16 jug.)', value: '15' }
    ]
  }
};


const CreateTournament = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    disciplina: 'padel',
    formato: 'grupos_+_eliminacion',
    maxJugadores: 16,
    minJugadores: 4,
    fechaInicio: '',
    fechaLimiteInscripcion: '',
    descripcion: '',
    categoria: '',
    premio: '',
    puntosConfig: {
      partidoGanadoGrupo: 10,
      partidoPerdidoGrupo: 5,
      llegarCuartos: 50,
      llegarSemis: 75,
      llegarFinal: 100,
      campeon: 150,
      campeonPerdedores: 40,
      finalistaPerdedores: 20
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/tournaments', formData);
      navigate(`/tournaments/${data.data._id}`);
    } catch (error) {
      console.error(error);
      alert('Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Crear Nuevo Torneo</h1>
        <p className="text-slate-400">Configura los detalles de la competencia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass p-8 rounded-3xl border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Torneo</label>
              <input
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Open Primavera 2026"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Disciplina</label>
              <select
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.disciplina}
                onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
              >
                <option value="padel">Pádel</option>
                <option value="tenis">Tenis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Formato</label>
              <select
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.formato}
                onChange={(e) => setFormData({ ...formData, formato: e.target.value })}
              >
                <option value="grupos_+_eliminacion">Grupos + Eliminación Directa</option>
                <option value="eliminacion_directa_perdedores">Grupos + Eliminación Directa + Perdedores</option>
                <option value="grupos_1y2_eliminacion">Zona de grupos + 1º y 2º + eliminación directa</option>
                <option value="eliminacion_directa">Eliminación Directa (Cruces manuales)</option>
              </select>
            </div>

            {/* Format Description Card */}
            {FORMAT_INFO[formData.formato] && (() => {
              const info = FORMAT_INFO[formData.formato];
              const isSecondary = info.color === 'secondary';
              const isPurple = info.color === 'purple';
              const isOrange = info.color === 'orange';
              const colorClass = isSecondary ? 'text-secondary' : isPurple ? 'text-purple-400' : isOrange ? 'text-orange-400' : 'text-primary';
              return (
                <div className={`col-span-full rounded-2xl border p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${isSecondary
                  ? 'bg-secondary/5 border-secondary/20'
                  : isPurple ? 'bg-purple-500/5 border-purple-500/20' : isOrange ? 'bg-orange-500/5 border-orange-500/20' : 'bg-primary/5 border-primary/20'
                  }`}>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{info.emoji}</span>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className={`font-black text-sm uppercase tracking-wider ${colorClass}`}>{info.titulo}</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{info.descripcion}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {info.stats.map((s, i) => (
                          <div key={i} className="bg-white/5 rounded-xl px-4 py-3">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{s.label}</p>
                            <p className={`text-lg font-black mt-0.5 ${colorClass}`}>{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {info.fases.map((f, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-base leading-none mt-0.5">{f.icon}</span>
                            <div>
                              <span className="text-xs font-black text-white">{f.label}: </span>
                              <span className="text-xs text-slate-400">{f.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Máx. Jugadores</label>
              <input
                type="number"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.maxJugadores}
                onChange={(e) => setFormData({ ...formData, maxJugadores: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
              <input
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="2da / 3ra / Open"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Fecha de Inicio</label>
              <input
                type="date"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cierre de Inscripción</label>
              <input
                type="date"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.fechaLimiteInscripcion}
                onChange={(e) => setFormData({ ...formData, fechaLimiteInscripcion: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Sistema de Puntos para el Ranking
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">PG (Grupos)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.partidoGanadoGrupo}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, partidoGanadoGrupo: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">PP (Grupos)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.partidoPerdidoGrupo}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, partidoPerdidoGrupo: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cuartos</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.llegarCuartos}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, llegarCuartos: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Semis</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.llegarSemis}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, llegarSemis: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Finalista</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.llegarFinal}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, llegarFinal: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Campeón</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.campeon}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, campeon: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Campeón (Perdedores)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.campeonPerdedores}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, campeonPerdedores: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Finalista (Perdedores)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.finalistaPerdedores}
                  onChange={(e) => setFormData({ ...formData, puntosConfig: { ...formData.puntosConfig, finalistaPerdedores: parseInt(e.target.value) || 0 } })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción y Premios</label>
            <textarea
              rows="4"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Detalles sobre el torneo, premios para ganadores, etc."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            ></textarea>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/tournaments')}
            className="flex-1 bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-primary text-slate-950 font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Crear Torneo</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;

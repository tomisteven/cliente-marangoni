import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Calendar, Users, Settings, Plus, Loader2 } from 'lucide-react';

const CreateTournament = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    disciplina: 'padel',
    formato: 'eliminacion_directa',
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
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Disciplina</label>
              <select
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.disciplina}
                onChange={(e) => setFormData({...formData, disciplina: e.target.value})}
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
                onChange={(e) => setFormData({...formData, formato: e.target.value})}
              >
                <option value="eliminacion_directa">Eliminación Directa</option>
                <option value="eliminacion_directa_perdedores">Eliminación Directa + Perdedores (Tenis)</option>
                <option value="round_robin">Round Robin (Liga)</option>
                <option value="grupos_+_eliminacion">Grupos + Eliminación</option>
                <option value="americano">Americano (Mexicano)</option>
                <option value="manual">Manual (Libre)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Máx. Jugadores</label>
              <input
                type="number"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.maxJugadores}
                onChange={(e) => setFormData({...formData, maxJugadores: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
              <input
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="2da / 3ra / Open"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
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
                onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cierre de Inscripción</label>
              <input
                type="date"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.fechaLimiteInscripcion}
                onChange={(e) => setFormData({...formData, fechaLimiteInscripcion: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, partidoGanadoGrupo: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">PP (Grupos)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.partidoPerdidoGrupo}
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, partidoPerdidoGrupo: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cuartos</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.llegarCuartos}
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, llegarCuartos: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Semis</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.llegarSemis}
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, llegarSemis: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Finalista</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.llegarFinal}
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, llegarFinal: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Campeón</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.campeon}
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, campeon: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Campeón (Perdedores)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.campeonPerdedores}
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, campeonPerdedores: parseInt(e.target.value) || 0}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Finalista (Perdedores)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-all"
                  value={formData.puntosConfig.finalistaPerdedores}
                  onChange={(e) => setFormData({...formData, puntosConfig: {...formData.puntosConfig, finalistaPerdedores: parseInt(e.target.value) || 0}})}
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
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
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

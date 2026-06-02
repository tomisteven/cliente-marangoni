import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Calendar, Users, Settings, Save, Loader2, ChevronLeft } from 'lucide-react';

const EditTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const { data } = await api.get(`/tournaments/${id}`);
        const t = data.data;
        setFormData({
          nombre: t.nombre || '',
          disciplina: t.disciplina || 'padel',
          formato: t.formato || 'grupos_+_eliminacion',
          maxJugadores: t.maxJugadores || 16,
          minJugadores: t.minJugadores || 4,
          fechaInicio: t.fechaInicio ? t.fechaInicio.split('T')[0] : '',
          fechaLimiteInscripcion: t.fechaLimiteInscripcion ? t.fechaLimiteInscripcion.split('T')[0] : '',
          descripcion: t.descripcion || '',
          categoria: t.categoria || '',
          premio: t.premio || '',
          puntosConfig: t.puntosConfig || formData.puntosConfig
        });
      } catch (error) {
        console.error(error);
        alert('Error al cargar los datos del torneo');
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/tournaments/${id}`, formData);
      navigate(`/tournaments/${id}`);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el torneo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Editar Torneo</h1>
        <p className="text-slate-400">Modifica los detalles de la competencia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass p-8 rounded-[40px] border-white/10 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nombre del Torneo</label>
              <input
                required
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Disciplina</label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                value={formData.disciplina}
                onChange={(e) => setFormData({...formData, disciplina: e.target.value})}
              >
                <option value="padel">Pádel</option>
                <option value="tenis">Tenis</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Formato</label>
              <select
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                value={formData.formato}
                onChange={(e) => setFormData({...formData, formato: e.target.value})}
              >
                <option value="grupos_+_eliminacion">Grupos + Eliminación</option>
                <option value="eliminacion_directa_perdedores">Eliminación Directa + Perdedores</option>
                <option value="grupos_1y2_eliminacion">Zona de grupos + 1º y 2º + eliminación directa</option>
                <option value="eliminacion_directa">Eliminación Directa (Cruces manuales)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Máx. Jugadores</label>
              <input
                type="number"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                value={formData.maxJugadores}
                onChange={(e) => setFormData({...formData, maxJugadores: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Categoría</label>
              <input
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Fecha de Inicio</label>
              <input
                type="date"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Cierre de Inscripción</label>
              <input
                type="date"
                required
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all"
                value={formData.fechaLimiteInscripcion}
                onChange={(e) => setFormData({...formData, fechaLimiteInscripcion: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 relative z-10">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              Sistema de Puntos para el Ranking
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {Object.entries(formData.puntosConfig).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3 truncate">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-primary transition-all shadow-inner text-lg font-bold"
                    value={value}
                    onChange={(e) => setFormData({
                      ...formData, 
                      puntosConfig: {
                        ...formData.puntosConfig, 
                        [key]: parseInt(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Descripción y Premios</label>
            <textarea
              rows="4"
              className="w-full bg-slate-950 border border-white/10 rounded-[32px] py-5 px-6 text-white focus:outline-none focus:border-primary transition-all shadow-inner resize-none"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            ></textarea>
          </div>
        </div>

        <div className="flex gap-6 mt-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/5 text-white font-black py-6 rounded-[32px] hover:bg-white/10 transition-all border border-white/5 uppercase tracking-widest text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-[2] bg-primary text-slate-950 font-black py-6 rounded-[32px] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 uppercase tracking-widest text-xs"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTournament;

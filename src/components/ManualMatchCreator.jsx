import { useState } from 'react';
import { Plus, Users, UserPlus } from 'lucide-react';
import api from '../api/axios';

const ManualMatchCreator = ({ tournamentId, players, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ronda: 1,
    jugador1: '',
    jugador2: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jugador1 || !formData.jugador2) return alert('Selecciona ambos jugadores');
    if (formData.jugador1 === formData.jugador2) return alert('No pueden jugar contra sí mismos');

    setLoading(true);
    try {
      await api.post('/matches', {
        torneoId: tournamentId,
        ronda: formData.ronda,
        numeroPartido: Date.now(), // ID temporal único
        jugador1: formData.jugador1,
        jugador2: formData.jugador2
      });
      setShowForm(false);
      setFormData({ ronda: 1, jugador1: '', jugador2: '' });
      onCreated();
    } catch (error) {
      alert('Error al crear partido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full py-6 border-2 border-dashed border-white/10 rounded-[32px] text-slate-500 font-black uppercase tracking-[0.2em] hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          Agregar Partido Manual
        </button>
      ) : (
        <div className="glass p-8 rounded-[40px] border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-primary" /> Crear Nuevo Enfrentamiento
          </h3>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Ronda</label>
              <select 
                value={formData.ronda}
                onChange={(e) => setFormData({...formData, ronda: parseInt(e.target.value)})}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none"
              >
                {[1,2,3,4,5].map(r => <option key={r} value={r}>Ronda {r}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Jugador 1</label>
              <select 
                value={formData.jugador1}
                onChange={(e) => setFormData({...formData, jugador1: e.target.value})}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none"
              >
                <option value="">Seleccionar...</option>
                {players.map(p => (
                  <option key={p.jugador1?._id} value={p.jugador1?._id}>
                    {p.jugador1?.nombre} {p.jugador1?.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Jugador 2</label>
              <select 
                value={formData.jugador2}
                onChange={(e) => setFormData({...formData, jugador2: e.target.value})}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none"
              >
                <option value="">Seleccionar...</option>
                {players.map(p => (
                  <option key={p.jugador1?._id} value={p.jugador1?._id}>
                    {p.jugador1?.nombre} {p.jugador1?.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex gap-4 mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-grow bg-primary text-slate-950 font-black py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Confirmar Partido'}
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-8 bg-white/5 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManualMatchCreator;

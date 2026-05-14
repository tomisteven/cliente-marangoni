import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';

const MatchEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sets, setSets] = useState([{ jugador1: 0, jugador2: 0 }]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data } = await api.get(`/matches/detail/${id}`); // We need a specific match detail endpoint
        setMatch(data.data);
        if (data.data.resultado?.sets?.length > 0) {
          setSets(data.data.resultado.sets);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const handleSetChange = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = parseInt(value) || 0;
    setSets(newSets);
  };

  const addSet = () => setSets([...sets, { jugador1: 0, jugador2: 0 }]);
  const removeSet = () => setSets(sets.slice(0, -1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const isDoubles = (match.pareja1 && match.pareja1.length > 0) || (match.pareja2 && match.pareja2.length > 0);

    // Determine winner based on sets
    let p1Sets = 0;
    let p2Sets = 0;
    sets.forEach(s => {
      if (s.jugador1 > s.jugador2) p1Sets++;
      else if (s.jugador2 > s.jugador1) p2Sets++;
    });

    let ganador;
    if (p1Sets > p2Sets) {
      ganador = isDoubles ? match.pareja1[0]?._id : match.jugador1?._id;
    } else {
      ganador = isDoubles ? match.pareja2[0]?._id : match.jugador2?._id;
    }

    try {
      await api.put(`/matches/${id}/result`, { sets, ganador });
      navigate(-1);
    } catch (error) {
      alert('Error al guardar el resultado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  if (!match) return <div className="text-center py-24">Partido no encontrado</div>;

  const isDoubles = (match.pareja1 && match.pareja1.length > 0) || (match.pareja2 && match.pareja2.length > 0);

  const getParticipantName = (num) => {
    if (isDoubles) {
      const pair = num === 1 ? match.pareja1 : match.pareja2;
      return pair?.map(p => `${p.nombre} ${p.apellido}`).join(' + ') || 'POR DEFINIR';
    } else {
      const player = num === 1 ? match.jugador1 : match.jugador2;
      return player ? `${player.nombre} ${player.apellido}` : 'POR DEFINIR';
    }
  };

  const getParticipantInitial = (num) => {
    if (isDoubles) {
      const pair = num === 1 ? match.pareja1 : match.pareja2;
      return (pair?.[0]?.nombre?.[0] || '?') + (pair?.[0]?.apellido?.[0] || '');
    } else {
      const player = num === 1 ? match.jugador1 : match.jugador2;
      return (player?.nombre?.[0] || '?') + (player?.apellido?.[0] || '');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft className="w-5 h-5" /> Volver
      </button>

      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Cargar Resultado</h1>
        <p className="text-slate-400">Introduce los marcadores de cada set</p>
      </div>

      <div className="glass p-8 rounded-[40px] border-white/10">
        <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/5">
          <div className="text-center w-[40%]">
            <div className="w-20 h-20 rounded-full bg-slate-900 mx-auto mb-4 flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden">
               <span className="text-3xl font-black text-white z-10">{getParticipantInitial(1)}</span>
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
            </div>
            <p className="font-black text-sm text-white uppercase tracking-wider">{getParticipantName(1)}</p>
            {isDoubles && <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">PAREJA</span>}
          </div>
          
          <div className="text-2xl font-black text-slate-800 italic">VS</div>
          
          <div className="text-center w-[40%]">
            <div className="w-20 h-20 rounded-full bg-slate-900 mx-auto mb-4 flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden">
               <span className="text-3xl font-black text-white z-10">{getParticipantInitial(2)}</span>
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
            </div>
            <p className="font-black text-sm text-white uppercase tracking-wider">{getParticipantName(2)}</p>
            {isDoubles && <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">PAREJA</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sets.map((set, index) => (
            <div key={index} className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
              <span className="text-xs font-black text-primary w-12 uppercase tracking-widest">SET {index + 1}</span>
              <input
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-4 text-center text-2xl font-black text-white focus:border-primary focus:outline-none transition-all"
                value={set.jugador1}
                onChange={(e) => handleSetChange(index, 'jugador1', e.target.value)}
              />
              <span className="text-slate-700 font-black">-</span>
              <input
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-4 text-center text-2xl font-black text-white focus:border-primary focus:outline-none transition-all"
                value={set.jugador2}
                onChange={(e) => handleSetChange(index, 'jugador2', e.target.value)}
              />
            </div>
          ))}

          <div className="flex gap-4">
            <button type="button" onClick={addSet} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">+ Añadir Set</button>
            {sets.length > 1 && <button type="button" onClick={removeSet} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors">- Quitar Set</button>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-slate-950 font-black py-6 rounded-[32px] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mt-8 shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] text-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Resultado</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MatchEdit;

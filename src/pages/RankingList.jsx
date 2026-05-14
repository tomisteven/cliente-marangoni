import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trophy, Medal, Star, TrendingUp, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RankingList = () => {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [disciplina, setDisciplina] = useState('padel');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/stats/ranking/${disciplina}`);
        setRanking(data.data.entradas || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [disciplina]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver
      </button>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Ranking Global</h1>
          <p className="text-slate-400">Los mejores jugadores del club</p>
        </div>

        <div className="flex gap-4 bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
          {['padel', 'tenis'].map(d => (
            <button
              key={d}
              onClick={() => setDisciplina(d)}
              className={`px-8 py-3 rounded-xl font-bold transition-all capitalize ${
                disciplina === d ? 'bg-primary text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>
      ) : (
        <div className="space-y-8">
          {/* Podium */}
          <div className="grid md:grid-cols-3 gap-8 items-end mb-16">
            {/* 2nd Place */}
            {ranking[1] && (
              <div className="glass p-8 rounded-3xl text-center border-slate-800 h-64 flex flex-col justify-center order-2 md:order-1">
                <div className="w-16 h-16 rounded-full bg-slate-400/20 mx-auto mb-4 flex items-center justify-center border-2 border-slate-400">
                  <Medal className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{ranking[1].jugadorId.nombre}</h3>
                <p className="text-slate-400 text-sm mb-4">Puesto #2</p>
                <p className="text-2xl font-black text-slate-300">{ranking[1].puntos} PTS</p>
              </div>
            )}
            {/* 1st Place */}
            {ranking[0] && (
              <div className="glass p-10 rounded-3xl text-center border-primary/30 h-80 flex flex-col justify-center relative order-1 md:order-2 shadow-2xl shadow-primary/10">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center border-4 border-slate-950">
                  <Trophy className="w-6 h-6 text-slate-950" />
                </div>
                <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center border-2 border-primary">
                  <Star className="w-10 h-10 text-primary fill-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{ranking[0].jugadorId.nombre}</h3>
                <p className="text-primary text-sm font-bold mb-4 uppercase tracking-widest">Campeón</p>
                <p className="text-4xl font-black text-white">{ranking[0].puntos} PTS</p>
              </div>
            )}
            {/* 3rd Place */}
            {ranking[2] && (
              <div className="glass p-8 rounded-3xl text-center border-orange-500/20 h-56 flex flex-col justify-center order-3">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 mx-auto mb-4 flex items-center justify-center border-2 border-orange-500/30">
                  <Medal className="w-7 h-7 text-orange-500/70" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{ranking[2].jugadorId.nombre}</h3>
                <p className="text-slate-400 text-sm mb-4">Puesto #3</p>
                <p className="text-xl font-black text-orange-500/70">{ranking[2].puntos} PTS</p>
              </div>
            )}
          </div>

          {/* Ranking Table */}
          <div className="glass rounded-3xl overflow-hidden border-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-8 py-4 w-20">#</th>
                  <th className="px-8 py-4">Jugador</th>
                  <th className="px-8 py-4">PJ</th>
                  <th className="px-8 py-4 text-primary">PG</th>
                  <th className="px-8 py-4">PP</th>
                  <th className="px-8 py-4 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ranking.map((entry, i) => (
                  <tr key={entry.jugadorId._id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="px-8 py-6 font-bold text-slate-500">{i + 1}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                          {entry.jugadorId.avatar ? <img src={entry.jugadorId.avatar} alt="avatar" /> : <TrendingUp className="w-5 h-5" />}
                        </div>
                        <span className="font-bold text-white group-hover:text-primary transition-colors">{entry.jugadorId.nombre} {entry.jugadorId.apellido}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-400">{entry.partidosJugados}</td>
                    <td className="px-8 py-6 font-bold text-primary">{entry.partidosGanados}</td>
                    <td className="px-8 py-6 text-slate-400">{entry.partidosPerdidos}</td>
                    <td className="px-8 py-6 text-right font-black text-white">{entry.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingList;

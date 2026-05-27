import { Trophy, Users, ChevronRight } from 'lucide-react';
import BracketMatch from './BracketMatch';

const GroupStage = ({ tournament, matches, isOrganizer, onEditMatch, onDeleteMatch, onAdvance }) => {
  const groups = Array.from(new Set(matches.filter(m => m.grupo).map(m => m.grupo))).sort();

  const calculateStandings = (groupName) => {
    const isDoubles = tournament.disciplina === 'padel';
    const groupMatches = matches.filter(m => m.grupo === groupName && m.estado === 'finalizado');
    const participantStats = {};

    // Identify participants (players or pairs)
    matches.filter(m => m.grupo === groupName).forEach(m => {
      [1, 2].forEach(num => {
        const participantId = isDoubles
          ? (m[`pareja${num}`]?.map(p => p._id || p).sort().join('-'))
          : (m[`jugador${num}`]?._id || m[`jugador${num}`]);

        if (!participantId) return;

        if (!participantStats[participantId]) {
          const participantData = isDoubles ? m[`pareja${num}`] : m[`jugador${num}`];
          participantStats[participantId] = {
            id: participantId,
            nombre: isDoubles
              ? participantData.map(p => p.nombre).join(' + ')
              : (participantData?.nombre || '?'),
            apellido: isDoubles ? '' : (participantData?.apellido || ''),
            pj: 0,
            pg: 0,
            pp: 0,
            sf: 0,
            sc: 0,
            gf: 0,
            gc: 0,
            pts: 0,
            originalData: participantData
          };
        }
      });
    });

    groupMatches.forEach(m => {
      const p1Id = isDoubles
        ? (m.pareja1?.map(p => p._id || p).sort().join('-'))
        : (m.jugador1?._id || m.jugador1);
      const p2Id = isDoubles
        ? (m.pareja2?.map(p => p._id || p).sort().join('-'))
        : (m.jugador2?._id || m.jugador2);

      if (!p1Id || !p2Id) return;

      participantStats[p1Id].pj++;
      participantStats[p2Id].pj++;

      const p1Sets = m.resultado?.sets?.reduce((acc, s) => acc + (s.jugador1 > s.jugador2 ? 1 : 0), 0) || 0;
      const p2Sets = m.resultado?.sets?.reduce((acc, s) => acc + (s.jugador2 > s.jugador1 ? 1 : 0), 0) || 0;

      const p1Games = m.resultado?.sets?.reduce((acc, s) => acc + s.jugador1, 0) || 0;
      const p2Games = m.resultado?.sets?.reduce((acc, s) => acc + s.jugador2, 0) || 0;

      participantStats[p1Id].sf += p1Sets;
      participantStats[p1Id].sc += p2Sets;
      participantStats[p2Id].sf += p2Sets;
      participantStats[p2Id].sc += p1Sets;

      participantStats[p1Id].gf += p1Games;
      participantStats[p1Id].gc += p2Games;
      participantStats[p2Id].gf += p2Games;
      participantStats[p2Id].gc += p1Games;

      const winnerId = m.resultado?.ganador?._id || m.resultado?.ganador;
      const p1IsWinner = isDoubles
        ? m.pareja1?.some(p => (p._id || p).toString() === winnerId?.toString())
        : p1Id?.toString() === winnerId?.toString();

      if (p1IsWinner) {
        participantStats[p1Id].pg++;
        participantStats[p1Id].pts += 3;
        participantStats[p2Id].pp++;
      } else {
        participantStats[p2Id].pg++;
        participantStats[p2Id].pts += 3;
        participantStats[p1Id].pp++;
      }
    });

    return Object.values(participantStats).sort((a, b) => {
      // 1. Points
      if (b.pts !== a.pts) return b.pts - a.pts;
      // 2. Set Difference
      const aSetDiff = a.sf - a.sc;
      const bSetDiff = b.sf - b.sc;
      if (bSetDiff !== aSetDiff) return bSetDiff - aSetDiff;
      // 3. Game Difference
      const aGameDiff = a.gf - a.gc;
      const bGameDiff = b.gf - b.gc;
      return bGameDiff - aGameDiff;
    });
  };

  const allGroupMatchesFinished = matches.filter(m => m.grupo).every(m => m.estado === 'finalizado');

  return (
    <div className="space-y-12 pb-12">
      {groups.map(groupName => {
        const standings = calculateStandings(groupName);
        const groupMatches = matches.filter(m => m.grupo === groupName);

        return (
          <div key={groupName} className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Table */}
            <div className="lg:col-span-2 glass rounded-[32px] border-white/5 overflow-hidden shadow-2xl">
              <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">

                  <h3 className="text-xl font-black text-primary uppercase tracking-wider">Grupo {groupName}</h3>
                </div>
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-4">Pareja / Jugador</th>
                      <th className="px-4 py-4 text-center">PJ</th>
                      <th className="px-4 py-4 text-center">PG</th>
                      <th className="px-4 py-4 text-center">PP</th>
                      <th className="px-4 py-4 text-center">Sets</th>
                      <th className="px-4 py-4 text-center">Gems</th>
                      <th className="px-6 py-4 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((player, idx) => {
                      const isQualifier = idx < 2;
                      const setDiff = player.sf - player.sc;
                      const gameDiff = player.gf - player.gc;
                      return (
                        <tr key={player.id} className={`border-b border-white/5 last:border-0 ${isQualifier ? 'bg-primary/5' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-black ${isQualifier ? 'text-primary' : 'text-slate-500'}`}>{idx + 1}</span>
                              <span className="text-sm font-bold text-white">{player.nombre} {player.apellido}</span>
                              {isQualifier && <Trophy className="w-3 h-3 text-primary" />}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-xs text-slate-400 font-bold">{player.pj}</td>
                          <td className="px-4 py-4 text-center text-xs text-green-500 font-bold">{player.pg}</td>
                          <td className="px-4 py-4 text-center text-xs text-red-500 font-bold">{player.pp}</td>
                          <td className="px-4 py-4 text-center text-xs font-bold">
                            <span className={setDiff > 0 ? 'text-primary' : setDiff < 0 ? 'text-red-400' : 'text-slate-400'}>
                              {setDiff > 0 ? `+${setDiff}` : setDiff}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-xs font-bold">
                            <span className={gameDiff > 0 ? 'text-primary' : gameDiff < 0 ? 'text-red-400' : 'text-slate-400'}>
                              {gameDiff > 0 ? `+${gameDiff}` : gameDiff}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-white">{player.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matches */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Partidos del Grupo</h4>
              {groupMatches.map(match => (
                <BracketMatch
                  key={match._id}
                  match={match}
                  isOrganizer={isOrganizer}
                  onEdit={onEditMatch}
                  onDelete={onDeleteMatch}
                />
              ))}
            </div>
          </div>
        );
      })}

      {isOrganizer && allGroupMatchesFinished && !matches.some(m => !m.grupo && m.ronda > 0) && (
        <div className="max-w-md mx-auto">
          <button
            onClick={onAdvance}
            className="w-full bg-primary text-slate-950 font-black py-6 rounded-[32px] text-sm uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 group"
          >
            Generar Llave de Eliminación <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">
            Todos los partidos de grupo han finalizado. Puedes proceder a la fase final.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupStage;

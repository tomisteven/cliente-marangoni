import { Settings, User, Trash2, Users } from 'lucide-react';

const BracketMatch = ({ match, isOrganizer, onEdit, onDelete, onEditParticipants, roundColor }) => {
  const isDoubles = (match.pareja1 && match.pareja1.length > 0) || (match.pareja2 && match.pareja2.length > 0);

  const getWinnerId = () => {
    if (!match.resultado?.ganador) return null;
    return match.resultado.ganador;
  };

  const isWinner = (num) => {
    const winnerId = getWinnerId();
    if (!winnerId) return false;

    if (isDoubles) {
      const pair = num === 1 ? match.pareja1 : match.pareja2;
      // In Padel, the winner ID stored in match.resultado.ganador 
      // could be the pair's ID (not available here) or one of the players.
      // Usually, it's the first player of the pair for convenience or the pair ID.
      // Let's check if the winnerId matches any player in the pair.
      return pair?.some(p => p._id === winnerId || p === winnerId);
    } else {
      const player = num === 1 ? match.jugador1 : match.jugador2;
      return player?._id === winnerId || player === winnerId;
    }
  };

  const renderScore = (num) => {
    if (!match.resultado?.sets?.length) return <span className="text-xs font-black text-slate-500">0</span>;

    return (
      <div className="flex gap-1">
        {match.resultado.sets.map((s, i) => (
          <span key={i} className={`text-[10px] font-black ${isWinner(num) ? 'text-primary' : 'text-slate-500'}`}>
            {num === 1 ? s.jugador1 : s.jugador2}
          </span>
        ))}
      </div>
    );
  };

  const renderParticipant = (num) => {
    const player = num === 1 ? match.jugador1 : match.jugador2;
    const pair = num === 1 ? match.pareja1 : match.pareja2;
    const hasParticipant = isDoubles ? (pair && pair.length > 0) : !!player;
    const won = isWinner(num);

    return (
      <div className={`flex items-center justify-between p-3 ${num === 1 ? 'border-b border-white/5' : ''} ${won ? 'bg-primary/10' : ''}`}>
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="flex -space-x-1.5 flex-shrink-0">
            {isDoubles ? (
              pair?.map((p, idx) => (
                <div key={idx} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                  {p.nombre?.[0] + p.apellido?.[0] || '?'}
                </div>
              ))
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                {player ? player.nombre[0] + player.apellido[0] : '?'}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-[11px] font-black truncate leading-tight ${won ? 'text-primary' : 'text-white'}`}>
              {isDoubles
                ? (pair?.map(p => p.nombre).join(' + ') || 'POR DEFINIR')
                : (player ? `${player.nombre} ${player.apellido}` : 'POR DEFINIR')
              }
            </span>
            {isDoubles && pair?.length > 0 && (
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">PAREJA</span>
            )}
          </div>
        </div>
        {renderScore(num)}
      </div>
    );
  };

  const borderColor = roundColor?.split(' ').find(c => c.startsWith('border-')) || 'border-white/5';

  return (
    <div className="relative group w-full max-w-[280px]">
      <div className={`glass rounded-2xl overflow-hidden border shadow-xl transition-all hover:border-primary/50 ${borderColor}`}>
        {renderParticipant(1)}
        {renderParticipant(2)}
      </div>

      {isOrganizer && (
        <div className="absolute -right-3 -top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
          <button
            onClick={() => onEditParticipants(match)}
            className="bg-blue-500 text-white p-1.5 rounded-lg shadow-lg hover:scale-110 transition-transform"
            title="Editar Jugadores"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
          {((match.jugador1 && match.jugador2) || (match.pareja1?.length > 0 && match.pareja2?.length > 0)) && (
            <button
              onClick={() => onEdit(match._id)}
              className="bg-white text-slate-950 p-1.5 rounded-lg shadow-lg hover:scale-110 transition-transform"
              title="Editar Resultado"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('¿Eliminar este partido?')) onDelete(match._id);
            }}
            className="bg-red-500 text-white p-1.5 rounded-lg shadow-lg hover:scale-110 transition-transform"
            title="Eliminar Partido"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Connecting Lines (Conceptual - will need CSS in the parent) */}
      <div className="absolute top-1/2 -right-6 w-6 h-px bg-slate-800 hidden md:block"></div>
    </div>
  );
};

export default BracketMatch;

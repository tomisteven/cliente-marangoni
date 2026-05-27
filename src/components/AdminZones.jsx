import { useState, useEffect } from 'react';
import { Users, Plus, X, GripVertical, Save, Trash2, UserPlus, Info, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const AdminZones = ({ tournamentId, zones: initialZones, inscriptions, onUpdate, disciplina }) => {
  const [zones, setZones] = useState(initialZones || []);
  const [loading, setLoading] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [rankingMap, setRankingMap] = useState({}); // { userId: posicion }

  // Load global ranking for this discipline
  useEffect(() => {
    if (!disciplina) return;
    api.get(`/stats/ranking/${disciplina}`)
      .then(({ data }) => {
        const map = {};
        // Sort by puntos descending to derive position since posicion may not be stored
        const sorted = [...(data.data?.entradas || [])].sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
        sorted.forEach((e, idx) => {
          const uid = e.jugadorId?._id || e.jugadorId;
          if (uid) map[uid.toString()] = idx + 1;
        });
        setRankingMap(map);
      })
      .catch(() => { }); // Silently fail – ranking is optional display info
  }, [disciplina]);

  useEffect(() => {
    // Calcular jugadores disponibles (inscritos que no están en ninguna zona)
    const assignedIds = zones.flatMap(z => z.jugadores.map(j => j._id || j));
    const available = inscriptions.filter(i => !assignedIds.includes(i.jugador1._id));
    setAvailablePlayers(available);
  }, [zones, inscriptions]);

  const addZone = () => {
    setZones([...zones, { nombre: `Zona ${zones.length + 1}`, jugadores: [] }]);
  };

  const removeZone = (index) => {
    if (!window.confirm('¿Eliminar esta zona? Los jugadores volverán a la lista de disponibles.')) return;
    const newZones = [...zones];
    newZones.splice(index, 1);
    setZones(newZones);
  };

  const addPlayerToZone = (zoneIndex, player) => {
    const newZones = [...zones];
    newZones[zoneIndex].jugadores.push(player.jugador1);
    setZones(newZones);
  };

  const removePlayerFromZone = (zoneIndex, playerIndex) => {
    const newZones = [...zones];
    newZones[zoneIndex].jugadores.splice(playerIndex, 1);
    setZones(newZones);
  };

  const updateZoneName = (index, name) => {
    const newZones = [...zones];
    newZones[index].nombre = name;
    setZones(newZones);
  };

  const handleRegenerateGroups = async () => {
    if (!window.confirm('¿Generar/regenerar todos los partidos de grupo desde las zonas actuales? Esto borrará los partidos de grupo existentes.')) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/tournaments/${tournamentId}/regenerate-groups`);
      alert(data.message || 'Partidos generados correctamente');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al regenerar partidos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Para padel (isDoubles), necesitamos guardar ambos jugadores de la pareja
      // Pero el modelo actual de Tournament.zonas solo guarda referencias simples a User.
      // Como esto es Tenis (Singles), guardamos j.jugador1._id
      const zonesToSave = zones.map(z => ({
        nombre: z.nombre,
        jugadores: z.jugadores.map(j => (j.jugador1 && j.jugador1._id) ? j.jugador1._id : (j._id || j))
      }));
      await api.put(`/tournaments/${tournamentId}/zones`, { zonas: zonesToSave });
      onUpdate();
      alert('Zonas guardadas correctamente');
    } catch (error) {
      alert('Error al guardar zonas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Configuración Manual de Zonas
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Arrastra o selecciona jugadores para organizar los grupos.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={addZone}
            className="px-6 py-3 bg-white/5 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
          >
            <Plus className="w-4 h-4" /> Agregar Zona
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-primary text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar Zonas</>}
          </button>
          <button
            onClick={handleRegenerateGroups}
            disabled={loading}
            className="px-8 py-3 bg-secondary/20 text-secondary border border-secondary/30 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary/30 transition-all flex items-center gap-2 disabled:opacity-50"
            title="Genera los partidos de fase de grupos a partir de las zonas guardadas. Útil si el torneo ya fue iniciado pero no tiene partidos."
          >
            <RefreshCw className="w-4 h-4" /> Generar Partidos de Grupo
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Available Players Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-6 rounded-[32px] border-white/5 h-full min-h-[400px]">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Disponibles <span>({availablePlayers.length})</span>
            </h4>
            <div className="space-y-2">
              {availablePlayers.map((insc, i) => (
                <div key={insc._id} className="group flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/5 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {insc.jugador1.nombre[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-300 leading-tight">
                        {insc.jugador1.nombre} {insc.jugador1.apellido}
                      </span>
                      {rankingMap[insc.jugador1._id?.toString()] && (
                        <span className="text-[13px] font-black text-primary/70 tracking-wider mt-1">
                          #{rankingMap[insc.jugador1._id?.toString()]} Ranking
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {zones.map((_, zIdx) => (
                      <button
                        key={zIdx}
                        onClick={() => addPlayerToZone(zIdx, insc)}
                        className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black hover:bg-primary hover:text-slate-950 transition-all"
                        title={`Mover a Zona ${zIdx + 1}`}
                      >
                        {zIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {availablePlayers.length === 0 && (
                <div className="text-center py-12 opacity-30 italic text-xs">Todos los jugadores asignados</div>
              )}
            </div>
          </div>
        </div>

        {/* Zones Grid */}
        <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
          {zones.map((zone, zIdx) => (
            <div key={zIdx} className="glass p-6 rounded-[32px] border-primary/10 relative group/zone">
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  value={zone.nombre}
                  onChange={(e) => updateZoneName(zIdx, e.target.value)}
                  className="bg-transparent text-lg font-black text-white focus:outline-none focus:border-b border-primary/50 w-full mr-4"
                />
                <button
                  onClick={() => removeZone(zIdx)}
                  className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 min-h-[100px] bg-slate-950/30 rounded-2xl p-2 border border-dashed border-white/5">
                {zone.jugadores.map((player, pIdx) => (
                  <div key={player._id || player} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                        {pIdx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-tight">{player.nombre} {player.apellido}</span>
                        {rankingMap[player._id?.toString()] && (
                          <span className="text-[10px] font-black text-primary/70 tracking-wider">
                            #{rankingMap[player._id?.toString()]} Ranking
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removePlayerFromZone(zIdx, pIdx)}
                      className="p-1.5 text-slate-600 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {zone.jugadores.length === 0 && (
                  <div className="h-full flex items-center justify-center py-8 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    Sin jugadores
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                <Info className="w-3 h-3" /> {zone.jugadores.length} Participantes
              </div>
            </div>
          ))}

          {zones.length === 0 && (
            <div className="md:col-span-2 text-center py-24 glass rounded-[40px] border-white/5 border-dashed">
              <Plus className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest">Comienza agregando una zona</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminZones;

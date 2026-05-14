import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, UserPlus, Loader2, Check, User, Mail, Shield, Plus, Trash2, Users } from 'lucide-react';

const AdminEnrollment = ({ tournamentId, tournamentDisciplina, onEnrolled, enrolledIds, inscriptions = [] }) => {
  const [activeTab, setActiveTab] = useState('existing');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: 'password123',
    disciplinas: [tournamentDisciplina || 'padel']
  });

  const [selectedPlayer1, setSelectedPlayer1] = useState(null);
  const [completingInscription, setCompletingInscription] = useState(null); // { id, player1Name }

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEnrollExisting = async (playerId, forceSingle = false) => {
    const isPadel = tournamentDisciplina === 'padel';
    
    if (isPadel && !selectedPlayer1 && !completingInscription && !forceSingle) {
      const p1 = users.find(u => u._id === playerId);
      setSelectedPlayer1(p1);
      return;
    }

    setSubmitting(true);
    try {
      if (completingInscription) {
        await api.post(`/tournaments/${tournamentId}/add-partner`, { 
          inscriptionId: completingInscription.id,
          jugador2Id: playerId 
        });
        setCompletingInscription(null);
      } else {
        await api.post(`/tournaments/${tournamentId}/admin-enroll`, { 
          jugador1Id: forceSingle ? playerId : (isPadel ? selectedPlayer1._id : playerId),
          jugador2Id: (isPadel && !forceSingle) ? playerId : null
        });
        setSelectedPlayer1(null);
      }
      onEnrolled();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al inscribir');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveInscription = async (inscriptionId) => {
    if (!window.confirm('¿Eliminar esta inscripción?')) return;
    setSubmitting(true);
    try {
      await api.post(`/tournaments/${tournamentId}/remove-inscription`, { inscriptionId });
      onEnrolled();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', newUser);
      await fetchUsers(); // Refresh the list
      setActiveTab('existing'); // Switch to selection tab
      setNewUser({ nombre: '', apellido: '', email: '', password: 'password123', disciplinas: [tournamentDisciplina || 'padel'] });
      alert('Jugador registrado. Ahora puedes seleccionarlo en la lista.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error en el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    !enrolledIds.includes(u._id) && 
    u._id !== selectedPlayer1?._id &&
    u._id !== completingInscription?.player1Id &&
    (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl bg-slate-900/40">
      <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Gestión de Participantes</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Inscribe jugadores existentes o registra nuevos</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-white/5 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('existing')}
            className={`flex-1 md:flex-none py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'existing' ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Existentes
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`flex-1 md:flex-none py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'new' ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nuevo Registro
          </button>
          <button 
            onClick={() => setActiveTab('enrolled')}
            className={`flex-1 md:flex-none py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'enrolled' ? 'bg-primary text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inscritos ({inscriptions.length})
          </button>
        </div>
      </div>

      <div className="p-8">
        {completingInscription && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex justify-between items-center animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-black text-orange-500">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-orange-500 font-black uppercase tracking-widest">Completando Pareja</p>
                <p className="text-sm font-bold text-white">Selecciona compañero para {completingInscription.player1Name}</p>
              </div>
            </div>
            <button 
              onClick={() => setCompletingInscription(null)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {selectedPlayer1 && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex justify-between items-center animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                {selectedPlayer1.nombre[0]}
              </div>
              <div>
                <p className="text-xs text-primary font-black uppercase tracking-widest">Jugador 1 Seleccionado</p>
                <p className="text-sm font-bold text-white">{selectedPlayer1.nombre} {selectedPlayer1.apellido}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleEnrollExisting(selectedPlayer1._id, true)}
                className="bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-primary hover:text-slate-950 transition-all shadow-lg"
              >
                Confirmar sin Compañero
              </button>
              <button 
                onClick={() => setSelectedPlayer1(null)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Cancelar Selección
              </button>
            </div>
          </div>
        )}

        {activeTab === 'existing' ? (
          <div className="space-y-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Filtrar por nombre, apellido o email..."
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-primary outline-none transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <th className="px-6 pb-2">Jugador</th>
                    <th className="px-6 pb-2">Email</th>
                    <th className="px-6 pb-2">Rol</th>
                    <th className="px-6 pb-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="custom-scrollbar">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.slice(0, 10).map(u => (
                      <tr key={u._id} className="group">
                        <td className="bg-white/5 rounded-l-2xl px-6 py-4 border-y border-l border-white/5 group-hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 border border-white/5 group-hover:border-primary/30 transition-all">
                              {u.nombre[0]}
                            </div>
                            <span className="text-sm font-black text-white">{u.nombre} {u.apellido}</span>
                          </div>
                        </td>
                        <td className="bg-white/5 px-6 py-4 border-y border-white/5 group-hover:bg-white/10 transition-colors text-xs text-slate-400 font-medium">
                          {u.email}
                        </td>
                        <td className="bg-white/5 px-6 py-4 border-y border-white/5 group-hover:bg-white/10 transition-colors">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-800 text-slate-500">
                            {u.rol}
                          </span>
                        </td>
                        <td className="bg-white/5 rounded-r-2xl px-6 py-4 border-y border-r border-white/5 group-hover:bg-white/10 transition-colors text-right">
                          <button 
                            onClick={() => handleEnrollExisting(u._id)}
                            disabled={submitting}
                            className="bg-primary text-slate-950 p-2 rounded-xl hover:scale-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                          >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                        <User className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No se encontraron jugadores para inscribir</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'new' ? (
          <div className="max-w-2xl mx-auto py-8">
            <form onSubmit={handleQuickRegister} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Nombre</label>
                <input 
                  required
                  placeholder="Ej: Juan"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-primary outline-none transition-all shadow-inner"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Apellido</label>
                <input 
                  required
                  placeholder="Ej: Pérez"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-primary outline-none transition-all shadow-inner"
                  value={newUser.apellido}
                  onChange={(e) => setNewUser({...newUser, apellido: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    required
                    type="email"
                    placeholder="jugador@ejemplo.com"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-primary outline-none transition-all shadow-inner"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="col-span-2 p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Configuración de Cuenta</p>
                  <p className="text-xs text-slate-400">El jugador podrá ingresar con su email y la clave <span className="text-white font-black">password123</span>.</p>
                </div>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="bg-white text-slate-950 font-black px-10 py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-primary hover:scale-[1.05] transition-all shadow-2xl disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalizar y Registrar'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <th className="px-6 pb-2">Participante / Pareja</th>
                    <th className="px-6 pb-2">Detalles</th>
                    <th className="px-6 pb-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptions.length > 0 ? (
                    inscriptions.map(insc => (
                      <tr key={insc._id} className="group">
                        <td className="bg-white/5 rounded-l-2xl px-6 py-4 border-y border-l border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-black text-white">
                                {insc.jugador1?.nombre[0]}
                              </div>
                              {insc.jugador2 && (
                                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-slate-900 flex items-center justify-center text-xs font-black text-primary">
                                  {insc.jugador2?.nombre[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">
                                {insc.jugador1?.nombre} {insc.jugador1?.apellido}
                                {insc.jugador2 && ` + ${insc.jugador2?.nombre} ${insc.jugador2?.apellido}`}
                              </p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                                {insc.jugador2 ? 'Pareja' : 'Individual'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="bg-white/5 px-6 py-4 border-y border-white/5 text-xs text-slate-400">
                          {insc.jugador2 ? 'Doble' : 'Single'}
                        </td>
                        <td className="bg-white/5 rounded-r-2xl px-6 py-4 border-y border-r border-white/5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {tournamentDisciplina === 'padel' && (
                              <button 
                                onClick={() => {
                                  setCompletingInscription({ 
                                    id: insc._id, 
                                    player1Id: insc.jugador1?._id, 
                                    player1Name: `${insc.jugador1?.nombre} ${insc.jugador1?.apellido}` 
                                  });
                                  setActiveTab('existing');
                                }}
                                className="px-3 py-1.5 bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-500 hover:text-white transition-all"
                              >
                                {insc.jugador2 ? 'Cambiar Compañero' : 'Añadir Compañero'}
                              </button>
                            )}
                            <button 
                              onClick={() => handleRemoveInscription(insc._id)}
                              disabled={submitting}
                              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Eliminar Inscripción"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                        <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No hay inscritos aún</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollment;

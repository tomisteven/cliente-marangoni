import { useState, useEffect } from 'react';
import api from '../api/axios';
import { User, Shield, Search, Filter, MoreVertical, Eye, UserX, UserCheck, Phone, CreditCard, Globe, Edit2, X, Loader2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPlayers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDisciplina, setFilterDisciplina] = useState('all');

  // Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    rol: '',
    categoria: '',
    puntosPadel: 0,
    puntosTenis: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      dni: user.dni || '',
      telefono: user.telefono || '',
      nacionalidad: user.nacionalidad || '',
      sexo: user.sexo || 'hombre',
      domicilio: user.domicilio || '',
      rol: user.rol,
      categoria: user.categoria || '',
      puntosPadel: user.rankingPoints?.padel || 0,
      puntosTenis: user.rankingPoints?.tenis || 0
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Update basic and personal data
      await api.put(`/auth/update/${selectedUser._id}`, {
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        email: editForm.email,
        dni: editForm.dni,
        telefono: editForm.telefono,
        nacionalidad: editForm.nacionalidad,
        sexo: editForm.sexo,
        domicilio: editForm.domicilio,
        rol: editForm.rol,
        categoria: editForm.categoria
      });

      // 2. Update ranking points if changed
      if (editForm.puntosPadel !== selectedUser.rankingPoints?.padel) {
        await api.put(`/auth/ranking/${selectedUser._id}`, {
          disciplina: 'padel',
          puntos: parseInt(editForm.puntosPadel)
        });
      }
      if (editForm.puntosTenis !== selectedUser.rankingPoints?.tenis) {
        await api.put(`/auth/ranking/${selectedUser._id}`, {
          disciplina: 'tenis',
          puntos: parseInt(editForm.puntosTenis)
        });
      }

      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert('Error al actualizar el usuario');
    } finally {
      setUpdating(false);
    }
  };

  const toggleStatus = async (userId) => {
    try {
      await api.put(`/auth/toggle-status/${userId}`);
      setUsers(users.map(u => u._id === userId ? { ...u, activo: !u.activo } : u));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('No se pudo cambiar el estado del usuario');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.rol === filterRole;
    const matchesDisc = filterDisciplina === 'all' || u.disciplinas.includes(filterDisciplina);
    return matchesSearch && matchesRole && matchesDisc;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Gestión de Usuarios</h2>
          <p className="text-slate-400">Control total sobre jugadores, administradores y personal.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-950 rounded-xl border border-white/5">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email..."
              className="bg-transparent border-none outline-none text-sm text-white w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-slate-950 text-white text-sm border border-white/5 rounded-xl px-4 py-2 outline-none"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="all">Todos los Roles</option>
            <option value="jugador">Jugadores</option>
            <option value="administrador">Administradores</option>
            <option value="organizador">Organizadores</option>
          </select>

          <select 
            className="bg-slate-950 text-white text-sm border border-white/5 rounded-xl px-4 py-2 outline-none"
            value={filterDisciplina}
            onChange={e => setFilterDisciplina(e.target.value)}
          >
            <option value="all">Todas las Disciplinas</option>
            <option value="padel">Pádel</option>
            <option value="tenis">Tenis</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-24 text-slate-500 italic">Cargando base de datos de usuarios...</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(u => (
            <div key={u._id} className={`glass p-6 rounded-[32px] border-white/5 flex flex-col md:flex-row items-center gap-8 transition-all ${!u.activo ? 'opacity-60 grayscale' : 'hover:bg-white/10'}`}>
              {/* User Identity */}
              <div className="flex items-center gap-4 w-full md:w-1/4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="avatar" /> : <User className="w-6 h-6 text-slate-500" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{u.nombre} {u.apellido}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                      u.rol === 'administrador' ? 'bg-red-500/20 text-red-400' : 
                      u.rol === 'organizador' ? 'bg-orange-500/20 text-orange-400' : 'bg-primary/20 text-primary'
                    }`}>
                      {u.rol}
                    </span>
                    {u.categoria && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter bg-purple-500/20 text-purple-400">
                        Cat. {u.categoria}
                      </span>
                    )}
                    {!u.activo && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter bg-slate-800 text-slate-400">Baja</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Data */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow w-full md:w-auto">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-600">DNI</p>
                    <p className="text-slate-300 font-medium">{u.dni || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-600">Teléfono</p>
                    <p className="text-slate-300 font-medium">{u.telefono || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <Globe className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-600">Nacionalidad</p>
                    <p className="text-slate-300 font-medium">{u.nacionalidad || 'No registrado'}</p>
                  </div>
                </div>
              </div>

              {/* Disciplines */}
              <div className="w-full md:w-32 flex flex-wrap gap-2 justify-center">
                {u.disciplinas.map(d => (
                  <span key={d} className="px-3 py-1 rounded-lg bg-slate-950 border border-white/5 text-[10px] font-bold text-white capitalize">{d}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button 
                  onClick={() => handleOpenEdit(u)}
                  className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-2 text-xs font-bold"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                <Link 
                  to={`/profile/${u._id}`}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold"
                >
                  <Eye className="w-4 h-4" /> Perfil
                </Link>
                <button 
                  onClick={() => toggleStatus(u._id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold ${
                    u.activo 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                    : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  {u.activo ? <><UserX className="w-4 h-4" /> Dar Baja</> : <><UserCheck className="w-4 h-4" /> Dar Alta</>}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 glass rounded-[40px] border-white/5">
            <User className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 italic">No se encontraron usuarios que coincidan con los filtros.</p>
          </div>
        )}
      </div>
      {/* User Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="glass w-full max-w-xl p-8 rounded-[40px] border-white/10 relative z-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">Editar Usuario</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{selectedUser.nombre} {selectedUser.apellido}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Sección Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">Nombre</label>
                    <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">Apellido</label>
                    <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" value={editForm.apellido} onChange={e => setEditForm({...editForm, apellido: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2">Email</label>
                  <input type="email" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">DNI</label>
                    <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" value={editForm.dni} onChange={e => setEditForm({...editForm, dni: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">Teléfono</label>
                    <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm" value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Sección Torneo */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-secondary uppercase tracking-widest">Configuración de Torneo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">Rol en el Sistema</label>
                    <select 
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm"
                      value={editForm.rol}
                      onChange={e => setEditForm({...editForm, rol: e.target.value})}
                    >
                      <option value="jugador">Jugador</option>
                      <option value="profesor">Profesor</option>
                      <option value="organizador">Organizador</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-2">Categoría Actual</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm"
                      value={editForm.categoria}
                      onChange={e => setEditForm({...editForm, categoria: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-950/50 border border-white/5 space-y-4">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Ajuste de Ranking (Puntos Globales)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 ml-2">Puntos Pádel</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm"
                      value={editForm.puntosPadel}
                      onChange={e => setEditForm({...editForm, puntosPadel: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 ml-2">Puntos Tenis</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm"
                      value={editForm.puntosTenis}
                      onChange={e => setEditForm({...editForm, puntosTenis: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-2xl border border-white/5 text-slate-400 font-bold hover:bg-white/5 transition-all text-xs uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlayers;

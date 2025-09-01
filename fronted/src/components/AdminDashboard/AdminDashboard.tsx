import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// === INTERFACES ===
interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  office_id?: number;
  password?: string;
}

interface Incident {
  incident_id: number;
  description: string;
  status_id: number;
  status: string;
  reporter_id: number;
  reporter: string;
  resolver_id?: number;
  office_id: number;
  device_id?: number;
  opened_at: string;
  resolved_at?: string;
}

interface Office {
  office_id: number;
  city: string;
}

interface DeviceType {
  type_id: number;
  name: string;
}

interface UserRole {
  role_id: number;
  name: string;
}

interface IncidentStatus {
  status_id: number;
  name: string;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_id: number;
  office_id: string;
}

interface IncidentFormData {
  description: string;
  status_id: number;
  reporter_id: string;
  office_id: string;
  device_id: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [incidentStatuses, setIncidentStatuses] = useState<IncidentStatus[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  
  const [userForm, setUserForm] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: 3, 
    office_id: ''
  });

  const [incidentForm, setIncidentForm] = useState<IncidentFormData>({
    description: '',
    status_id: 1, 
    reporter_id: '',
    office_id: '',
    device_id: ''
  });

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6); // Número de usuarios por página

  // Calcula los usuarios a mostrar
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Función para ir a la página siguiente
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para ir a la página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const convertUserFormToUser = (form: UserFormData): Partial<User> => {
    return {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
      role_id: form.role_id,
      office_id: form.office_id ? parseInt(form.office_id) : undefined
    };
  };

  const convertIncidentFormToIncident = (form: IncidentFormData): Partial<Incident> => {
    return {
      description: form.description,
      status_id: form.status_id,
      reporter_id: parseInt(form.reporter_id),
      office_id: parseInt(form.office_id),
      device_id: form.device_id ? parseInt(form.device_id) : undefined
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [
        usersResponse, 
        incidentsResponse, 
        officesResponse, 
        rolesResponse, 
        statusesResponse,
        deviceTypesResponse
      ] = await Promise.all([
        fetch('http://localhost:8000/users/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/incidents/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/offices/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/user-roles/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/incident-statuses/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/device-types/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersResponse.ok) setUsers(await usersResponse.json());
      if (incidentsResponse.ok) setIncidents(await incidentsResponse.json());
      if (officesResponse.ok) setOffices(await officesResponse.json());
      if (rolesResponse.ok) setUserRoles(await rolesResponse.json());
      if (statusesResponse.ok) setIncidentStatuses(await statusesResponse.json());
      if (deviceTypesResponse.ok) setDeviceTypes(await deviceTypesResponse.json());

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchDashboardData();
        setShowUserModal(false);
        resetUserForm();
        setCurrentPage(1); // Volver a la primera página después de agregar un usuario
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUser = async (userId: number, userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchDashboardData();
        setShowUserModal(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDashboardData();
        // Si eliminamos el último usuario de la página, retroceder una página
        if (currentUsers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const createIncident = async (incidentData: Partial<Incident>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/incidents/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incidentData)
      });

      if (response.ok) {
        fetchDashboardData();
        setShowIncidentModal(false);
        resetIncidentForm();
      }
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  const updateIncident = async (incidentId: number, incidentData: Partial<Incident>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incidentData)
      });

      if (response.ok) {
        fetchDashboardData();
        setShowIncidentModal(false);
        setEditingIncident(null);
      }
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  const deleteIncident = async (incidentId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/incidents/${incidentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role_id: 3,
      office_id: ''
    });
    setEditingUser(null);
  };

  const resetIncidentForm = () => {
    setIncidentForm({
      description: '',
      status_id: 1,
      reporter_id: '',
      office_id: '',
      device_id: ''
    });
    setEditingIncident(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Incidens - Panel de Administración</h1>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'nav-btn active' : 'nav-btn'}>
          Dashboard
        </button>
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'nav-btn active' : 'nav-btn'}>
          Usuarios
        </button>
        <button onClick={() => setActiveTab('incidents')} className={activeTab === 'incidents' ? 'nav-btn active' : 'nav-btn'}>
          Incidencias
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <h2>Resumen General</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Usuarios</h3>
                <p className="stat-number">{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Incidencias</h3>
                <p className="stat-number">{incidents.length}</p>
              </div>
              <div className="stat-card">
                <h3>Incidencias Abiertas</h3>
                <p className="stat-number">{incidents.filter(inc => inc.status_id === 1).length}</p>
              </div>
              <div className="stat-card">
                <h3>Incidencias Resueltas</h3>
                <p className="stat-number">{incidents.filter(inc => inc.status_id === 3).length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>Gestión de Usuarios</h2>
              <button onClick={() => setShowUserModal(true)} className="add-btn">
                + Nuevo Usuario
              </button>
            </div>

            <div className="users-grid">
              {currentUsers.map(user => (
                <div key={user.user_id} className="user-card">
                  <div className="user-info">
                    <h4>{user.first_name} {user.last_name}</h4>
                    <p>{user.email}</p>
                    <span className="user-role">
                      {userRoles.find(role => role.role_id === user.role_id)?.name}
                    </span>
                  </div>
                  <div className="user-actions">
                    <button onClick={() => {
                      setEditingUser(user);
                      setUserForm({
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        password: '',
                        role_id: user.role_id,
                        office_id: user.office_id?.toString() || ''
                      });
                      setShowUserModal(true);
                    }} className="edit-btn">
                      Editar
                    </button>
                    <button onClick={() => deleteUser(user.user_id)} className="delete-btn">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {users.length > usersPerPage && (
              <div className="pagination-container">
                <div className="pagination">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    &laquo; Anterior
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={currentPage === number ? 'pagination-btn active' : 'pagination-btn'}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Siguiente &raquo;
                  </button>
                </div>
                
                <div className="pagination-info">
                  Mostrando {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} de {users.length} usuarios
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="incidents-section">
            <div className="section-header">
              <h2>Gestión de Incidencias</h2>
              <button onClick={() => setShowIncidentModal(true)} className="add-btn">
                + Nueva Incidencia
              </button>
            </div>

            <div className="incidents-grid">
              {incidents.map(incident => (
                <div key={incident.incident_id} className="incident-card">
                  <div className="incident-info">
                    <h4>{incident.description}</h4>
                    <p>Reportado por: {incident.reporter}</p>
                    <p>Fecha: {new Date(incident.opened_at).toLocaleDateString()}</p>
                    <span className={`status-badge status-${incident.status_id}`}>
                      {incidentStatuses.find(status => status.status_id === incident.status_id)?.name}
                    </span>
                  </div>
                  <div className="incident-actions">
                    <button onClick={() => {
                      setEditingIncident(incident);
                      setIncidentForm({
                        description: incident.description,
                        status_id: incident.status_id,
                        reporter_id: incident.reporter_id.toString(),
                        office_id: incident.office_id.toString(),
                        device_id: incident.device_id?.toString() || ''
                      });
                      setShowIncidentModal(true);
                    }} className="edit-btn">
                      Editar
                    </button>
                    <button onClick={() => deleteIncident(incident.incident_id)} className="delete-btn">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Usuario */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingUser) {
                updateUser(editingUser.user_id, convertUserFormToUser(userForm));
              } else {
                createUser(convertUserFormToUser(userForm));
              }
            }}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={userForm.last_name}
                  onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required={!editingUser}
                  placeholder={editingUser ? "Dejar en blanco para mantener la actual" : ""}
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={userForm.role_id}
                  onChange={(e) => setUserForm({...userForm, role_id: parseInt(e.target.value)})}
                >
                  {userRoles.map(role => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Oficina</label>
                <select
                  value={userForm.office_id}
                  onChange={(e) => setUserForm({...userForm, office_id: e.target.value})}
                >
                  <option value="">Seleccionar oficina</option>
                  {offices.map(office => (
                    <option key={office.office_id} value={office.office_id}>
                      {office.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowUserModal(false);
                  resetUserForm();
                }} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="confirm-btn">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Incidencia */}
      {showIncidentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingIncident ? 'Editar Incidencia' : 'Nueva Incidencia'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingIncident) {
                updateIncident(editingIncident.incident_id, convertIncidentFormToIncident(incidentForm));
              } else {
                createIncident(convertIncidentFormToIncident(incidentForm));
              }
            }}>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={incidentForm.status_id}
                  onChange={(e) => setIncidentForm({...incidentForm, status_id: parseInt(e.target.value)})}
                >
                  {incidentStatuses.map(status => (
                    <option key={status.status_id} value={status.status_id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reportado por</label>
                <select
                  value={incidentForm.reporter_id}
                  onChange={(e) => setIncidentForm({...incidentForm, reporter_id: e.target.value})}
                  required
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Oficina</label>
                <select
                  value={incidentForm.office_id}
                  onChange={(e) => setIncidentForm({...incidentForm, office_id: e.target.value})}
                  required
                >
                  <option value="">Seleccionar oficina</option>
                  {offices.map(office => (
                    <option key={office.office_id} value={office.office_id}>
                      {office.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo de Dispositivo</label>
                <select
                  value={incidentForm.device_id}
                  onChange={(e) => setIncidentForm({...incidentForm, device_id: e.target.value})}
                >
                  <option value="">Seleccionar tipo (opcional)</option>
                  {deviceTypes.map(type => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowIncidentModal(false);
                  resetIncidentForm();
                }} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="confirm-btn">
                  {editingIncident ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
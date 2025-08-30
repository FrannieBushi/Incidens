import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

interface Incident {
  incident_id: number;
  description: string;
  status: string;
  reporter: string;
  opened_at: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch users
      const usersResponse = await fetch('http://localhost:8000/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fetch incidents
      const incidentsResponse = await fetch('http://localhost:8000/incidents/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
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
      {/* Header */}
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

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button 
          className={activeTab === 'incidents' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('incidents')}
        >
          Incidencias
        </button>
        <button 
          className={activeTab === 'reports' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('reports')}
        >
          Reportes
        </button>
      </nav>

      {/* Main Content */}
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
                <p className="stat-number">
                  {incidents.filter(inc => inc.status === 'open').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Incidencias Resueltas</h3>
                <p className="stat-number">
                  {incidents.filter(inc => inc.status === 'resolved').length}
                </p>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Incidencias Recientes</h3>
              <div className="activity-list">
                {incidents.slice(0, 5).map(incident => (
                  <div key={incident.incident_id} className="activity-item">
                    <span className="incident-desc">{incident.description}</span>
                    <span className={`status-badge ${incident.status}`}>
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Gestión de Usuarios</h2>
            <div className="users-list">
              {users.map(user => (
                <div key={user.user_id} className="user-card">
                  <h4>{user.first_name} {user.last_name}</h4>
                  <p>{user.email}</p>
                  <span className="user-role">
                    {user.role_id === 1 ? 'Administrador' : 
                     user.role_id === 2 ? 'Técnico' : 'Usuario'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="incidents-section">
            <h2>Gestión de Incidencias</h2>
            <div className="incidents-list">
              {incidents.map(incident => (
                <div key={incident.incident_id} className="incident-card">
                  <h4>{incident.description}</h4>
                  <p>Reportado por: {incident.reporter}</p>
                  <p>Fecha: {new Date(incident.opened_at).toLocaleDateString()}</p>
                  <span className={`status-badge ${incident.status}`}>
                    {incident.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <h2>Reportes y Estadísticas</h2>
            <p>Módulo de reportes en desarrollo...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
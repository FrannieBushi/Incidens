import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import TechDashboard from './components/TechDashboard/TechDashboard';
import UserDashboard from './components/UserDashboard/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/" element={<Login />} />
          
          {/* Rutas protegidas con verificación de roles */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole={1}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tech-dashboard" 
            element={
              <ProtectedRoute requiredRole={2}>
                <TechDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/user-dashboard" 
            element={
              <ProtectedRoute requiredRole={3}>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta por defecto para usuarios no autenticados */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
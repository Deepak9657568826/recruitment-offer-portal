import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CandidateForm from './pages/CandidateForm';
import CandidateDetail from './pages/CandidateDetail';
import './App.css';

function App() {
  return (
    <ToastProvider>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-candidate"
            element={
              <ProtectedRoute>
                <CandidateForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-candidate/:id"
            element={
              <ProtectedRoute>
                <CandidateForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/:id"
            element={
              <ProtectedRoute>
                <CandidateDetail />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;

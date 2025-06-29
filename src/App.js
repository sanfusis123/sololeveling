import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import ImprovementLog from './pages/ImprovementLog';
import Flashcards from './pages/Flashcards';
import LearningMaterials from './pages/LearningMaterials';
import Diary from './pages/Diary';
import FunZone from './pages/FunZone';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Private routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/improvement-log" element={<ImprovementLog />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/learning-materials" element={<LearningMaterials />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/fun-zone" element={<FunZone />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
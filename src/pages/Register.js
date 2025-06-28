import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

// Simple icon components
const UserPlus = () => <span>👤+</span>;
const User = () => <span>👤</span>;
const Mail = () => <span>📧</span>;
const Lock = () => <span>🔒</span>;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/login');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <UserPlus />
          </div>
          <h1 className="auth-title">Join Us</h1>
          <p className="auth-subtitle">Begin your journey to level up</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <span className="input-icon"><User /></span>
              <input
                type="text"
                name="username"
                className="input input-with-icon"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail /></span>
              <input
                type="email"
                name="email"
                className="input input-with-icon"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name (Optional)</label>
            <div className="input-wrapper">
              <span className="input-icon"><User /></span>
              <input
                type="text"
                name="full_name"
                className="input input-with-icon"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><Lock /></span>
              <input
                type="password"
                name="password"
                className="input input-with-icon"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><Lock /></span>
              <input
                type="password"
                name="confirmPassword"
                className="input input-with-icon"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>

      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>
    </div>
  );
};

export default Register;
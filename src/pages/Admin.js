import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';
import toast from '../utils/toast';
import './Admin.css';

// Icons
const Users = () => <span>👥</span>;
const Shield = () => <span>🛡️</span>;
const CheckCircle = () => <span>✅</span>;
const XCircle = () => <span>❌</span>;
const Trash = () => <span>🗑️</span>;
const Activity = () => <span>📊</span>;
const User = () => <span>👤</span>;
const Clock = () => <span>⏰</span>;
const AlertCircle = () => <span>⚠️</span>;
const Key = () => <span>🔑</span>;

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (!user?.is_superuser) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await adminService.getUsers();
      setUsers(usersResponse.data);
      
      // Fetch stats
      const statsResponse = await adminService.getStats();
      setStats(statsResponse.data);
    } catch (error) {
      // console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.activateUser(userId);
      toast.success('User activated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await adminService.deactivateUser(userId);
      toast.success('User deactivated successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to deactivate user');
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to grant admin privileges to this user?')) return;
    
    try {
      await adminService.makeAdmin(userId);
      toast.success('Admin privileges granted');
      fetchData();
    } catch (error) {
      toast.error('Failed to grant admin privileges');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to remove admin privileges from this user?')) return;
    
    try {
      await adminService.removeAdmin(userId);
      toast.success('Admin privileges removed');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove admin privileges');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleChangePassword = async (userId) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await adminService.changeUserPassword(passwordUserId, newPassword);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setNewPassword('');
      setPasswordUserId(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'active') return u.is_active;
    if (filter === 'inactive') return !u.is_active;
    return true;
  });

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button className="btn btn-secondary" onClick={fetchData}>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="admin-stats">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <Users />
            </div>
            <div className="stat-content">
              <h3>{stats.users.total}</h3>
              <p>Total Users</p>
            </div>
          </div>
          
          <div className="stat-card stat-success">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.users.active}</h3>
              <p>Active Users</p>
            </div>
          </div>
          
          <div className="stat-card stat-warning">
            <div className="stat-icon">
              <AlertCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.users.inactive}</h3>
              <p>Pending Approval</p>
            </div>
          </div>
          
          <div className="stat-card stat-info">
            <div className="stat-icon">
              <Shield />
            </div>
            <div className="stat-content">
              <h3>{stats.users.admins}</h3>
              <p>Admins</p>
            </div>
          </div>
        </div>
      )}

      {/* User Management */}
      <div className="admin-section">
        <div className="section-header">
          <h2>User Management</h2>
          <div className="user-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({users.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({users.filter(u => u.is_active).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactive ({users.filter(u => !u.is_active).length})
            </button>
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={!u.is_active ? 'inactive-row' : ''}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="username">{u.username}</div>
                        {u.full_name && <div className="full-name">{u.full_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {u.is_superuser && (
                      <span className="role-badge admin">
                        <Shield /> Admin
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="date-cell">
                      <Clock />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      {!u.is_active ? (
                        <button
                          className="action-btn approve"
                          onClick={() => handleActivateUser(u.id)}
                          title="Activate User"
                        >
                          <CheckCircle />
                        </button>
                      ) : (
                        <button
                          className="action-btn deactivate"
                          onClick={() => handleDeactivateUser(u.id)}
                          title="Deactivate User"
                          disabled={u.id === user?.id}
                        >
                          <XCircle />
                        </button>
                      )}
                      
                      {!u.is_superuser ? (
                        <button
                          className="action-btn make-admin"
                          onClick={() => handleMakeAdmin(u.id)}
                          title="Grant Admin"
                        >
                          <Shield />
                        </button>
                      ) : (
                        <button
                          className="action-btn remove-admin"
                          onClick={() => handleRemoveAdmin(u.id)}
                          title="Remove Admin"
                          disabled={u.id === user?.id}
                        >
                          <User />
                        </button>
                      )}
                      
                      <button
                        className="action-btn password"
                        onClick={() => handleChangePassword(u.id)}
                        title="Change Password"
                      >
                        <Key />
                      </button>
                      
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(u.id)}
                        title="Delete User"
                        disabled={u.id === user?.id}
                      >
                        <Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <Users />
            <p>No {filter !== 'all' ? filter : ''} users found</p>
          </div>
        )}
      </div>

      {/* System Stats */}
      {stats && (
        <div className="admin-section">
          <h2>System Activity</h2>
          <div className="content-stats">
            <div className="content-stat">
              <Activity />
              <span className="stat-label">Events:</span>
              <span className="stat-value">{stats.content.events}</span>
            </div>
            <div className="content-stat">
              <Activity />
              <span className="stat-label">Flashcards:</span>
              <span className="stat-value">{stats.content.flashcards}</span>
            </div>
            <div className="content-stat">
              <Activity />
              <span className="stat-label">Diary Entries:</span>
              <span className="stat-value">{stats.content.diary_entries}</span>
            </div>
            <div className="content-stat">
              <Activity />
              <span className="stat-label">Improvement Logs:</span>
              <span className="stat-value">{stats.content.improvement_logs}</span>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Change User Password</h2>
            <p className="modal-subtitle">
              Changing password for user: {users.find(u => u.id === passwordUserId)?.username}
            </p>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setPasswordUserId(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
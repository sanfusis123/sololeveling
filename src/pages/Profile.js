import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { calendarService, flashcardsService, diaryService, improvementLogService, learningMaterialsService, authService } from '../services/api';
import toast from '../utils/toast';
import { format } from 'date-fns';
import './Profile.css';

// Icons
const User = () => <span>👤</span>;
const Mail = () => <span>📧</span>;
const Calendar = () => <span>📅</span>;
const Target = () => <span>🎯</span>;
const Brain = () => <span>🧠</span>;
const Book = () => <span>📚</span>;
const Trophy = () => <span>🏆</span>;
const Clock = () => <span>⏰</span>;
const Fire = () => <span>🔥</span>;
const Star = () => <span>⭐</span>;
const Edit = () => <span>✏️</span>;
const Save = () => <span>💾</span>;
const Cancel = () => <span>❌</span>;
const Shield = () => <span>🛡️</span>;
const Key = () => <span>🔑</span>;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalFlashcards: 0,
    streakDays: 0,
    improvementLogs: 0,
    distractionLogs: 0,
    learningMaterials: 0,
    diaryEntries: 0
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  useEffect(() => {
    // Update form data when user data changes
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Fetch today's events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const eventsResponse = await calendarService.getEvents({
        start_date: toLocalISOString(today),
        end_date: toLocalISOString(tomorrow)
      });
      const events = eventsResponse.data;
      const completedTasks = events.filter(e => e.status === 'completed').length;

      // Fetch flashcard decks
      const decksResponse = await flashcardsService.getDecks();
      const totalCards = decksResponse.data.reduce((sum, deck) => sum + deck.card_count, 0);

      // Fetch improvement logs
      const improvementResponse = await improvementLogService.getLogs({ type: 'improvement' });
      const distractionResponse = await improvementLogService.getLogs({ type: 'distraction' });
      
      // Fetch learning materials
      const materialsResponse = await learningMaterialsService.getMaterials();
      
      // Fetch diary entries count
      const diaryResponse = await diaryService.getEntries();
      
      // Calculate streak based on consecutive days with activity
      const streakDays = await calculateStreak();
      
      setStats({
        totalTasks: events.length,
        completedTasks,
        totalFlashcards: totalCards,
        streakDays,
        improvementLogs: improvementResponse.data?.length || 0,
        distractionLogs: distractionResponse.data?.length || 0,
        learningMaterials: materialsResponse.data?.length || 0,
        diaryEntries: diaryResponse.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
  };

  const handleSave = async () => {
    try {
      // Update user profile using auth context method
      const result = await updateProfile(formData);
      
      if (result.success) {
        setEditMode(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      // The backend expects just 'password' field in the update
      await authService.updateCurrentUser({
        password: passwordData.new_password
      });
      
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Current password is incorrect');
      } else if (error.response?.status === 404) {
        toast.error('Password change feature is not available yet. Please contact support.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Invalid password data');
      } else {
        toast.error('Failed to change password. Please try again later.');
      }
    }
  };

  const toLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const calculateStreak = async () => {
    try {
      // Get entries from last 30 days to calculate streak
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const diaryEntries = await diaryService.getEntries();
      const calendarEvents = await calendarService.getEvents({
        start_date: toLocalISOString(startDate),
        end_date: toLocalISOString(endDate)
      });
      
      // Create a set of dates with activity
      const activityDates = new Set();
      
      // Add diary entry dates
      diaryEntries.data?.forEach(entry => {
        if (entry.date) {
          activityDates.add(format(new Date(entry.date), 'yyyy-MM-dd'));
        }
      });
      
      // Add calendar event dates
      calendarEvents.data?.forEach(event => {
        if (event.start_time) {
          activityDates.add(format(new Date(event.start_time), 'yyyy-MM-dd'));
        }
      });
      
      // Calculate consecutive days from today backwards
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        
        if (activityDates.has(dateStr)) {
          streak++;
        } else if (i > 0) {
          // Break if we find a gap (except for today)
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const getAchievements = () => {
    const achievements = {};
    
    if (stats.streakDays >= 1) achievements.streak = true;
    if (stats.completedTasks >= 10) achievements.taskMaster = true;
    if (stats.totalFlashcards >= 50) achievements.knowledgeSeeker = true;
    if (stats.diaryEntries >= 7) achievements.writer = true;
    if (stats.learningMaterials >= 5) achievements.learner = true;
    if (stats.improvementLogs >= 10) achievements.improver = true;
    
    return achievements;
  };

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: Target, color: 'primary' },
    { label: 'Completed Tasks', value: stats.completedTasks, icon: Trophy, color: 'success' },
    { label: 'Study Cards', value: stats.totalFlashcards, icon: Brain, color: 'info' },
    { label: 'Current Streak', value: `${stats.streakDays} days`, icon: Fire, color: 'warning' },
    { label: 'Learning Materials', value: stats.learningMaterials, icon: Book, color: 'primary' },
    { label: 'Diary Entries', value: stats.diaryEntries, icon: Book, color: 'info' },
    { label: 'Improvements', value: stats.improvementLogs, icon: Star, color: 'success' },
    { label: 'Distractions', value: stats.distractionLogs, icon: Clock, color: 'warning' }
  ];

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {editMode ? (
                <input
                  type="text"
                  className="input input-enhanced"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Full Name"
                />
              ) : (
                user?.full_name || user?.username
              )}
            </h1>
            <p className="profile-username">@{user?.username}</p>
            {!editMode && (
              <button className="btn btn-primary profile-edit-btn" onClick={handleEdit}>
                <Edit /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="profile-content">
        <div className="profile-main">
          {/* About Section */}
          <div className="profile-section card">
            <h2 className="section-title">About</h2>
            <div className="profile-details">
              <div className="detail-item">
                <Mail />
                <div className="detail-content">
                  <label>Email</label>
                  {editMode ? (
                    <input
                      type="email"
                      className="input input-enhanced"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <p>{user?.email}</p>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <User />
                <div className="detail-content">
                  <label>Username</label>
                  <p>@{user?.username}</p>
                </div>
              </div>

              <div className="detail-item">
                <Calendar />
                <div className="detail-content">
                  <label>Member Since</label>
                  <p>{memberSince}</p>
                </div>
              </div>

              <div className="detail-item full-width">
                <Book />
                <div className="detail-content">
                  <label>Bio</label>
                  {editMode ? (
                    <textarea
                      className="input input-enhanced"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p>{user?.bio || formData.bio || 'No bio added yet.'}</p>
                  )}
                </div>
              </div>
            </div>

            {editMode && (
              <div className="edit-actions">
                <button className="btn btn-secondary" onClick={handleCancel}>
                  <Cancel /> Cancel
                </button>
                <button className="btn btn-success" onClick={handleSave}>
                  <Save /> Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="profile-section card">
            <h2 className="section-title">Security</h2>
            <div className="security-actions">
              <button className="security-btn" onClick={() => setShowPasswordModal(true)}>
                <Key />
                <div>
                  <h4>Change Password</h4>
                  <p>Update your password regularly for security</p>
                </div>
              </button>
              <button className="security-btn" onClick={() => toast.info('2FA feature coming soon!')}>
                <Shield />
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-section card">
            <h2 className="section-title">Your Statistics</h2>
            <div className="profile-stats">
              {statCards.map((stat, index) => (
                <div key={index} className={`profile-stat-card stat-${stat.color}`}>
                  <div className="stat-icon-small">
                    <stat.icon />
                  </div>
                  <div className="stat-info">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="profile-section card">
            <h2 className="section-title">Achievements</h2>
            <div className="achievements-grid">
              {stats.streakDays >= 1 && (
                <div className="achievement-badge">
                  <Fire />
                  <span>{stats.streakDays} Day{stats.streakDays > 1 ? 's' : ''} Streak</span>
                </div>
              )}
              {stats.completedTasks >= 10 && (
                <div className="achievement-badge">
                  <Trophy />
                  <span>Task Master</span>
                </div>
              )}
              {stats.totalFlashcards >= 50 && (
                <div className="achievement-badge">
                  <Brain />
                  <span>Knowledge Seeker</span>
                </div>
              )}
              {stats.diaryEntries >= 7 && (
                <div className="achievement-badge">
                  <Book />
                  <span>Consistent Writer</span>
                </div>
              )}
              {stats.learningMaterials >= 5 && (
                <div className="achievement-badge">
                  <Star />
                  <span>Active Learner</span>
                </div>
              )}
              {stats.improvementLogs >= 10 && (
                <div className="achievement-badge">
                  <Target />
                  <span>Self Improver</span>
                </div>
              )}
            </div>
            {Object.keys(getAchievements()).length === 0 && (
              <p className="no-achievements">Keep using the app to unlock achievements!</p>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Change Password</h2>
            
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.current_password}
                  onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.confirm_password}
                  onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
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

export default Profile;
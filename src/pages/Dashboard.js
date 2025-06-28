import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { calendarService, diaryService, flashcardsService, funZoneService, improvementLogService } from '../services/api';
import './Dashboard.css';

// Simple icon components
const Calendar = () => <span>📅</span>;
const Target = () => <span>🎯</span>;
const Brain = () => <span>🧠</span>;
const PenTool = () => <span>✍️</span>;
const Sparkles = () => <span>✨</span>;
const TrendingUp = () => <span>📈</span>;
const CheckCircle = () => <span>✅</span>;
const Clock = () => <span>⏰</span>;
const Activity = () => <span>💓</span>;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedTasks: 0,
    streakDays: 0,
    totalFlashcards: 0,
    todayMood: null
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to format date as local ISO string
  const toLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const fetchDashboardData = async () => {
    try {
      
      // Fetch today's events
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const eventsResponse = await calendarService.getEvents({
        start_date: toLocalISOString(today),
        end_date: toLocalISOString(tomorrow)
      });

      const events = eventsResponse.data;
      const completedTasks = events.filter(e => e.status === 'completed').length;
      
      setStats(prev => ({
        ...prev,
        todayTasks: events.length,
        completedTasks
      }));

      // Fetch upcoming events (from current time)
      const now = new Date();
      const endOfWeek = new Date(now);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      
      const upcomingResponse = await calendarService.getEvents({
        start_date: toLocalISOString(now),
        end_date: toLocalISOString(endOfWeek)
      });
      
      // Filter to show only pending events and sort by start time
      const upcomingFiltered = upcomingResponse.data
        .filter(e => e.status === 'pending' && new Date(e.start_time) > now)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, 5);
        
      setUpcomingEvents(upcomingFiltered);

      // Try to fetch today's diary entry (handle 404 if no entry exists)
      try {
        const diaryResponse = await diaryService.getEntryByDate(
          format(today, 'yyyy-MM-dd')
        );
        if (diaryResponse.data && diaryResponse.data.mood) {
          setStats(prev => ({ ...prev, todayMood: diaryResponse.data.mood }));
        }
      } catch (error) {
        // 404 is expected when there's no diary entry for today
        if (error.response && error.response.status !== 404) {
          console.error('Error fetching diary entry:', error);
        }
      }

      // Fetch flashcard decks
      const decksResponse = await flashcardsService.getDecks();
      const totalCards = decksResponse.data.reduce((sum, deck) => sum + deck.card_count, 0);
      setStats(prev => ({ ...prev, totalFlashcards: totalCards }));

      // Calculate daily streak
      const streak = await calculateDailyStreak();
      setStats(prev => ({ ...prev, streakDays: streak }));

      // Fetch recent activity
      await fetchRecentActivity();
      
      // Fetch recent quote
      await fetchQuote();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities = [];
      
      // Get recently completed tasks
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentEventsRes = await calendarService.getEvents({
        start_date: toLocalISOString(oneWeekAgo),
        end_date: toLocalISOString(new Date())
      });
      
      // Add completed tasks to activities
      recentEventsRes.data
        .filter(event => event.status === 'completed')
        .slice(0, 3)
        .forEach(event => {
          activities.push({
            type: 'task',
            icon: CheckCircle,
            text: `Completed "${event.title}"`,
            time: new Date(event.updated_at || event.end_time),
            link: '/calendar'
          });
        });
      
      // Get recent diary entries
      const diaryRes = await diaryService.getEntries({
        limit: 3
      });
      
      diaryRes.data.forEach(entry => {
        activities.push({
          type: 'diary',
          icon: PenTool,
          text: 'Added diary entry',
          time: new Date(entry.created_at),
          link: '/diary'
        });
      });
      
      // Get recent improvement logs
      const logsRes = await improvementLogService.getLogs({
        limit: 3
      });
      
      logsRes.data.forEach(log => {
        activities.push({
          type: 'improvement',
          icon: Target,
          text: `Added ${log.type || log.log_type || 'improvement'} log: "${log.title}"`,
          time: new Date(log.created_at),
          link: '/improvement'
        });
      });
      
      // Sort by time and take most recent
      activities.sort((a, b) => b.time - a.time);
      setRecentActivity(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };
  
  const calculateDailyStreak = async () => {
    try {
      // Get events from the last 30 days to calculate streak
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      // Fetch all events in the last 30 days
      const eventsRes = await calendarService.getEvents({
        start_date: toLocalISOString(thirtyDaysAgo),
        end_date: toLocalISOString(today)
      });
      
      // Get diary entries for the same period
      const diaryRes = await diaryService.getEntries({
        start_date: thirtyDaysAgo.toISOString(),
        end_date: today.toISOString()
      });
      
      // Create a map of dates with activity
      const activityDates = new Set();
      
      // Add dates with completed events
      eventsRes.data
        .filter(event => event.status === 'completed')
        .forEach(event => {
          const date = new Date(event.end_time).toDateString();
          activityDates.add(date);
        });
      
      // Add dates with diary entries
      diaryRes.data.forEach(entry => {
        const date = new Date(entry.date).toDateString();
        activityDates.add(date);
      });
      
      // Calculate streak from today backwards
      let streak = 0;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Check if there's activity today
      const todayStr = currentDate.toDateString();
      if (!activityDates.has(todayStr)) {
        // No activity today, check if there was activity yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = currentDate.toDateString();
        if (!activityDates.has(yesterdayStr)) {
          return 0; // No streak
        }
      }
      
      // Count consecutive days with activity
      while (activityDates.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const fetchQuote = async () => {
    try {
      // Get recent quotes from Fun Zone
      const quotesRes = await funZoneService.getContents({
        content_type: 'quote',
        limit: 10
      });
      
      if (quotesRes.data && quotesRes.data.length > 0) {
        // Pick a random quote from recent ones
        const randomQuote = quotesRes.data[Math.floor(Math.random() * quotesRes.data.length)];
        setQuote(randomQuote);
      } else {
        // Fallback quote if no quotes in database
        setQuote({
          content: "The secret of getting ahead is getting started.",
          metadata: { author: "Mark Twain" }
        });
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const quickActions = [
    { 
      title: 'Add Task', 
      icon: Calendar, 
      color: 'var(--accent-primary)',
      link: '/calendar'
    },
    { 
      title: 'Review Cards', 
      icon: Brain, 
      color: 'var(--accent-success)',
      link: '/flashcards'
    },
    { 
      title: 'Write Entry', 
      icon: PenTool, 
      color: 'var(--accent-warning)',
      link: '/diary'
    },
    { 
      title: 'Track Progress', 
      icon: Target, 
      color: 'var(--accent-info)',
      link: '/improvement-log'
    }
  ];

  const statCards = [
    {
      title: "Today's Tasks",
      value: stats.todayTasks,
      icon: Calendar,
      color: 'var(--accent-primary)',
      gradient: 'primary',
      subtitle: `${stats.completedTasks} completed`
    },
    {
      title: 'Study Cards',
      value: stats.totalFlashcards,
      icon: Brain,
      color: 'var(--accent-success)',
      gradient: 'success',
      subtitle: 'Total cards'
    },
    {
      title: 'Daily Streak',
      value: stats.streakDays,
      icon: TrendingUp,
      color: 'var(--accent-warning)',
      gradient: 'warning',
      subtitle: 'Days'
    },
    {
      title: "Today's Mood",
      value: stats.todayMood || 'Not set',
      icon: Activity,
      color: 'var(--accent-info)',
      gradient: 'info',
      subtitle: 'Current feeling'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-card"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header fade-in">
        <h1>Welcome back, {user?.full_name || user?.username}!</h1>
        <p className="dashboard-subtitle">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid fade-in">
        {statCards.map((stat, index) => (
          <StatCard key={index} stat={stat} gradient={stat.gradient} />
        ))}
      </div>

      {/* Quick Actions */}
      <section className="dashboard-section fade-in">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link 
              key={index} 
              to={action.link} 
              className="quick-action-card card"
            >
              <div 
                className="quick-action-icon" 
                style={{ backgroundColor: `${action.color}20`, color: action.color }}
              >
                <action.icon />
              </div>
              <span className="quick-action-title">{action.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="dashboard-columns fade-in">
        {/* Upcoming Events */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <Link to="/calendar" className="section-link">View all</Link>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="upcoming-events">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item card">
                  <div className="event-time">
                    <Clock />
                    <span>{format(new Date(event.start_time), 'h:mm a')}</span>
                  </div>
                  <div className="event-details">
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-date">
                      {format(new Date(event.start_time), 'MMM d')}
                    </p>
                  </div>
                  <div className={`event-priority priority-${event.priority}`}>
                    {event.priority}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No upcoming events</p>
          )}
        </section>

        {/* Recent Activity */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <Link to="/calendar" className="section-link">View all</Link>
          </div>
          
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <Link 
                  key={index} 
                  to={activity.link} 
                  className="activity-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <activity.icon className="activity-icon" />
                  <div className="activity-content">
                    <p className="activity-text">{activity.text}</p>
                    <p className="activity-time">
                      {formatDistanceToNow(activity.time, { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="empty-state">No recent activity</p>
            )}
          </div>
        </section>
      </div>

      {/* Motivational Quote */}
      {quote && (
        <div className="quote-card card fade-in">
          <Sparkles className="quote-icon" />
          <blockquote className="quote-text">
            {quote.content}
          </blockquote>
          {quote.metadata?.author && (
            <cite className="quote-author">- {quote.metadata.author}</cite>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Stat Card Component with Mouse Tracking
const StatCard = ({ stat, gradient }) => {
  const cardRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    cardRef.current.style.setProperty('--mouse-x', `${percentX}%`);
    cardRef.current.style.setProperty('--mouse-y', `${percentY}%`);
  };
  
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--mouse-x', '50%');
    cardRef.current.style.setProperty('--mouse-y', '50%');
  };
  
  return (
    <div 
      ref={cardRef}
      className={`stat-card card stat-card-${gradient}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stat-icon">
        <stat.icon />
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{stat.value}</h3>
        <p className="stat-title">{stat.title}</p>
        <p className="stat-subtitle">{stat.subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;
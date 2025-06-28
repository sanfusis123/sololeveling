import React, { useState, useEffect } from 'react';
import { format, startOfMonth } from 'date-fns';
import { analyticsService } from '../services/api';
import toast from '../utils/toast';
import './Analytics.css';

// Simple icon components
const BarChart3 = () => <span>📊</span>;
const Clock = () => <span>⏰</span>;
const Target = () => <span>🎯</span>;
const TrendingUp = () => <span>📈</span>;
const Calendar = () => <span>📅</span>;
const Award = () => <span>🏆</span>;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year, all
  const [skillsData, setSkillsData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [productivityData, setProductivityData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const getDateRange = () => {
    const end = new Date();
    let start;

    switch (selectedPeriod) {
      case 'week':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = startOfMonth(new Date());
        break;
      case 'year':
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start = null;
        break;
      default:
        start = startOfMonth(new Date());
    }

    return { start, end };
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const params = {};
      
      if (start) {
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
        
        params.start_date = toLocalISOString(start);
        params.end_date = toLocalISOString(end);
      }

      const [skillsRes, projectsRes, productivityRes] = await Promise.all([
        analyticsService.getSkillsTimeSpent(params),
        analyticsService.getProjectsTimeSpent(params),
        analyticsService.getProductivityOverview(params)
      ]);

      setSkillsData(skillsRes.data || []);
      setProjectsData(projectsRes.data || []);
      setProductivityData(productivityRes.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = (data, key) => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item[key]));
  };

  const renderBarChart = (data, valueKey, labelKey, color) => {
    const maxValue = getMaxValue(data, valueKey);
    
    return (
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-label">{item[labelKey]}</div>
            <div className="bar-container">
              <div 
                className="bar-fill"
                style={{
                  width: `${(item[valueKey] / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              />
              <span className="bar-value">{item[valueKey]} hrs</span>
            </div>
            <div className="bar-count">{item.task_count} tasks</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Time Analytics</h1>
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            Year
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Productivity Overview */}
      {productivityData && (
        <div className="analytics-overview">
          <h2 className="section-title">
            <TrendingUp />
            Productivity Overview
          </h2>
          <div className="overview-cards">
            <div className="overview-card card">
              <div className="overview-icon">
                <Target />
              </div>
              <div className="overview-content">
                <div className="overview-value">{productivityData.total_tasks}</div>
                <div className="overview-label">Total Tasks</div>
              </div>
            </div>

            <div className="overview-card card">
              <div className="overview-icon">
                <Award />
              </div>
              <div className="overview-content">
                <div className="overview-value">{productivityData.completed_tasks}</div>
                <div className="overview-label">Completed</div>
                <div className="overview-subtext">{productivityData.completion_rate}% rate</div>
              </div>
            </div>

            <div className="overview-card card">
              <div className="overview-icon">
                <Clock />
              </div>
              <div className="overview-content">
                <div className="overview-value">{productivityData.total_hours}</div>
                <div className="overview-label">Total Hours</div>
                <div className="overview-subtext">
                  {productivityData.average_hours_per_task} hrs/task
                </div>
              </div>
            </div>

            {productivityData.most_productive_day && (
              <div className="overview-card card">
                <div className="overview-icon">
                  <Calendar />
                </div>
                <div className="overview-content">
                  <div className="overview-value">
                    {format(new Date(productivityData.most_productive_day.date), 'MMM d')}
                  </div>
                  <div className="overview-label">Most Productive</div>
                  <div className="overview-subtext">
                    {productivityData.most_productive_day.hours} hrs
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Analysis */}
      <div className="analytics-section">
        <h2 className="section-title">
          <BarChart3 />
          Time by Skill
        </h2>
        <div className="chart-container card">
          {skillsData.length > 0 ? (
            renderBarChart(skillsData, 'total_hours', 'skill_name', 'var(--accent-primary)')
          ) : (
            <div className="empty-state">
              <p>No skill data available for this period</p>
              <p className="empty-hint">Add skills to your calendar events to track time</p>
            </div>
          )}
        </div>
      </div>

      {/* Projects Analysis */}
      <div className="analytics-section">
        <h2 className="section-title">
          <BarChart3 />
          Time by Project
        </h2>
        <div className="chart-container card">
          {projectsData.length > 0 ? (
            renderBarChart(projectsData, 'total_hours', 'project_name', 'var(--accent-success)')
          ) : (
            <div className="empty-state">
              <p>No project data available for this period</p>
              <p className="empty-hint">Add projects to your calendar events to track time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { calendarService, projectsService, skillsService } from '../services/api';
import toast from '../utils/toast';
import './Calendar.css';

// Simple icon components
const Plus = () => <span>➕</span>;
const ChevronLeft = () => <span>◀</span>;
const ChevronRight = () => <span>▶</span>;
const Clock = () => <span>⏰</span>;
const CheckCircle = () => <span>✅</span>;
const XCircle = () => <span>❌</span>;
const CalendarIcon = () => <span>📅</span>;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    fetchEventsAndData();
  }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps


  const fetchEventsAndData = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
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
      
      const [eventsRes, projectsRes, skillsRes] = await Promise.all([
        calendarService.getEvents({
          start_date: toLocalISOString(start),
          end_date: toLocalISOString(end)
        }),
        projectsService.getProjects(),
        skillsService.getSkills()
      ]);
      
      // console.log('Fetched events:', eventsRes.data);
      setEvents(eventsRes.data);
      setProjects(projectsRes.data || []);
      setSkills(skillsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete?.id) return;
    
    try {
      await calendarService.deleteEvent(eventToDelete.id);
      toast.success('Event deleted successfully');
      setShowDeleteConfirm(false);
      setShowEventModal(false);
      setEventToDelete(null);
      refreshEvents();
    } catch (error) {
      toast.error('Failed to delete event');
      setShowDeleteConfirm(false);
    }
  };

  const refreshEvents = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
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
      
      const response = await calendarService.getEvents({
        start_date: toLocalISOString(start),
        end_date: toLocalISOString(end)
      });
      
      setEvents(response.data || []);
      // console.log('Refreshed events:', response.data);
    } catch (error) {
      // console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days from previous month
    const startDay = start.getDay();
    const paddingDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(start);
      day.setDate(day.getDate() - (i + 1));
      paddingDays.push(day);
    }
    
    return [...paddingDays, ...days];
  };

  const getEventsForDay = (day) => {
    return events.filter(event => {
      // All times are now local timezone-naive
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, day);
    });
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // Debug function to create sample events
  const createSampleEvents = async () => {
    const sampleEvents = [
      {
        title: "Morning Workout",
        description: "30 minutes cardio",
        start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 7, 0).toISOString(),
        end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 8, 0).toISOString(),
        priority: "high",
        category: "Health"
      },
      {
        title: "Team Meeting",
        description: "Weekly sync",
        start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 10, 0).toISOString(),
        end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 11, 0).toISOString(),
        priority: "medium",
        category: "Work"
      },
      {
        title: "Learn React",
        description: "Study hooks",
        start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 14, 0).toISOString(),
        end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 16, 0).toISOString(),
        priority: "high",
        category: "Learning"
      }
    ];

    for (const event of sampleEvents) {
      try {
        await calendarService.createEvent(event);
      } catch (error) {
        // console.error('Error creating sample event:', error);
      }
    }
    
    toast.success('Sample events created!');
    refreshEvents();
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCompleteEvent = async (eventId) => {
    try {
      await calendarService.completeEvent(eventId, { completed: true });
      toast.success('Task completed!');
      refreshEvents();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleSkipEvent = async (eventId) => {
    try {
      await calendarService.skipEvent(eventId, { reason: 'Skipped' });
      toast.success('Task skipped');
      refreshEvents();
    } catch (error) {
      toast.error('Failed to skip task');
    }
  };

  const getProjectById = (projectId) => {
    return projects.find(p => p.id === projectId);
  };

  const getSkillById = (skillId) => {
    return skills.find(s => s.id === skillId);
  };

  const days = getDaysInMonth();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="calendar-loading">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>Smart Calendar</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleCreateEvent}>
            <Plus />
            Add Event
          </button>
          {process.env.NODE_ENV === 'development' && events.length === 0 && (
            <button className="btn btn-secondary" onClick={createSampleEvents}>
              Create Sample Events
            </button>
          )}
        </div>
      </div>

      <div className="calendar-container">
        {/* Calendar Navigation */}
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={handlePrevMonth}>
            <ChevronLeft />
          </button>
          <h2 className="calendar-month">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button className="calendar-nav-btn" onClick={handleNextMonth}>
            <ChevronRight />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {/* Day Labels */}
          {dayLabels.map(label => (
            <div key={label} className="calendar-day-label">
              {label}
            </div>
          ))}

          {/* Days */}
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'calendar-day-outside' : ''} ${isToday ? 'calendar-day-today' : ''} ${isSelected ? 'calendar-day-selected' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="calendar-day-number">
                  {format(day, 'd')}
                </div>
                
                {dayEvents.length > 0 && (
                  <div className="calendar-day-events">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id || event._id}
                        className={`calendar-event-item priority-${event.priority}`}
                        title={event.title}
                      >
                        <span className="calendar-event-time">
                          {format(new Date(event.start_time), 'HH:mm')}
                        </span>
                        <span className="calendar-event-title">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="calendar-event-more">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Events */}
        <div className="selected-day-section">
          <h3 className="selected-day-title">
            Events for {format(selectedDate, 'EEEE, MMMM d')}
          </h3>

          <div className="events-list">
            {getEventsForDay(selectedDate).length > 0 ? (
              getEventsForDay(selectedDate).map(event => (
                <div key={event.id || event._id} className="event-card card">
                  <div className="event-header">
                    <h4 className="event-title">{event.title}</h4>
                    <div className={`event-priority priority-${event.priority}`}>
                      {event.priority}
                    </div>
                  </div>

                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}

                  <div className="event-meta">
                    <div className="event-time">
                      <Clock />
                      <span>
                        {format(new Date(event.start_time), 'h:mm a')} - 
                        {format(new Date(event.end_time), 'h:mm a')}
                      </span>
                    </div>
                    
                    <div className={`event-status status-${event.status}`}>
                      {event.status}
                    </div>
                  </div>

                  {(event.project_id || event.skill_id) && (
                    <div className="event-tags">
                      {event.project_id && getProjectById(event.project_id) && (
                        <span className="event-tag project-tag">
                          📁 {getProjectById(event.project_id).name}
                        </span>
                      )}
                      {event.skill_id && getSkillById(event.skill_id) && (
                        <span className="event-tag skill-tag">
                          {getSkillById(event.skill_id).icon || '💡'} {getSkillById(event.skill_id).name}
                        </span>
                      )}
                    </div>
                  )}

                  {event.status === 'pending' && (
                    <div className="event-actions">
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-success btn-small"
                        onClick={() => handleCompleteEvent(event.id)}
                      >
                        <CheckCircle />
                        Complete
                      </button>
                      <button 
                        className="btn btn-warning btn-small"
                        onClick={() => handleSkipEvent(event.id)}
                      >
                        <XCircle />
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <CalendarIcon />
                <p>No events scheduled for this day</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedEvent(null);
                    setShowEventModal(true);
                  }}
                >
                  Add Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          selectedDate={selectedDate}
          onClose={() => {
            if (!showDeleteConfirm) {
              setShowEventModal(false);
              setShowDeleteConfirm(false);
            }
          }}
          onSave={() => {
            setShowEventModal(false);
            refreshEvents();
          }}
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          setEventToDelete={setEventToDelete}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 99999
            }}
            onClick={() => {
              setShowDeleteConfirm(false);
              setEventToDelete(null);
            }}
          />
          
          {/* Modal */}
          <div 
            className="modal-content"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100000,
              maxWidth: '400px',
              width: '90%',
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 0.5px rgba(255, 255, 255, 0.2)',
              animation: 'modalSlideIn 0.2s ease-out'
            }}
          >
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <h2 style={{ margin: 0, color: 'white' }}>Delete Event</h2>
              </div>
            </div>
            <div className="modal-body" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px' }}>
                Are you sure you want to delete
              </p>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)',
                padding: '16px 24px', 
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}>
                <p style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                  {eventToDelete?.title || 'this event'}
                </p>
              </div>
              <p style={{ fontSize: '14px', color: '#ff6b6b', margin: 0, fontWeight: '500' }}>
                ⚠️ This action cannot be undone
              </p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEventToDelete(null);
                }}
                style={{ minWidth: '120px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDeleteEvent}
                style={{ minWidth: '120px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Event Modal Component
const EventModal = ({ event, selectedDate, onClose, onSave, showDeleteConfirm, setShowDeleteConfirm, setEventToDelete }) => {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDates, setSelectedDates] = useState(event ? [new Date(event.start_time)] : [selectedDate]);
  const [isMultiDay, setIsMultiDay] = useState(false);
  
  // Ensure selectedDate is a valid Date object
  const getDefaultStartTime = () => {
    if (selectedDate instanceof Date && !isNaN(selectedDate)) {
      const startTime = new Date(selectedDate);
      startTime.setHours(9, 0, 0, 0);
      return startTime.toISOString();
    }
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    return now.toISOString();
  };
  
  const getDefaultEndTime = () => {
    if (selectedDate instanceof Date && !isNaN(selectedDate)) {
      const endTime = new Date(selectedDate);
      endTime.setHours(10, 0, 0, 0);
      return endTime.toISOString();
    }
    const now = new Date();
    now.setHours(10, 0, 0, 0);
    return now.toISOString();
  };

  // Initialize form data with proper date handling
  const initStartTime = event?.start_time ? new Date(event.start_time) : new Date(getDefaultStartTime());
  const initEndTime = event?.end_time ? new Date(event.end_time) : new Date(getDefaultEndTime());

  // Store times as Date objects for easier manipulation
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_time: new Date(initStartTime),
    end_time: new Date(initEndTime),
    priority: event?.priority || 'medium',
    category: event?.category || '',
    project_id: event?.project_id || '',
    skill_id: event?.skill_id || '',
    is_recurring: event?.is_recurring || false
  });

  useEffect(() => {
    fetchProjectsAndSkills();
  }, []);

  const fetchProjectsAndSkills = async () => {
    try {
      const [projectsRes, skillsRes] = await Promise.all([
        projectsService.getProjects({ status: 'active' }),
        skillsService.getSkills()
      ]);
      setProjects(projectsRes.data || []);
      setSkills(skillsRes.data || []);
    } catch (error) {
      // console.error('Error fetching projects/skills:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate that end time is after start time
      if (formData.end_time <= formData.start_time) {
        toast.error('End time must be after start time');
        return;
      }
      
      // Helper function to format date as local ISO string without timezone offset
      const toLocalISOString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        // Return as ISO format but without timezone conversion
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };
      
      if (event?.id) {
        // Update single event
        const eventData = {
          ...formData,
          start_time: toLocalISOString(formData.start_time),
          end_time: toLocalISOString(formData.end_time)
        };
        await calendarService.updateEvent(event.id, eventData);
        toast.success('Event updated successfully');
      } else if (isMultiDay && selectedDates.length > 0) {
        // Create events for multiple days
        const startHours = formData.start_time.getHours();
        const startMinutes = formData.start_time.getMinutes();
        const endHours = formData.end_time.getHours();
        const endMinutes = formData.end_time.getMinutes();
        
        let successCount = 0;
        let failCount = 0;
        
        for (const date of selectedDates) {
          try {
            const dayStartTime = new Date(date);
            dayStartTime.setHours(startHours, startMinutes, 0, 0);
            
            const dayEndTime = new Date(date);
            dayEndTime.setHours(endHours, endMinutes, 0, 0);
            
            const eventData = {
              ...formData,
              start_time: toLocalISOString(dayStartTime),
              end_time: toLocalISOString(dayEndTime)
            };
            
            await calendarService.createEvent(eventData);
            successCount++;
          } catch (error) {
            failCount++;
            console.error('Failed to create event for date:', date, error);
          }
        }
        
        if (successCount > 0 && failCount === 0) {
          toast.success(`Created ${successCount} event${successCount > 1 ? 's' : ''} successfully`);
        } else if (successCount > 0 && failCount > 0) {
          toast.warning(`Created ${successCount} event${successCount > 1 ? 's' : ''}, ${failCount} failed`);
        } else {
          toast.error('Failed to create events');
        }
      } else {
        // Create single event
        const eventData = {
          ...formData,
          start_time: toLocalISOString(formData.start_time),
          end_time: toLocalISOString(formData.end_time)
        };
        await calendarService.createEvent(eventData);
        toast.success('Event created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save event');
      // console.error('Error saving event:', error);
    }
  };


  return (
    <>
      <div className="modal-overlay" onClick={() => !showDeleteConfirm && onClose()}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h2>{event?.id ? 'Edit Event' : 'Create Event'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isMultiDay}
                onChange={e => {
                  setIsMultiDay(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedDates([selectedDate]);
                  }
                }}
                style={{ marginRight: '8px' }}
              />
              Create event for multiple days
            </label>
          </div>

          <div className="form-group">
            <label>Date{isMultiDay ? 's' : ''}</label>
            {!isMultiDay ? (
              <input
                type="date"
                className="input"
                value={(() => {
                  const date = formData.start_time;
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                })()}
                onChange={e => {
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  
                  // Update start time
                  const newStartDate = new Date(formData.start_time);
                  newStartDate.setFullYear(year, month - 1, day);
                  
                  // Update end time to same date
                  const newEndDate = new Date(formData.end_time);
                  newEndDate.setFullYear(year, month - 1, day);
                  
                  setFormData({
                    ...formData, 
                    start_time: newStartDate,
                    end_time: newEndDate
                  });
                  setSelectedDates([newStartDate]);
                }}
                required
              />
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="date"
                    className="input"
                    style={{ flex: 1 }}
                    placeholder="Select date to add"
                    onChange={e => {
                      if (!e.target.value) return;
                      
                      try {
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        const newDate = new Date(year, month - 1, day);
                        
                        // Check if date already exists
                        const dateExists = selectedDates.some(d => 
                          format(d, 'yyyy-MM-dd') === format(newDate, 'yyyy-MM-dd')
                        );
                        
                        if (!dateExists) {
                          setSelectedDates([...selectedDates, newDate].sort((a, b) => a - b));
                          // Clear the input after successful addition
                          e.target.value = '';
                        } else {
                          // Don't show warning, just silently ignore
                          e.target.value = '';
                        }
                      } catch (error) {
                        console.error('Error adding date:', error);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                
                {selectedDates.length > 0 && (
                  <div style={{ 
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '8px',
                    backgroundColor: 'var(--bg-elevated)',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ 
                      marginBottom: '6px', 
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}>
                      Selected dates ({selectedDates.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedDates.map((date, index) => (
                        <div key={index} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: 'rgba(77, 171, 247, 0.1)',
                          border: '1px solid rgba(77, 171, 247, 0.3)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          gap: '6px'
                        }}>
                          <span>{format(date, 'MMM d')}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedDates.length > 1) {
                                setSelectedDates(selectedDates.filter((_, i) => i !== index));
                              } else {
                                toast.error('Must have at least one date selected');
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef5350',
                              cursor: 'pointer',
                              padding: '0',
                              fontSize: '16px',
                              lineHeight: '1'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                className="input"
                value={(() => {
                  const date = formData.start_time;
                  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                })()}
                onChange={e => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  const newDate = new Date(formData.start_time);
                  newDate.setHours(hours, minutes, 0, 0);
                  setFormData({...formData, start_time: newDate});
                }}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                className="input"
                value={(() => {
                  const date = formData.end_time;
                  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                })()}
                onChange={e => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  const newDate = new Date(formData.end_time);
                  newDate.setHours(hours, minutes, 0, 0);
                  setFormData({...formData, end_time: newDate});
                }}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                className="input"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                className="input"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Work, Personal, Study"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select
                className="input"
                value={formData.project_id}
                onChange={e => setFormData({...formData, project_id: e.target.value})}
                disabled={loadingData}
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Skill</label>
              <select
                className="input"
                value={formData.skill_id}
                onChange={e => setFormData({...formData, skill_id: e.target.value})}
                disabled={loadingData}
              >
                <option value="">No Skill</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.icon} {skill.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions" style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: event?.id ? 'space-between' : 'flex-end' 
          }}>
            {event?.id && (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => {
                  setEventToDelete({ id: event.id, title: formData.title });
                  setShowDeleteConfirm(true);
                }}
                style={{ flex: '0 0 auto' }}
              >
                Delete
              </button>
            )}
            <div style={{ display: 'flex', gap: '12px', flex: '1', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => !showDeleteConfirm && onClose()}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {event?.id ? 'Update' : 'Create'} Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    </>
  );
};

export default Calendar;
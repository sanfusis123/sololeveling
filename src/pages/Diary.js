import React, { useState, useEffect } from 'react';
import { diaryService } from '../services/api';
import toast from '../utils/toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import './Diary.css';

// Simple icon components
const Plus = () => <span>➕</span>;
// const Edit = () => <span>✏️</span>; // Unused
const Calendar = () => <span>📅</span>;
const Heart = () => <span>❤️</span>;
const BookOpen = () => <span>📖</span>;
const ChevronLeft = () => <span>◀</span>;
const ChevronRight = () => <span>▶</span>;
const Search = () => <span>🔍</span>;
// const Filter = () => <span>🔧</span>; // Unused
const Tag = () => <span>🏷️</span>;

// Mood icons
const moods = {
  amazing: { emoji: '🤩', label: 'Amazing', color: 'var(--accent-success)' },
  happy: { emoji: '😊', label: 'Happy', color: 'var(--accent-info)' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'var(--text-secondary)' },
  sad: { emoji: '😢', label: 'Sad', color: 'var(--accent-warning)' },
  angry: { emoji: '😠', label: 'Angry', color: 'var(--accent-error)' }
};

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []); // Only fetch once on mount

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, selectedMoodFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEntries = async () => {
    try {
      // Fetch ALL entries, not just for current month
      const response = await diaryService.getEntries({});
      
      const entriesData = response.data || [];
      // console.log('Fetched all entries:', entriesData.length, 'entries');
      // Log to verify we're using the date field correctly
      entriesData.forEach(entry => {
        // console.log('Entry dates:', {
        //   date: entry.date,  // The diary date (when it was written FOR)
        //   created_at: entry.created_at  // When the entry was created in the system
        // });
      });
      setEntries(entriesData);
    } catch (error) {
      toast.error('Failed to fetch diary entries');
      // console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.content.toLowerCase().includes(query) ||
        entry.title?.toLowerCase().includes(query) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedMoodFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mood === selectedMoodFilter);
    }

    setFilteredEntries(filtered);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days
    const startDay = start.getDay();
    const paddingDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(start);
      day.setDate(day.getDate() - (i + 1));
      paddingDays.push(day);
    }
    
    return [...paddingDays, ...days];
  };
  
  // Get entries for the current month being viewed
  const getEntriesForCurrentMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return entries.filter(entry => {
      try {
        let entryDate;
        if (entry.date.includes('T')) {
          entryDate = parseISO(entry.date);
        } else {
          entryDate = parseISO(entry.date + 'T00:00:00');
        }
        // Using the 'date' field (diary date), NOT 'created_at'
        // console.log('Filtering entry:', {
        //   date: entry.date,
        //   parsedDate: format(entryDate, 'yyyy-MM-dd'),
        //   inRange: entryDate >= start && entryDate <= end
        // });
        return entryDate >= start && entryDate <= end;
      } catch (error) {
        // console.error('Error parsing entry date:', entry.date, error);
        return false;
      }
    });
  };

  const getEntryForDay = (day) => {
    return entries.find(entry => {
      // Handle both ISO string and date-only formats
      let entryDate;
      try {
        if (entry.date.includes('T')) {
          entryDate = parseISO(entry.date);
        } else {
          // Handle YYYY-MM-DD format
          entryDate = parseISO(entry.date + 'T00:00:00');
        }
        const isSame = isSameDay(entryDate, day);
        // Using the 'date' field (when diary was written FOR), NOT 'created_at'
        if (isSame) {
          // console.log('Found entry for day:', {
          //   searchDay: format(day, 'yyyy-MM-dd'),
          //   entryDate: entry.date,
          //   created_at: entry.created_at
          // });
        }
        return isSame;
      } catch (error) {
        // console.error('Error parsing date:', entry.date, error);
        return false;
      }
    });
  };

  const handleCreateEntry = (date = selectedDate) => {
    const existingEntry = getEntryForDay(date);
    // console.log('Checking for existing entry on date:', format(date, 'yyyy-MM-dd'), 'Found:', existingEntry);
    if (existingEntry) {
      // Edit existing entry
      setSelectedEntry(existingEntry);
    } else {
      // Create new entry - use the date at midnight local time
      const localDate = new Date(date);
      localDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      setSelectedEntry({ date: localDate.toISOString() });
    }
    setShowModal(true);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const getMoodStats = () => {
    const monthEntries = getEntriesForCurrentMonth();
    const stats = {};
    Object.keys(moods).forEach(mood => {
      stats[mood] = monthEntries.filter(e => e.mood === mood).length;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="diary-page">
        <div className="loading-state">Loading diary entries...</div>
      </div>
    );
  }

  return (
    <div className="diary-page">
      <div className="page-header">
        <h1>Personal Diary</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <Calendar />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => handleCreateEntry()}>
            <Plus />
            New Entry
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="diary-controls">
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <div className="search-input-wrapper">
            <Search />
            <input
              type="text"
              className="input search-input"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Mood Filter */}
        <div className="mood-filter">
          <button
            className={`mood-filter-btn ${selectedMoodFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedMoodFilter('all')}
          >
            All Moods
          </button>
          {Object.entries(moods).map(([key, mood]) => (
            <button
              key={key}
              className={`mood-filter-btn ${selectedMoodFilter === key ? 'active' : ''}`}
              onClick={() => setSelectedMoodFilter(key)}
              style={{ color: selectedMoodFilter === key ? mood.color : undefined }}
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Stats */}
      <div className="mood-stats">
        {Object.entries(getMoodStats()).map(([mood, count]) => (
          <div key={mood} className="stat-card card">
            <div className="stat-emoji">{moods[mood].emoji}</div>
            <div className="stat-value">{count}</div>
            <div className="stat-label">{moods[mood].label} Days</div>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-container">
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft />
            </button>
            <h2 className="calendar-month">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button className="calendar-nav-btn" onClick={handleNextMonth}>
              <ChevronRight />
            </button>
          </div>

          <div className="diary-calendar-grid">
            {/* Day Labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-label">{day}</div>
            ))}

            {/* Days */}
            {getDaysInMonth().map((day, index) => {
              const entry = getEntryForDay(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={index}
                  className={`diary-calendar-day ${!isCurrentMonth ? 'outside-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${entry ? 'has-entry' : ''}`}
                  onClick={() => {
                    setSelectedDate(day);
                    if (entry) {
                      handleEditEntry(entry);
                    } else {
                      handleCreateEntry(day);
                    }
                  }}
                >
                  <div className="day-number">{format(day, 'd')}</div>
                  {entry && (
                    <div className="day-content">
                      <div className="day-mood">{moods[entry.mood]?.emoji}</div>
                      {entry.title && (
                        <div className="day-title">{entry.title}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="entries-list">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <div key={entry.id || entry._id} className="entry-card card" onClick={() => handleEditEntry(entry)}>
                <div className="entry-header">
                  <div className="entry-date">
                    {format(entry.date.includes('T') ? parseISO(entry.date) : parseISO(entry.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="entry-mood" style={{ color: moods[entry.mood]?.color }}>
                    {moods[entry.mood]?.emoji} {moods[entry.mood]?.label}
                  </div>
                </div>

                {entry.title && (
                  <h3 className="entry-title">{entry.title}</h3>
                )}

                <div className="entry-content-preview">
                  {entry.content.substring(0, 200)}...
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="entry-tags">
                    {entry.tags.map(tag => (
                      <span key={tag} className="tag">
                        <Tag /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="entry-stats">
                  <span>Word count: {entry.content.split(' ').length}</span>
                  {entry.gratitude_list && entry.gratitude_list.length > 0 && (
                    <span>• {entry.gratitude_list.length} gratitudes</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <BookOpen />
              <h3>No entries found</h3>
              <p>Start writing your thoughts and feelings</p>
              <button className="btn btn-primary" onClick={() => handleCreateEntry()}>
                Write Your First Entry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Entry Modal */}
      {showModal && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            // Add a small delay to ensure the backend has processed the entry
            setTimeout(() => {
              fetchEntries();
            }, 500);
          }}
        />
      )}
    </div>
  );
};

// Entry Modal Component
const EntryModal = ({ entry, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: entry?.date || new Date().toISOString(),
    title: entry?.title || '',
    content: entry?.content || '',
    mood: entry?.mood || 'neutral',
    tags: entry?.tags?.join(', ') || '',
    gratitude_list: entry?.gratitude_list || entry?.gratitude || ['', '', '']
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const entryData = {
      ...formData,
      date: formData.date.split('T')[0], // Extract just the date part YYYY-MM-DD
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      gratitude_list: formData.gratitude_list.filter(g => g.trim())
    };

    try {
      if (entry?.id || entry?._id) {
        // Extract date from the entry data
        const entryDate = entry.date || formData.date;
        const dateString = typeof entryDate === 'string' ? entryDate.split('T')[0] : format(parseISO(entryDate), 'yyyy-MM-dd');
        await diaryService.updateEntry(dateString, entryData);
        toast.success('Entry updated successfully');
      } else {
        await diaryService.createEntry(entryData);
        toast.success('Entry created successfully');
      }
      onSave();
    } catch (error) {
      if (error.response?.data?.detail === "Entry already exists for this date") {
        toast.error('An entry already exists for this date. Please refresh the page.');
        // Call onSave to trigger refresh in parent component
        onSave();
      } else {
        toast.error('Failed to save entry');
      }
      // console.error('Error saving entry:', error);
    }
  };

  const updateGratitude = (index, value) => {
    const newList = [...formData.gratitude_list];
    newList[index] = value;
    setFormData({ ...formData, gratitude_list: newList });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <h2>
          {entry?.id || entry?._id ? 'Edit' : 'New'} Diary Entry - {format(parseISO(formData.date), 'MMMM d, yyyy')}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>How are you feeling today?</label>
            <div className="mood-selector">
              {Object.entries(moods).map(([key, mood]) => (
                <button
                  key={key}
                  type="button"
                  className={`mood-btn ${formData.mood === key ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, mood: key })}
                  style={{ 
                    borderColor: formData.mood === key ? mood.color : 'transparent',
                    backgroundColor: formData.mood === key ? `${mood.color}20` : 'transparent'
                  }}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Title (Optional)</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your day a title..."
            />
          </div>

          <div className="form-group">
            <label>What's on your mind?</label>
            <textarea
              className="input diary-content"
              rows={10}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your thoughts, feelings, and experiences..."
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Heart /> Gratitude List
              <span className="label-subtitle">What are you grateful for today?</span>
            </label>
            {formData.gratitude_list.map((item, index) => (
              <input
                key={index}
                type="text"
                className="input gratitude-input"
                value={item}
                onChange={e => updateGratitude(index, e.target.value)}
                placeholder={`Gratitude ${index + 1}`}
              />
            ))}
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              className="input"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., work, family, health"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {entry?.id || entry?._id ? 'Update' : 'Save'} Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Diary;
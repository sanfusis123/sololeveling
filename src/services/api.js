import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => {
    // OAuth2 expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (userData) => api.post('/users/', userData),
  getCurrentUser: () => api.get('/users/me'),
  updateCurrentUser: (userData) => api.put('/users/me', userData),
  // Password change is handled through updateCurrentUser with password field
};

// Calendar services
export const calendarService = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  createEvent: (eventData) => api.post('/calendar/events', eventData),
  getEvent: (id) => api.get(`/calendar/events/${id}`),
  updateEvent: (id, eventData) => api.put(`/calendar/events/${id}`, eventData),
  completeEvent: (id, data) => api.post(`/calendar/events/${id}/complete`, data),
  skipEvent: (id, data) => api.post(`/calendar/events/${id}/skip`, data),
  deleteEvent: (id) => api.delete(`/calendar/events/${id}`),
};

// Improvement Log services
export const improvementLogService = {
  getLogs: (params) => api.get('/improvement-log', { params }),
  createLog: (logData) => api.post('/improvement-log', logData),
  getLog: (id) => api.get(`/improvement-log/${id}`),
  updateLog: (id, logData) => api.put(`/improvement-log/${id}`, logData),
  addProgressNote: (id, note) => api.post(`/improvement-log/${id}/progress`, note),
  deleteLog: (id) => api.delete(`/improvement-log/${id}`),
};

// Flashcards services
export const flashcardsService = {
  getDecks: (params) => api.get('/flashcards/decks', { params }),
  createDeck: (deckData) => api.post('/flashcards/decks', deckData),
  getDeck: (id) => api.get(`/flashcards/decks/${id}`),
  updateDeck: (id, deckData) => api.put(`/flashcards/decks/${id}`, deckData),
  deleteDeck: (id) => api.delete(`/flashcards/decks/${id}`),
  getCards: (deckId, params) => api.get(`/flashcards/decks/${deckId}/cards`, { params }),
  getDueCards: (deckId) => api.get(`/flashcards/decks/${deckId}/cards`, { params: { due_only: true } }),
  createCard: (deckId, cardData) => api.post(`/flashcards/decks/${deckId}/cards`, cardData),
  updateCard: (cardId, cardData) => api.put(`/flashcards/cards/${cardId}`, cardData),
  reviewCard: (cardId, result) => api.post(`/flashcards/cards/${cardId}/review`, result),
  deleteCard: (cardId) => api.delete(`/flashcards/cards/${cardId}`),
};

// Learning Materials services
export const learningMaterialsService = {
  getMaterials: (params) => api.get('/learning-materials/', { params }),
  createMaterial: (materialData) => api.post('/learning-materials/', materialData),
  getMaterial: (id) => api.get(`/learning-materials/${id}`),
  updateMaterial: (id, materialData) => api.put(`/learning-materials/${id}`, materialData),
  shareMaterial: (id, userIds) => api.post(`/learning-materials/${id}/share`, { user_ids: userIds }),
  archiveMaterial: (id) => api.post(`/learning-materials/${id}/archive`),
  deleteMaterial: (id) => api.delete(`/learning-materials/${id}`),
};

// Diary services
export const diaryService = {
  getEntries: (params) => api.get('/diary/entries', { params }),
  createEntry: (entryData) => api.post('/diary/entries', entryData),
  getEntryByDate: (date) => api.get(`/diary/entries/${date}`),
  updateEntry: (date, entryData) => api.put(`/diary/entries/${date}`, entryData),
  getMoodSummary: (params) => api.get('/diary/mood-summary', { params }),
  deleteEntry: (date) => api.delete(`/diary/entries/${date}`),
};

// Fun Zone services
export const funZoneService = {
  getContents: (params) => api.get('/fun-zone', { params }),
  createContent: (contentData) => api.post('/fun-zone', contentData),
  getContent: (id) => api.get(`/fun-zone/${id}`),
  updateContent: (id, contentData) => api.put(`/fun-zone/${id}`, contentData),
  likeContent: (id) => api.post(`/fun-zone/${id}/like`),
  getPopularContent: (limit) => api.get('/fun-zone/popular/week', { params: { limit } }),
  deleteContent: (id) => api.delete(`/fun-zone/${id}`),
};

// Projects services
export const projectsService = {
  getProjects: (params) => api.get('/projects', { params }),
  createProject: (projectData) => api.post('/projects', projectData),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Skills services  
export const skillsService = {
  getSkills: (params) => api.get('/skills', { params }),
  createSkill: (skillData) => api.post('/skills', skillData),
  getSkill: (id) => api.get(`/skills/${id}`),
  updateSkill: (id, skillData) => api.put(`/skills/${id}`, skillData),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
  getCategories: () => api.get('/skills/categories'),
};

// Analytics services
export const analyticsService = {
  getSkillsTimeSpent: (params) => api.get('/analytics/skills/time-spent', { params }),
  getProjectsTimeSpent: (params) => api.get('/analytics/projects/time-spent', { params }),
  getProductivityOverview: (params) => api.get('/analytics/productivity/overview', { params }),
};

// Admin services
export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  activateUser: (id) => api.put(`/admin/users/${id}/activate`),
  deactivateUser: (id) => api.put(`/admin/users/${id}/deactivate`),
  makeAdmin: (id) => api.put(`/admin/users/${id}/make-admin`),
  removeAdmin: (id) => api.put(`/admin/users/${id}/remove-admin`),
  changeUserPassword: (id, password) => api.put(`/admin/users/${id}/password`, { new_password: password }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
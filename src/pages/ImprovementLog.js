import React, { useState, useEffect } from 'react';
import { improvementLogService, projectsService, skillsService } from '../services/api';
import toast from '../utils/toast';
import Card, { CardHeader, CardTitle, CardBody, CardMeta } from '../components/Card';
import ViewModal, { ViewSection, ViewField, ViewTags } from '../components/ViewModal';
import './ImprovementLog.css';

// Simple icon components
const Target = () => <span>🎯</span>;
const Brain = () => <span>🧠</span>;
const Plus = () => <span>➕</span>;
const Edit = () => <span>✏️</span>;
// const Trash = () => <span>🗑️</span>; // Unused
const CheckCircle = () => <span>✅</span>;
const AlertCircle = () => <span>⚠️</span>;
const TrendingUp = () => <span>📈</span>;
const Folder = () => <span>📁</span>;
const Lightbulb = () => <span>💡</span>;
const Clock = () => <span>⏰</span>;
const Tag = () => <span>🏷️</span>;

const ImprovementLog = () => {
  const [activeSection, setActiveSection] = useState('logs'); // logs, projects, skills
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [logFilter, setLogFilter] = useState('all'); // all, improvement, distraction
  const [modalType, setModalType] = useState('improvement'); // for new log creation
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Apply client-side filtering when filter changes
    if (logFilter === 'all') {
      setFilteredLogs(allLogs);
    } else {
      setFilteredLogs(allLogs.filter(log => log.type === logFilter));
    }
  }, [logFilter, allLogs]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeSection) {
        case 'logs':
          await fetchLogs();
          break;
        case 'projects':
          await fetchProjects();
          break;
        case 'skills':
          await fetchSkills();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      // Fetch all logs without type filter
      const response = await improvementLogService.getLogs();
      setAllLogs(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch logs');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectsService.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await skillsService.getSkills();
      setSkills(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch skills');
    }
  };

  const handleCreate = (type = null) => {
    setSelectedItem(null);
    if (type) {
      setModalType(type);
    }
    setShowModal(true);
  };

  const handleView = (item, type) => {
    setViewItem(item);
    setViewType(type);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    setViewItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    
    try {
      switch (activeSection) {
        case 'logs':
          await improvementLogService.deleteLog(id);
          break;
        case 'projects':
          await projectsService.deleteProject(id);
          break;
        case 'skills':
          await skillsService.deleteSkill(id);
          break;
        default:
          break;
      }
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const renderSectionTabs = () => (
    <div className="section-tabs">
      <button
        className={`section-tab ${activeSection === 'logs' ? 'active' : ''}`}
        onClick={() => setActiveSection('logs')}
      >
        <Target />
        Logs & Distractions
      </button>
      <button
        className={`section-tab ${activeSection === 'projects' ? 'active' : ''}`}
        onClick={() => setActiveSection('projects')}
      >
        <Folder />
        Projects
      </button>
      <button
        className={`section-tab ${activeSection === 'skills' ? 'active' : ''}`}
        onClick={() => setActiveSection('skills')}
      >
        <Lightbulb />
        Skills
      </button>
    </div>
  );

  const renderLogFilters = () => (
    <div className="log-filters">
      <button
        className={`filter-btn ${logFilter === 'all' ? 'active' : ''}`}
        onClick={() => setLogFilter('all')}
      >
        All ({allLogs.length})
      </button>
      <button
        className={`filter-btn ${logFilter === 'improvement' ? 'active' : ''}`}
        onClick={() => setLogFilter('improvement')}
      >
        <TrendingUp />
        Improvements ({allLogs.filter(l => l.type === 'improvement').length})
      </button>
      <button
        className={`filter-btn ${logFilter === 'distraction' ? 'active' : ''}`}
        onClick={() => setLogFilter('distraction')}
      >
        <AlertCircle />
        Distractions ({allLogs.filter(l => l.type === 'distraction').length})
      </button>
    </div>
  );

  const renderLogs = () => (
    <>
      <div className="logs-header">
        {renderLogFilters()}
        <div className="logs-actions">
          <button className="btn btn-success" onClick={() => handleCreate('improvement')}>
            <Plus />
            Add Improvement
          </button>
          <button className="btn btn-warning" onClick={() => handleCreate('distraction')}>
            <Plus />
            Add Distraction
          </button>
        </div>
      </div>
      <div className="logs-grid">
        {filteredLogs.map((log) => {
          const isDistraction = log.type === 'distraction';
          return (
            <Card
              key={log.id || log._id}
              onClick={() => handleView(log, 'log')}
              gradient={isDistraction ? 'warning' : 'success'}
              icon={isDistraction ? <AlertCircle /> : <TrendingUp />}
            >
              <CardHeader>
                <CardTitle subtitle={log.created_at && new Date(log.created_at).toLocaleDateString()}>
                  {log.title}
                </CardTitle>
              </CardHeader>
              
              <CardBody>
                <p className="card-description">{log.description}</p>
              </CardBody>
              
              <CardMeta items={[
                {
                  label: `Impact: ${log.impact_level || 3}/5`,
                  type: log.impact_level >= 4 ? 'error' : log.impact_level >= 3 ? 'warning' : 'info',
                  icon: <Target />
                },
                {
                  label: log.is_resolved ? 'Resolved' : 'Active',
                  type: log.is_resolved ? 'success' : 'warning',
                  icon: <CheckCircle />
                },
                ...(log.category ? [{
                  label: log.category,
                  icon: <Tag />
                }] : []),
                ...(log.progress_notes && log.progress_notes.length > 0 ? [{
                  label: `${log.progress_notes.length} notes`,
                  icon: <Edit />
                }] : [])
              ]} />
            </Card>
          );
        })}
      </div>
    </>
  );

  const renderProjects = () => (
    <div className="projects-grid">
      {projects.map((project) => (
        <Card
          key={project.id}
          onClick={() => handleView(project, 'project')}
          gradient="primary"
          icon={<Folder />}
        >
          <CardHeader>
            <CardTitle subtitle={project.status.replace('_', ' ')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {project.color && (
                  <span 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%',
                      backgroundColor: project.color,
                      display: 'inline-block'
                    }}
                  />
                )}
                {project.name}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardBody>
            {project.description && (
              <p className="card-description">{project.description}</p>
            )}
          </CardBody>
          
          <CardMeta items={[
            ...(project.target_hours ? [{
              label: `Target: ${project.target_hours}h`,
              icon: <Clock />,
              type: 'info'
            }] : []),
            ...(project.total_hours !== undefined ? [{
              label: `${project.total_hours}h logged`,
              icon: <CheckCircle />,
              type: 'success'
            }] : []),
            ...(project.completed_tasks !== undefined ? [{
              label: `${project.completed_tasks}/${project.total_tasks || 0} tasks`,
              icon: <Target />,
              type: 'primary'
            }] : [])
          ]} />
        </Card>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="skills-grid">
      {skills.map((skill) => (
        <Card
          key={skill.id}
          onClick={() => handleView(skill, 'skill')}
          gradient="info"
          icon={<Lightbulb />}
        >
          <CardHeader>
            <CardTitle subtitle={skill.category || 'Uncategorized'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {skill.icon && <span style={{ fontSize: '1.25rem' }}>{skill.icon}</span>}
                {skill.name}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardBody>
            {skill.description && (
              <p className="card-description">{skill.description}</p>
            )}
          </CardBody>
          
          <CardMeta items={[
            ...(skill.current_level ? [{
              label: `Level: ${skill.current_level}${skill.target_level ? ` → ${skill.target_level}` : ''}`,
              icon: <TrendingUp />,
              type: 'primary'
            }] : []),
            ...(skill.total_hours !== undefined ? [{
              label: `${skill.total_hours}h practiced`,
              icon: <Clock />,
              type: 'success'
            }] : []),
            ...(skill.last_practiced ? [{
              label: `Last: ${new Date(skill.last_practiced).toLocaleDateString()}`,
              icon: <CheckCircle />,
              type: 'info'
            }] : [])
          ]} />
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="improvement-page">
        <div className="improvement-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="improvement-page">
      <div className="improvement-header">
        <h1>Progress Tracker</h1>
        {activeSection !== 'logs' && (
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus />
            {activeSection === 'projects' ? 'Add Project' : 'Add Skill'}
          </button>
        )}
      </div>

      {renderSectionTabs()}

      <div className="improvement-content">
        {activeSection === 'logs' && renderLogs()}
        {activeSection === 'projects' && renderProjects()}
        {activeSection === 'skills' && renderSkills()}
        
        {activeSection === 'logs' && filteredLogs.length === 0 && (
          <div className="empty-state">
            <Target />
            <p>No {logFilter === 'all' ? '' : logFilter} logs found</p>
            <p>
              {allLogs.length === 0 
                ? 'Start tracking your improvements and distractions!' 
                : 'Try changing the filter to see more logs'}
            </p>
          </div>
        )}
        
        {activeSection === 'projects' && projects.length === 0 && (
          <div className="empty-state">
            <Folder />
            <p>No projects yet</p>
            <p>Create your first project!</p>
          </div>
        )}
        
        {activeSection === 'skills' && skills.length === 0 && (
          <div className="empty-state">
            <Lightbulb />
            <p>No skills yet</p>
            <p>Add skills you want to track!</p>
          </div>
        )}
      </div>

      {/* Modal Components */}
      {showModal && activeSection === 'logs' && (
        <LogModal
          log={selectedItem}
          logType={selectedItem ? selectedItem.type : modalType}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchLogs();
          }}
        />
      )}

      {showModal && activeSection === 'projects' && (
        <ProjectModal
          project={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchProjects();
          }}
        />
      )}

      {showModal && activeSection === 'skills' && (
        <SkillModal
          skill={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchSkills();
          }}
        />
      )}

      {showProgressModal && (
        <ProgressModal
          log={selectedItem}
          onClose={() => setShowProgressModal(false)}
          onSave={() => {
            setShowProgressModal(false);
            fetchLogs();
          }}
        />
      )}

      {/* View Modals */}
      {viewItem && viewType === 'log' && (
        <ViewModal
          isOpen={true}
          onClose={() => setViewItem(null)}
          onEdit={() => handleEdit(viewItem)}
          onDelete={() => {
            handleDelete(viewItem.id);
            setViewItem(null);
          }}
          title={viewItem.title}
        >
          <ViewSection label="Details" icon={<Target />}>
            <ViewField label="Type" value={viewItem.type === 'distraction' ? 'Distraction' : 'Improvement'} type="highlight" />
            <ViewField label="Impact Level" value={`${viewItem.impact_level || 3}/5`} />
            <ViewField label="Status" value={viewItem.is_resolved ? 'Resolved' : 'Active'} type={viewItem.is_resolved ? 'success' : 'warning'} />
            <ViewField label="Description" value={viewItem.description} type="multiline" />
            {viewItem.category && <ViewField label="Category" value={viewItem.category} />}
            {viewItem.frequency && <ViewField label="Frequency" value={viewItem.frequency} />}
            {viewItem.trigger && <ViewField label="Trigger" value={viewItem.trigger} type="multiline" />}
            {viewItem.solution && <ViewField label="Solution" value={viewItem.solution} type="multiline" />}
          </ViewSection>
          
          {viewItem.progress_notes && viewItem.progress_notes.length > 0 && (
            <ViewSection label="Progress Notes" icon={<Edit />}>
              {viewItem.progress_notes.map((note, index) => (
                <div key={index} style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                  <ViewField label={new Date(note.timestamp).toLocaleString()} value={note.note} type="multiline" />
                </div>
              ))}
            </ViewSection>
          )}
          
          {viewItem.tags && viewItem.tags.length > 0 && (
            <ViewSection label="Tags" icon={<Tag />}>
              <ViewTags tags={viewItem.tags} />
            </ViewSection>
          )}
        </ViewModal>
      )}

      {viewItem && viewType === 'project' && (
        <ViewModal
          isOpen={true}
          onClose={() => setViewItem(null)}
          onEdit={() => handleEdit(viewItem)}
          onDelete={() => {
            handleDelete(viewItem.id);
            setViewItem(null);
          }}
          title={viewItem.name}
        >
          <ViewSection label="Project Details" icon={<Folder />}>
            <ViewField label="Status" value={viewItem.status.replace('_', ' ')} type="highlight" />
            {viewItem.description && <ViewField label="Description" value={viewItem.description} type="multiline" />}
            {viewItem.target_hours && <ViewField label="Target Hours" value={`${viewItem.target_hours} hours`} />}
            {viewItem.start_date && <ViewField label="Start Date" value={new Date(viewItem.start_date).toLocaleDateString()} />}
            {viewItem.end_date && <ViewField label="End Date" value={new Date(viewItem.end_date).toLocaleDateString()} />}
          </ViewSection>
          
          {(viewItem.total_hours !== undefined || viewItem.completed_tasks !== undefined) && (
            <ViewSection label="Progress" icon={<TrendingUp />}>
              {viewItem.total_hours !== undefined && <ViewField label="Hours Logged" value={`${viewItem.total_hours} hours`} />}
              {viewItem.completed_tasks !== undefined && <ViewField label="Tasks Completed" value={`${viewItem.completed_tasks} of ${viewItem.total_tasks || 0}`} />}
            </ViewSection>
          )}
        </ViewModal>
      )}

      {viewItem && viewType === 'skill' && (
        <ViewModal
          isOpen={true}
          onClose={() => setViewItem(null)}
          onEdit={() => handleEdit(viewItem)}
          onDelete={() => {
            handleDelete(viewItem.id);
            setViewItem(null);
          }}
          title={viewItem.name}
        >
          <ViewSection label="Skill Details" icon={<Lightbulb />}>
            {viewItem.category && <ViewField label="Category" value={viewItem.category} />}
            {viewItem.description && <ViewField label="Description" value={viewItem.description} type="multiline" />}
            {viewItem.current_level && <ViewField label="Current Level" value={viewItem.current_level} />}
            {viewItem.target_level && <ViewField label="Target Level" value={viewItem.target_level} type="highlight" />}
          </ViewSection>
          
          {(viewItem.total_hours !== undefined || viewItem.last_practiced) && (
            <ViewSection label="Practice Stats" icon={<Brain />}>
              {viewItem.total_hours !== undefined && <ViewField label="Total Practice Hours" value={`${viewItem.total_hours} hours`} />}
              {viewItem.tasks_completed !== undefined && <ViewField label="Tasks Completed" value={viewItem.tasks_completed} />}
              {viewItem.last_practiced && <ViewField label="Last Practiced" value={new Date(viewItem.last_practiced).toLocaleDateString()} />}
            </ViewSection>
          )}
        </ViewModal>
      )}
    </div>
  );
};

// Log Modal Component
const LogModal = ({ log, logType, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: log?.title || '',
    description: log?.description || '',
    type: log?.type || logType,
    category: log?.category || '',
    impact_level: log?.impact_level || 3,
    frequency: log?.frequency || '',
    trigger: log?.trigger || '',
    solution: log?.solution || '',
    tags: log?.tags || [],
    is_resolved: log?.is_resolved || false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (log?.id || log?._id) {
        const logId = log.id || log._id;
        await improvementLogService.updateLog(logId, formData);
        toast.success('Log updated successfully');
      } else {
        await improvementLogService.createLog(formData);
        toast.success('Log created successfully');
      }
      onSave();
    } catch (error) {
      console.error('Error saving log:', error);
      toast.error('Failed to save log');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{(log?.id || log?._id) ? 'Edit' : 'Create'} {logType === 'distraction' ? 'Distraction' : 'Improvement'} Log</h2>
        
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
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Impact Level</label>
              <select
                className="input"
                value={formData.impact_level}
                onChange={e => setFormData({...formData, impact_level: parseInt(e.target.value)})}
              >
                <option value="1">1 - Very Low</option>
                <option value="2">2 - Low</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - High</option>
                <option value="5">5 - Very High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                className="input"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Productivity, Health, Focus"
              />
            </div>
          </div>

          {logType === 'distraction' && (
            <>
              <div className="form-group">
                <label>Frequency</label>
                <input
                  type="text"
                  className="input"
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value})}
                  placeholder="How often does this occur?"
                />
              </div>

              <div className="form-group">
                <label>Trigger</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.trigger}
                  onChange={e => setFormData({...formData, trigger: e.target.value})}
                  placeholder="What triggers this distraction?"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Solution</label>
            <textarea
              className="input"
              rows={2}
              value={formData.solution}
              onChange={e => setFormData({...formData, solution: e.target.value})}
              placeholder="How to address this?"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_resolved}
                onChange={e => setFormData({...formData, is_resolved: e.target.checked})}
              />
              {' '}Mark as Resolved
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {(log?.id || log?._id) ? 'Update' : 'Create'} Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Project Modal Component
const ProjectModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    color: project?.color || '#673ab7',
    target_hours: project?.target_hours || '',
    start_date: project?.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
    end_date: project?.end_date ? new Date(project.end_date).toISOString().split('T')[0] : ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      target_hours: formData.target_hours ? parseFloat(formData.target_hours) : null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
    };

    try {
      if (project?.id) {
        await projectsService.updateProject(project.id, submitData);
        toast.success('Project updated successfully');
      } else {
        await projectsService.createProject(submitData);
        toast.success('Project created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{project?.id ? 'Edit' : 'Create'} Project</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
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

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                className="input color-input"
                value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Target Hours</label>
            <input
              type="number"
              className="input"
              value={formData.target_hours}
              onChange={e => setFormData({...formData, target_hours: e.target.value})}
              placeholder="e.g., 100"
              min="0"
              step="0.5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="input"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                className="input"
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {project?.id ? 'Update' : 'Create'} Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Skill Modal Component
const SkillModal = ({ skill, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    description: skill?.description || '',
    category: skill?.category || '',
    current_level: skill?.current_level || 'beginner',
    target_level: skill?.target_level || 'expert',
    color: skill?.color || '#2196f3',
    icon: skill?.icon || '💡'
  });

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const commonIcons = ['💡', '🧠', '💻', '🎨', '🎯', '📊', '🔧', '🌟', '⚡', '🚀'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (skill?.id) {
        await skillsService.updateSkill(skill.id, formData);
        toast.success('Skill updated successfully');
      } else {
        await skillsService.createSkill(formData);
        toast.success('Skill created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save skill');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{skill?.id ? 'Edit' : 'Create'} Skill</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
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
            <label>Category</label>
            <input
              type="text"
              className="input"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              placeholder="e.g., Programming, Design, Language"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Level</label>
              <select
                className="input"
                value={formData.current_level}
                onChange={e => setFormData({...formData, current_level: e.target.value})}
              >
                {skillLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Level</label>
              <select
                className="input"
                value={formData.target_level}
                onChange={e => setFormData({...formData, target_level: e.target.value})}
              >
                {skillLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                className="input color-input"
                value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Icon</label>
              <div className="icon-selector">
                {commonIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, icon})}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {skill?.id ? 'Update' : 'Create'} Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Progress Modal Component
const ProgressModal = ({ log, onClose, onSave }) => {
  const [note, setNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await improvementLogService.addProgressNote(log.id, { note });
      toast.success('Progress note added');
      onSave();
    } catch (error) {
      toast.error('Failed to add progress note');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Progress Note</h2>
        <h3>{log.title}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Progress Note</label>
            <textarea
              className="input"
              rows={4}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Describe your progress..."
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImprovementLog;
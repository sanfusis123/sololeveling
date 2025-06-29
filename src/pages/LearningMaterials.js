import React, { useState, useEffect } from 'react';
import { learningMaterialsService } from '../services/api';
import toast from '../utils/toast';
import Card, { CardHeader, CardTitle, CardBody, CardMeta } from '../components/Card';
import ViewModal, { ViewSection, ViewField, ViewTags } from '../components/ViewModal';
import './LearningMaterials.css';

// Simple icon components
const Plus = () => <span>➕</span>;
// const Edit = () => <span>✏️</span>; // Unused
// const Trash = () => <span>🗑️</span>; // Unused
const BookOpen = () => <span>📖</span>;
const FileText = () => <span>📄</span>;
// const Folder = () => <span>📁</span>; // Unused
const Search = () => <span>🔍</span>;
const Tag = () => <span>🏷️</span>;
const Clock = () => <span>🕐</span>;
const Star = () => <span>⭐</span>;
const Link = () => <span>🔗</span>;
// const ArrowRight = () => <span>➡️</span>; // Unused

const LearningMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMaterials = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await learningMaterialsService.getMaterials(params);
      setMaterials(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch materials');
      // console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Extract unique categories from materials
    // In a real app, this might be a separate API endpoint
    const uniqueCategories = [...new Set(materials.map(m => m.category).filter(Boolean))];
    setCategories(uniqueCategories);
  };

  const handleCreateMaterial = () => {
    setSelectedMaterial(null);
    setShowModal(true);
  };

  const handleViewMaterial = (material) => {
    setViewItem(material);
  };

  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setShowModal(true);
    setViewItem(null);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await learningMaterialsService.deleteMaterial(materialId);
        toast.success('Material deleted successfully');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  const filteredMaterials = materials.filter(material => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        material.title.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query) ||
        material.content?.toLowerCase().includes(query) ||
        material.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getMaterialTypeIcon = (type) => {
    switch (type) {
      case 'note':
        return <FileText />;
      case 'article':
        return <BookOpen />;
      case 'video':
        return '🎥';
      case 'course':
        return '🎓';
      default:
        return <FileText />;
    }
  };

  if (loading) {
    return (
      <div className="learning-materials-page">
        <div className="loading-state">Loading materials...</div>
      </div>
    );
  }

  return (
    <div className="learning-materials-page">
      <div className="page-header">
        <h1>Learning Materials</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⚏
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleCreateMaterial}>
            <Plus />
            Add Material
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="materials-controls">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search />
            <input
              type="text"
              className="input search-input"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="category-filter">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Materials
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Stats */}
      <div className="materials-stats">
        <div className="stat-card card">
          <div className="stat-value">{materials.length}</div>
          <div className="stat-label">Total Materials</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{categories.length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">
            {materials.filter(m => m.is_favorite).length}
          </div>
          <div className="stat-label">Favorites</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">
            {materials.filter(m => {
              const date = new Date(m.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return date > weekAgo;
            }).length}
          </div>
          <div className="stat-label">Added This Week</div>
        </div>
      </div>

      {/* Materials Grid/List */}
      <div className={`materials-container ${viewMode}`}>
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(material => {
            const typeMap = {
              'note': 'primary',
              'article': 'info',
              'video': 'warning',
              'course': 'success'
            };
            const gradient = typeMap[material.type] || 'primary';
            
            return (
              <Card
                key={material.id || material._id}
                onClick={() => handleViewMaterial(material)}
                gradient={gradient}
                icon={getMaterialTypeIcon(material.type)}
              >
                <CardHeader>
                  <CardTitle subtitle={material.category || material.type}>
                    {material.title}
                  </CardTitle>
                  {material.is_favorite && (
                    <span style={{ color: 'var(--accent-warning)', fontSize: '1.25rem' }}>
                      <Star />
                    </span>
                  )}
                </CardHeader>
                
                <CardBody>
                  {material.description && (
                    <p className="card-description">{material.description}</p>
                  )}
                  {(!material.description && material.content) && (
                    <p className="card-description">
                      {material.content.substring(0, 150)}{material.content.length > 150 ? '...' : ''}
                    </p>
                  )}
                </CardBody>
                
                <CardMeta items={[
                  ...(material.tags && material.tags.length > 0 ? [{
                    label: material.tags.slice(0, 2).join(', ') + (material.tags.length > 2 ? '...' : ''),
                    icon: <Tag />,
                    type: 'primary'
                  }] : []),
                  ...(material.source_url ? [{
                    label: 'Has source',
                    icon: <Link />,
                    type: 'info'
                  }] : []),
                  {
                    label: new Date(material.created_at).toLocaleDateString(),
                    icon: <Clock />,
                    type: 'info'
                  }
                ]} />
              </Card>
            );
          })
        ) : (
          <div className="empty-state">
            <BookOpen />
            <h3>No materials found</h3>
            <p>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start building your knowledge base by adding materials'
              }
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={handleCreateMaterial}>
                Add Your First Material
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewItem && (
        <ViewModal
          isOpen={true}
          onClose={() => setViewItem(null)}
          onEdit={() => handleEditMaterial(viewItem)}
          onDelete={() => {
            handleDeleteMaterial(viewItem.id || viewItem._id);
            setViewItem(null);
          }}
          title={viewItem.title}
        >
          <ViewSection label="Content" icon={getMaterialTypeIcon(viewItem.type)}>
            <div style={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {viewItem.content || 'No content available'}
            </div>
          </ViewSection>
          
          <ViewSection label="Details" icon={<BookOpen />}>
            <ViewField label="Type" value={viewItem.type} type="highlight" />
            {viewItem.category && <ViewField label="Category" value={viewItem.category} />}
            {viewItem.description && <ViewField label="Description" value={viewItem.description} type="multiline" />}
            {viewItem.source_url && (
              <ViewField 
                label="Source" 
                value={
                  <a href={viewItem.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                    {viewItem.source_url}
                  </a>
                } 
              />
            )}
            <ViewField label="Favorite" value={viewItem.is_favorite ? 'Yes ⭐' : 'No'} />
            {viewItem.created_at && <ViewField label="Created" value={new Date(viewItem.created_at).toLocaleString()} />}
            {viewItem.updated_at && <ViewField label="Updated" value={new Date(viewItem.updated_at).toLocaleString()} />}
          </ViewSection>
          
          {viewItem.tags && viewItem.tags.length > 0 && (
            <ViewSection label="Tags" icon={<Tag />}>
              <ViewTags tags={viewItem.tags} />
            </ViewSection>
          )}
        </ViewModal>
      )}

      {/* Material Modal */}
      {showModal && (
        <MaterialModal
          material={selectedMaterial}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchMaterials();
          }}
        />
      )}
    </div>
  );
};

// Material Modal Component
const MaterialModal = ({ material, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: material?.title || '',
    description: material?.description || '',
    content: material?.content || '',
    type: material?.type || 'note',
    category: material?.category || '',
    source_url: material?.source_url || '',
    tags: material?.tags?.join(', ') || '',
    is_favorite: material?.is_favorite || false
  });

  const [isPreview, setIsPreview] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const materialData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    try {
      if (material?.id || material?._id) {
        await learningMaterialsService.updateMaterial(material.id || material._id, materialData);
        toast.success('Material updated successfully');
      } else {
        await learningMaterialsService.createMaterial(materialData);
        toast.success('Material created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save material');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{material ? 'Edit Material' : 'Create Material'}</h2>
          <div className="modal-header-actions">
            <button
              type="button"
              className={`btn btn-secondary ${isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
        
        {!isPreview ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group" style={{flex: 2}}>
                <label>Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Material title"
                  required
                />
              </div>

              <div className="form-group" style={{flex: 1}}>
                <label>Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="note">Note</option>
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="course">Course</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="input"
                rows={2}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the material"
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                className="input content-textarea"
                rows={10}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="Main content of your material (supports markdown)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  className="input"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Programming, Design, Business"
                />
              </div>

              <div className="form-group">
                <label>Source URL</label>
                <input
                  type="url"
                  className="input"
                  value={formData.source_url}
                  onChange={e => setFormData({...formData, source_url: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                className="input"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="e.g., javascript, tutorial, beginner"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_favorite}
                  onChange={e => setFormData({...formData, is_favorite: e.target.checked})}
                />
                <span>Mark as favorite</span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {material ? 'Update' : 'Create'} Material
              </button>
            </div>
          </form>
        ) : (
          <div className="material-preview">
            <h2>{formData.title}</h2>
            {formData.description && (
              <p className="preview-description">{formData.description}</p>
            )}
            <div className="preview-meta">
              <span>{formData.type}</span>
              {formData.category && <span>• {formData.category}</span>}
              {formData.is_favorite && <span>• <Star /> Favorite</span>}
            </div>
            <div className="preview-content">
              {formData.content || 'No content'}
            </div>
            {formData.tags && (
              <div className="preview-tags">
                {formData.tags.split(',').map(tag => (
                  <span key={tag.trim()} className="tag">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningMaterials;
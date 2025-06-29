import React, { useState, useEffect } from 'react';
import { funZoneService } from '../services/api';
import toast from '../utils/toast';
import Card, { CardHeader, CardTitle, CardBody, CardMeta } from '../components/Card';
import ViewModal, { ViewSection, ViewField, ViewTags } from '../components/ViewModal';
import './FunZone.css';

// Simple icon components
const Plus = () => <span>➕</span>;
// const Edit = () => <span>✏️</span>; // Unused
// const Trash = () => <span>🗑️</span>; // Unused
const Heart = () => <span>❤️</span>;
const HeartFilled = () => <span>💖</span>;
// const Share = () => <span>🔗</span>; // Unused
const Sparkles = () => <span>✨</span>;
const Palette = () => <span>🎨</span>;
// const Music = () => <span>🎵</span>; // Unused
const Pen = () => <span>✒️</span>;
// const Camera = () => <span>📷</span>; // Unused
const Laugh = () => <span>😂</span>;
const Book = () => <span>📚</span>;
const Star = () => <span>⭐</span>;
// const Filter = () => <span>🔧</span>; // Unused
const Clock = () => <span>⏰</span>;
const Tag = () => <span>🏷️</span>;
const Eye = () => <span>👁️</span>;

// Content type icons
const contentTypeIcons = {
  poem: { icon: <Pen />, label: 'Poem', color: 'var(--accent-primary)' },
  joke: { icon: <Laugh />, label: 'Joke', color: 'var(--accent-warning)' },
  art: { icon: <Palette />, label: 'Art', color: 'var(--accent-success)' },
  story: { icon: <Book />, label: 'Story', color: 'var(--accent-info)' },
  quote: { icon: <Sparkles />, label: 'Quote', color: 'var(--accent-error)' },
  other: { icon: <Star />, label: 'Other', color: 'var(--text-secondary)' }
};

const FunZone = () => {
  const [contents, setContents] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [likedItems, setLikedItems] = useState(new Set());
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchContents();
  }, [selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContents = async () => {
    try {
      const params = selectedType !== 'all' ? { content_type: selectedType } : {};
      const response = await funZoneService.getContents(params);
      const contents = response.data || [];
      // Log any content without likes field
      contents.forEach(content => {
        if (content.likes === undefined) {
          // console.warn('Content missing likes field:', content.id || content._id, content);
        }
      });
      setContents(contents);
      
      // Load liked items from localStorage
      const storedLikes = localStorage.getItem('funzone_likes');
      if (storedLikes) {
        setLikedItems(new Set(JSON.parse(storedLikes)));
      }
    } catch (error) {
      toast.error('Failed to fetch contents');
      // console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    setSelectedContent(null);
    setShowModal(true);
  };

  const handleViewContent = (content) => {
    setViewItem(content);
  };

  const handleEditContent = (content) => {
    setSelectedContent(content);
    setShowModal(true);
    setViewItem(null);
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await funZoneService.deleteContent(contentId);
        toast.success('Content deleted successfully');
        fetchContents();
      } catch (error) {
        toast.error('Failed to delete content');
      }
    }
  };

  const handleLikeContent = async (contentId) => {
    try {
      // Update likes count on server
      const response = await funZoneService.likeContent(contentId);
      
      // Update local state
      const newLikedItems = new Set(likedItems);
      if (response.data.liked) {
        newLikedItems.add(contentId);
      } else {
        newLikedItems.delete(contentId);
      }
      setLikedItems(newLikedItems);
      localStorage.setItem('funzone_likes', JSON.stringify([...newLikedItems]));
      
      // Update content list with new like count
      setContents(prevContents => 
        prevContents.map(content => 
          (content.id === contentId || content._id === contentId)
            ? { ...content, likes: response.data.likes }
            : content
        )
      );
      
      // Update viewItem if it's being viewed
      if (viewItem && (viewItem.id === contentId || viewItem._id === contentId)) {
        setViewItem(prev => ({ ...prev, likes: response.data.likes }));
      }
      
      toast.success(response.data.liked ? 'Content liked!' : 'Like removed');
    } catch (error) {
      // console.error('Error liking content:', error);
      toast.error('Failed to update like');
    }
  };

  const getContentStats = () => {
    const stats = {
      total: contents.length,
      byType: {}
    };
    
    Object.keys(contentTypeIcons).forEach(type => {
      stats.byType[type] = contents.filter(c => c.content_type === type).length;
    });
    
    return stats;
  };

  if (loading) {
    return (
      <div className="fun-zone-page">
        <div className="loading-state">Loading creative contents...</div>
      </div>
    );
  }

  return (
    <div className="fun-zone-page">
      <div className="page-header">
        <div>
          <h1>Fun Zone</h1>
          <p className="page-subtitle">Share your creative side with the world!</p>
        </div>
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
          <button className="btn btn-primary" onClick={handleCreateContent}>
            <Plus />
            Create Content
          </button>
        </div>
      </div>

      {/* Content Type Filter */}
      <div className="content-filter">
        <button
          className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedType('all')}
        >
          <Sparkles /> All Types
        </button>
        {Object.entries(contentTypeIcons).map(([type, info]) => (
          <button
            key={type}
            className={`filter-btn ${selectedType === type ? 'active' : ''}`}
            onClick={() => setSelectedType(type)}
            style={{ color: selectedType === type ? info.color : undefined }}
          >
            {info.icon} {info.label}
          </button>
        ))}
      </div>

      {/* Content Stats */}
      <div className="content-stats">
        <div className="stat-card card">
          <div className="stat-icon"><Sparkles /></div>
          <div className="stat-value">{getContentStats().total}</div>
          <div className="stat-label">Total Creations</div>
        </div>
        {Object.entries(contentTypeIcons).slice(0, 4).map(([type, info]) => (
          <div key={type} className="stat-card card">
            <div className="stat-icon" style={{ color: info.color }}>{info.icon}</div>
            <div className="stat-value">{getContentStats().byType[type] || 0}</div>
            <div className="stat-label">{info.label}s</div>
          </div>
        ))}
      </div>

      {/* Contents Grid/List */}
      <div className={`contents-container ${viewMode}`}>
        {contents.length > 0 ? (
          contents.map(content => {
            const contentType = content.content_type || content.type || 'other';
            const typeInfo = contentTypeIcons[contentType] || contentTypeIcons.other;
            
            return (
              <Card
                key={content.id || content._id}
                onClick={() => handleViewContent(content)}
                gradient={contentType === 'quote' ? 'danger' : contentType === 'joke' ? 'warning' : contentType === 'poem' ? 'primary' : 'info'}
                icon={typeInfo.icon}
              >
                <CardHeader>
                  <CardTitle subtitle={typeInfo.label}>
                    {content.title}
                  </CardTitle>
                </CardHeader>
                
                <CardBody>
                  {contentType === 'joke' ? (
                    <div className="content-preview">
                      <p>{content.content}</p>
                      {content.metadata?.punchline && (
                        <p className="joke-punchline-preview">
                          <Laugh /> {content.metadata.punchline.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  ) : contentType === 'quote' ? (
                    <blockquote className="quote-preview">
                      "{content.content.substring(0, 100)}{content.content.length > 100 ? '...' : ''}"
                      {content.metadata?.author && (
                        <cite>— {content.metadata.author}</cite>
                      )}
                    </blockquote>
                  ) : (
                    <p className="content-preview">
                      {content.content.substring(0, 150)}{content.content.length > 150 ? '...' : ''}
                    </p>
                  )}
                </CardBody>
                
                <CardMeta items={[
                  ...(content.category ? [{
                    label: content.category,
                    icon: <Tag />,
                    type: 'primary'
                  }] : []),
                  {
                    label: `${content.likes !== undefined ? content.likes : 0} likes`,
                    icon: likedItems.has(content.id || content._id) ? <HeartFilled /> : <Heart />,
                    type: likedItems.has(content.id || content._id) ? 'danger' : undefined,
                    onClick: (e) => {
                      e.stopPropagation();
                      handleLikeContent(content.id || content._id);
                    }
                  },
                  ...(content.views !== undefined ? [{
                    label: `${content.views} views`,
                    icon: <Eye />,
                    type: 'info'
                  }] : []),
                  ...(content.created_at ? [{
                    label: new Date(content.created_at).toLocaleDateString(),
                    icon: <Clock />,
                    type: 'info'
                  }] : [])
                ]} />
              </Card>
            );
          })
        ) : (
          <div className="empty-state">
            <Palette />
            <h3>No creative content yet</h3>
            <p>Be the first to share something amazing!</p>
            <button className="btn btn-primary" onClick={handleCreateContent}>
              Share Your Creativity
            </button>
          </div>
        )}
      </div>

      {/* Content Modal */}
      {showModal && (
        <ContentModal
          content={selectedContent}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchContents();
          }}
        />
      )}

      {/* View Modal */}
      {viewItem && (
        <ViewModal
          isOpen={true}
          onClose={() => setViewItem(null)}
          onEdit={() => handleEditContent(viewItem)}
          onDelete={() => {
            handleDeleteContent(viewItem.id || viewItem._id);
            setViewItem(null);
          }}
          title={viewItem.title}
          customActions={
            <button 
              className={`btn ${likedItems.has(viewItem.id || viewItem._id) ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => handleLikeContent(viewItem.id || viewItem._id)}
            >
              {likedItems.has(viewItem.id || viewItem._id) ? <HeartFilled /> : <Heart />}
              {likedItems.has(viewItem.id || viewItem._id) ? 'Liked' : 'Like'}
            </button>
          }
        >
          <ViewSection label="Content" icon={contentTypeIcons[viewItem.content_type || viewItem.type || 'other']?.icon}>
            {(viewItem.content_type || viewItem.type) === 'joke' ? (
              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '12px' }}>{viewItem.content}</p>
                {viewItem.metadata?.punchline && (
                  <p style={{ fontSize: '1rem', color: 'var(--accent-warning)', fontStyle: 'italic' }}>
                    <Laugh /> {viewItem.metadata.punchline}
                  </p>
                )}
              </div>
            ) : (viewItem.content_type || viewItem.type) === 'poem' ? (
              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontStyle: 'italic' }}>
                {viewItem.content.split('\n').map((line, i) => (
                  <div key={i} style={{ margin: '4px 0' }}>{line || '\u00A0'}</div>
                ))}
              </div>
            ) : (viewItem.content_type || viewItem.type) === 'quote' ? (
              <blockquote style={{ 
                fontSize: '1.25rem', 
                fontStyle: 'italic', 
                padding: '20px',
                borderLeft: '4px solid var(--accent-primary)',
                margin: '0',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)'
              }}>
                "{viewItem.content}"
                {viewItem.metadata?.author && (
                  <footer style={{ marginTop: '12px', fontSize: '1rem', fontStyle: 'normal', color: 'var(--text-secondary)' }}>
                    — {viewItem.metadata.author}
                  </footer>
                )}
              </blockquote>
            ) : (
              <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap' }}>
                {viewItem.content}
              </div>
            )}
          </ViewSection>
          
          <ViewSection label="Details" icon={<Star />}>
            <ViewField label="Type" value={contentTypeIcons[viewItem.content_type || viewItem.type || 'other']?.label || 'Other'} type="highlight" />
            {viewItem.category && <ViewField label="Category" value={viewItem.category} />}
            <ViewField label="Visibility" value={viewItem.is_public ? 'Public' : 'Private'} />
            <ViewField label="Likes" value={viewItem.likes !== undefined ? viewItem.likes : 0} />
            {viewItem.views !== undefined && <ViewField label="Views" value={viewItem.views} />}
            {viewItem.created_at && <ViewField label="Created" value={new Date(viewItem.created_at).toLocaleString()} />}
          </ViewSection>
          
          {viewItem.tags && viewItem.tags.length > 0 && (
            <ViewSection label="Tags" icon={<Tag />}>
              <ViewTags tags={viewItem.tags} />
            </ViewSection>
          )}
          
          {viewItem.metadata && Object.keys(viewItem.metadata).length > 0 && (
            <ViewSection label="Additional Info" icon={<Sparkles />}>
              {Object.entries(viewItem.metadata).map(([key, value]) => (
                key !== 'punchline' && key !== 'author' && (
                  <ViewField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={value} />
                )
              ))}
            </ViewSection>
          )}
        </ViewModal>
      )}
    </div>
  );
};

// Content Modal Component
const ContentModal = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    content: content?.content || '',
    content_type: content?.content_type || 'other',
    tags: content?.tags?.join(', ') || '',
    is_public: content?.is_public ?? true,
    metadata: content?.metadata || {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const contentData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    try {
      if (content?.id || content?._id) {
        await funZoneService.updateContent(content.id || content._id, contentData);
        toast.success('Content updated successfully');
      } else {
        await funZoneService.createContent(contentData);
        toast.success('Content created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <h2>{content ? 'Edit' : 'Create'} Creative Content</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{flex: 2}}>
              <label>Title</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Give your creation a title"
                required
              />
            </div>

            <div className="form-group" style={{flex: 1}}>
              <label>Type</label>
              <select
                className="input"
                value={formData.content_type}
                onChange={e => setFormData({...formData, content_type: e.target.value})}
              >
                {Object.entries(contentTypeIcons).map(([type, info]) => (
                  <option key={type} value={type}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              className="input content-textarea"
              rows={formData.content_type === 'poem' ? 12 : 8}
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder={
                formData.content_type === 'poem' ? 'Write your poem here...' :
                formData.content_type === 'joke' ? 'Write the setup of your joke...' :
                formData.content_type === 'quote' ? 'Enter the quote...' :
                formData.content_type === 'story' ? 'Tell your story...' :
                'Share your creative content...'
              }
              required
            />
          </div>

          {formData.content_type === 'joke' && (
            <div className="form-group">
              <label>Punchline</label>
              <input
                type="text"
                className="input"
                value={formData.metadata.punchline || ''}
                onChange={e => setFormData({
                  ...formData, 
                  metadata: {...formData.metadata, punchline: e.target.value}
                })}
                placeholder="The funny part!"
              />
            </div>
          )}

          {formData.content_type === 'quote' && (
            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                className="input"
                value={formData.metadata.author || ''}
                onChange={e => setFormData({
                  ...formData, 
                  metadata: {...formData.metadata, author: e.target.value}
                })}
                placeholder="Who said this?"
              />
            </div>
          )}

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              className="input"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="e.g., funny, inspirational, original"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={e => setFormData({...formData, is_public: e.target.checked})}
              />
              <span>Make this public</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {content ? 'Update' : 'Create'} Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FunZone;
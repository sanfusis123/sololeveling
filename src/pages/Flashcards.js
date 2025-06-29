import React, { useState, useEffect } from 'react';
import { flashcardsService } from '../services/api';
import toast from '../utils/toast';
import Card, { CardHeader, CardTitle, CardBody, CardMeta } from '../components/Card';
import ViewModal, { ViewSection, ViewField, ViewTags } from '../components/ViewModal';
import './Flashcards.css';

// Simple icon components
const Plus = () => <span>➕</span>;
const Edit = () => <span>✏️</span>;
// const Trash = () => <span>🗑️</span>; // Unused
const BookOpen = () => <span>📖</span>;
const Brain = () => <span>🧠</span>;
// const ChevronLeft = () => <span>◀</span>; // Unused
// const ChevronRight = () => <span>▶</span>; // Unused
const Eye = () => <span>👁️</span>;
// const EyeOff = () => <span>🙈</span>; // Unused
const CheckCircle = () => <span>✅</span>;
// const XCircle = () => <span>❌</span>; // Unused
const RefreshCw = () => <span>🔄</span>;
const Target = () => <span>🎯</span>;
const Clock = () => <span>⏰</span>;
const Tag = () => <span>🏷️</span>;

const Flashcards = () => {
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState(null);
  const [dueCards, setDueCards] = useState([]);

  useEffect(() => {
    fetchDecks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedDeck) {
      fetchCards();
      fetchDueCards();
    }
  }, [selectedDeck]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDecks = async () => {
    try {
      const response = await flashcardsService.getDecks();
      
      // Normalize deck IDs to ensure consistency
      const normalizedDecks = (response.data || []).map(deck => {
        // Use 'id' field directly from backend response
        return deck;
      });
      
      setDecks(normalizedDecks);
      
      // If no deck is selected and we have decks, select the first one
      if (!selectedDeck && normalizedDecks.length > 0) {
        setSelectedDeck(normalizedDecks[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch decks');
      // console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    if (!selectedDeck || !selectedDeck.id) {
      // console.warn('No valid deck selected for fetching cards');
      return;
    }
    try {
      const response = await flashcardsService.getCards(selectedDeck.id);
      setCards(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch cards');
      // console.error('Error fetching cards:', error);
    }
  };

  const fetchDueCards = async () => {
    if (!selectedDeck || !selectedDeck.id) {
      // console.warn('No valid deck selected for fetching due cards');
      return;
    }
    try {
      const response = await flashcardsService.getDueCards(selectedDeck.id);
      setDueCards(response.data || []);
    } catch (error) {
      // console.error('Error fetching due cards:', error);
    }
  };

  const handleCreateDeck = () => {
    setSelectedDeck(null);
    setShowDeckModal(true);
  };

  const handleViewItem = (item, type) => {
    setViewItem(item);
    setViewType(type);
  };

  const handleEditDeck = (deck) => {
    setSelectedDeck(deck);
    setShowDeckModal(true);
    setViewItem(null);
  };

  const handleDeleteDeck = async (deckId) => {
    if (!deckId) {
      // console.error('No deck ID provided for deletion');
      return;
    }
    if (window.confirm('Are you sure you want to delete this deck? All cards will be deleted.')) {
      try {
        await flashcardsService.deleteDeck(deckId);
        toast.success('Deck deleted successfully');
        setSelectedDeck(null);
        fetchDecks();
      } catch (error) {
        toast.error('Failed to delete deck');
        // console.error('Error deleting deck:', error);
      }
    }
  };

  const handleCreateCard = () => {
    if (!selectedDeck || !selectedDeck.id) {
      toast.error('Please select a deck first');
      return;
    }
    setSelectedCard(null);
    setShowCardModal(true);
  };

  // const handleEditCard = (card) => {
  //   setSelectedCard(card);
  //   setShowCardModal(true);
  // }; // Unused

  const handleDeleteCard = async (cardId) => {
    if (!cardId) {
      // console.error('No card ID provided for deletion');
      return;
    }
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await flashcardsService.deleteCard(cardId);
        toast.success('Card deleted successfully');
        fetchCards();
        fetchDueCards();
      } catch (error) {
        toast.error('Failed to delete card');
        // console.error('Error deleting card:', error);
      }
    }
  };

  const startStudySession = () => {
    if (dueCards.length > 0) {
      setStudyMode(true);
      setCurrentCardIndex(0);
      setShowAnswer(false);
    } else {
      toast.info('No cards due for review!');
    }
  };

  const handleReviewCard = async (difficulty) => {
    try {
      const currentCard = dueCards[currentCardIndex];
      const cardId = currentCard.id || currentCard._id;
      if (!cardId) {
        // console.error('No card ID found for review');
        return;
      }
      
      // Map string difficulty to numeric value expected by backend
      const difficultyMap = {
        'again': 1,
        'hard': 2,
        'good': 3,
        'easy': 5
      };
      
      await flashcardsService.reviewCard(cardId, { difficulty: difficultyMap[difficulty] });
      
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        toast.success('Study session completed!');
        setStudyMode(false);
        fetchCards();
        fetchDueCards();
      }
    } catch (error) {
      toast.error('Failed to review card');
      // console.error('Error reviewing card:', error);
    }
  };

  const getDifficultyInfo = (difficulty) => {
    const info = {
      again: { label: 'Again', color: 'var(--accent-error)' },
      hard: { label: 'Hard', color: 'var(--accent-warning)' },
      good: { label: 'Good', color: 'var(--accent-success)' },
      easy: { label: 'Easy', color: 'var(--accent-info)' }
    };
    return info[difficulty] || info.good;
  };

  if (loading) {
    return (
      <div className="flashcards-page">
        <div className="loading-state">Loading flashcards...</div>
      </div>
    );
  }

  // Study Mode View
  if (studyMode && dueCards.length > 0) {
    const currentCard = dueCards[currentCardIndex];
    
    return (
      <div className="flashcards-page study-mode">
        <div className="study-header">
          <h2>Study Session</h2>
          <div className="study-progress">
            Card {currentCardIndex + 1} of {dueCards.length}
          </div>
          <button className="btn btn-secondary" onClick={() => setStudyMode(false)}>
            Exit Study
          </button>
        </div>

        <div className="study-card-container">
          <div className={`study-card ${showAnswer ? 'flipped' : ''}`}>
            <div className="card-side card-front">
              <h3>Question</h3>
              <div className="card-content">{currentCard.front}</div>
              {currentCard.hint && (
                <div className="card-hint">
                  <strong>Hint:</strong> {currentCard.hint}
                </div>
              )}
            </div>

            {showAnswer && (
              <div className="card-side card-back">
                <h3>Answer</h3>
                <div className="card-content">{currentCard.back}</div>
              </div>
            )}
          </div>

          {!showAnswer ? (
            <button className="btn btn-primary btn-large" onClick={() => setShowAnswer(true)}>
              <Eye />
              Show Answer
            </button>
          ) : (
            <div className="review-buttons">
              <button 
                className="btn review-btn"
                style={{ backgroundColor: getDifficultyInfo('again').color }}
                onClick={() => handleReviewCard('again')}
              >
                <RefreshCw />
                Again
              </button>
              <button 
                className="btn review-btn"
                style={{ backgroundColor: getDifficultyInfo('hard').color }}
                onClick={() => handleReviewCard('hard')}
              >
                Hard
              </button>
              <button 
                className="btn review-btn"
                style={{ backgroundColor: getDifficultyInfo('good').color }}
                onClick={() => handleReviewCard('good')}
              >
                Good
              </button>
              <button 
                className="btn review-btn"
                style={{ backgroundColor: getDifficultyInfo('easy').color }}
                onClick={() => handleReviewCard('easy')}
              >
                Easy
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main View
  return (
    <div className="flashcards-page">
      <div className="page-header">
        <h1>Flashcards</h1>
        <button className="btn btn-primary" onClick={handleCreateDeck}>
          <Plus />
          Create Deck
        </button>
      </div>

      {/* Decks List Section */}
      <div className="decks-section">
        <h2 className="section-title">My Decks</h2>
        {decks.length > 0 ? (
          <div className="decks-list-wrapper">
            <div className="decks-horizontal-list">
              {decks.map((deck, index) => (
              <div 
                key={deck.id || `deck-${index}`}
                className={`deck-item-horizontal ${selectedDeck && selectedDeck.id === deck.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDeck(deck);
                  setViewItem(null);
                }}
              >
                <div className="deck-item-icon">
                  <BookOpen />
                </div>
                <div className="deck-item-content">
                  <h4>{deck.name}</h4>
                  <p>{deck.card_count || 0} cards</p>
                </div>
                <div className="deck-item-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewItem(deck, 'deck');
                    }}
                    title="View details"
                  >
                    <Eye />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDeck(deck);
                    }}
                    title="Edit"
                  >
                    <Edit />
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen />
            <p>No decks created yet</p>
            <button className="btn btn-primary" onClick={handleCreateDeck}>
              Create Your First Deck
            </button>
          </div>
        )}
      </div>

      {/* Cards Content Section */}
      <div className="cards-section">
        {selectedDeck ? (
            <>
              <div className="deck-header">
                <div>
                  <h2>{selectedDeck.name}</h2>
                  <p>{selectedDeck.description}</p>
                </div>
                <div className="deck-header-actions">
                  {dueCards.length > 0 && (
                    <button className="btn btn-success" onClick={startStudySession}>
                      <Brain />
                      Study Now ({dueCards.length} due)
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={handleCreateCard}>
                    <Plus />
                    Add Card
                  </button>
                </div>
              </div>

              {/* Deck Statistics */}
              <div className="deck-stats-grid">
                <div className="stat-card card">
                  <div className="stat-value">{cards.length}</div>
                  <div className="stat-label">Total Cards</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-value">{dueCards.length}</div>
                  <div className="stat-label">Due for Review</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-value">
                    {cards.filter(c => c.times_reviewed > 0).length}
                  </div>
                  <div className="stat-label">Cards Studied</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-value">
                    {cards.reduce((acc, c) => acc + (c.times_reviewed || 0), 0)}
                  </div>
                  <div className="stat-label">Total Reviews</div>
                </div>
              </div>

              {/* Cards List */}
              <div className="cards-section">
                <h3>Cards in this deck</h3>
                <div className="cards-grid">
                  {cards.length > 0 ? (
                    cards.map((card, index) => (
                      <Card
                        key={card.id || card._id || `card-${index}`}
                        onClick={() => handleViewItem(card, 'card')}
                        gradient="info"
                        icon={<Brain />}
                      >
                        <CardHeader>
                          <CardTitle subtitle="Question">
                            {card.front}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardBody>
                          <p className="card-answer-preview">{card.back}</p>
                        </CardBody>
                        
                        <CardMeta items={[
                          {
                            label: `Reviewed ${card.times_reviewed || 0}x`,
                            icon: <CheckCircle />,
                            type: 'success'
                          },
                          ...(card.next_review ? [{
                            label: `Due: ${new Date(card.next_review).toLocaleDateString()}`,
                            icon: <Clock />,
                            type: 'warning'
                          }] : []),
                          ...(card.hint ? [{
                            label: 'Has hint',
                            icon: <Eye />,
                            type: 'info'
                          }] : [])
                        ]} />
                      </Card>
                    ))
                  ) : (
                    <div className="empty-state">
                      <Target />
                      <h3>No cards in this deck</h3>
                      <p>Add cards to start studying</p>
                      <button className="btn btn-primary" onClick={handleCreateCard}>
                        Add Your First Card
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <BookOpen />
              <h2>Select a deck to view cards</h2>
              <p>Choose a deck from above or create a new one</p>
            </div>
          )}
        </div>

      {/* Deck Modal */}
      {showDeckModal && (
        <DeckModal
          deck={selectedDeck}
          onClose={() => setShowDeckModal(false)}
          onSave={() => {
            setShowDeckModal(false);
            fetchDecks();
          }}
        />
      )}

      {/* Card Modal */}
      {showCardModal && (
        <CardModal
          card={selectedCard}
          deckId={selectedDeck?.id}
          onClose={() => setShowCardModal(false)}
          onSave={() => {
            setShowCardModal(false);
            fetchCards();
            fetchDueCards();
          }}
        />
      )}

      {/* View Modals */}
      {viewItem && viewType === 'deck' && (
        <ViewModal
          isOpen={true}
          onClose={() => {
            setViewItem(null);
            setSelectedDeck(viewItem);
          }}
          onEdit={() => handleEditDeck(viewItem)}
          onDelete={() => {
            handleDeleteDeck(viewItem.id);
            setViewItem(null);
          }}
          title={viewItem.name}
        >
          <ViewSection label="Deck Details" icon={<BookOpen />}>
            {viewItem.description && <ViewField label="Description" value={viewItem.description} type="multiline" />}
            <ViewField label="Total Cards" value={viewItem.card_count || 0} />
            {viewItem.created_at && <ViewField label="Created" value={new Date(viewItem.created_at).toLocaleDateString()} />}
          </ViewSection>
          
          <ViewSection label="Actions" icon={<Target />}>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDeck(viewItem);
                  setViewItem(null);
                }}
              >
                <Eye />
                View Cards
              </button>
              {viewItem.card_count > 0 && (
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    setSelectedDeck(viewItem);
                    setViewItem(null);
                    // Will trigger study mode after cards load
                  }}
                >
                  <Brain />
                  Study Deck
                </button>
              )}
            </div>
          </ViewSection>
        </ViewModal>
      )}

      {viewItem && viewType === 'card' && (
        <ViewModal
          isOpen={true}
          onClose={() => setViewItem(null)}
          onEdit={() => {
            setSelectedCard(viewItem);
            setShowCardModal(true);
            setViewItem(null);
          }}
          onDelete={() => {
            handleDeleteCard(viewItem.id || viewItem._id);
            setViewItem(null);
          }}
          title="Flashcard"
        >
          <ViewSection label="Question" icon={<Brain />}>
            <div style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500',
              color: 'var(--text-primary)',
              padding: '12px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)'
            }}>
              {viewItem.front}
            </div>
          </ViewSection>
          
          <ViewSection label="Answer" icon={<CheckCircle />}>
            <div style={{ 
              fontSize: '1rem',
              color: 'var(--text-primary)',
              padding: '12px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)'
            }}>
              {viewItem.back}
            </div>
          </ViewSection>
          
          {viewItem.hint && (
            <ViewSection label="Hint" icon={<Eye />}>
              <ViewField value={viewItem.hint} type="multiline" />
            </ViewSection>
          )}
          
          <ViewSection label="Study Stats" icon={<Target />}>
            <ViewField label="Times Reviewed" value={viewItem.times_reviewed || 0} />
            <ViewField label="Ease Factor" value={viewItem.ease_factor || 2.5} />
            {viewItem.next_review && <ViewField label="Next Review" value={new Date(viewItem.next_review).toLocaleDateString()} type="highlight" />}
            {viewItem.last_reviewed && <ViewField label="Last Reviewed" value={new Date(viewItem.last_reviewed).toLocaleDateString()} />}
          </ViewSection>
          
          {viewItem.tags && viewItem.tags.length > 0 && (
            <ViewSection label="Tags" icon={<Tag />}>
              <ViewTags tags={viewItem.tags} />
            </ViewSection>
          )}
        </ViewModal>
      )}
    </div>
  );
};

// Deck Modal Component
const DeckModal = ({ deck, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: deck?.name || '',
    description: deck?.description || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (deck?.id || deck?._id) {
        await flashcardsService.updateDeck(deck.id || deck._id, formData);
        toast.success('Deck updated successfully');
      } else {
        await flashcardsService.createDeck(formData);
        toast.success('Deck created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save deck');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
        <h2>{deck ? 'Edit Deck' : 'Create Deck'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deck Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Spanish Vocabulary"
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
              placeholder="What will you learn in this deck?"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {deck ? 'Update' : 'Create'} Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Card Modal Component
const CardModal = ({ card, deckId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    deck_id: deckId || '',
    front: card?.front || '',
    back: card?.back || '',
    hint: card?.hint || '',
    tags: card?.tags?.join(', ') || ''
  });

  // Early return without side effects in render
  if (!deckId && !card) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cardData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    try {
      if (card?.id || card?._id) {
        const cardId = card.id || card._id;
        await flashcardsService.updateCard(cardId, cardData);
        toast.success('Card updated successfully');
      } else {
        await flashcardsService.createCard(deckId, cardData);
        toast.success('Card created successfully');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save card');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{card ? 'Edit Card' : 'Create Card'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Front (Question)</label>
            <textarea
              className="input"
              rows={3}
              value={formData.front}
              onChange={e => setFormData({...formData, front: e.target.value})}
              placeholder="Enter the question or prompt"
              required
            />
          </div>

          <div className="form-group">
            <label>Back (Answer)</label>
            <textarea
              className="input"
              rows={3}
              value={formData.back}
              onChange={e => setFormData({...formData, back: e.target.value})}
              placeholder="Enter the answer"
              required
            />
          </div>

          <div className="form-group">
            <label>Hint (Optional)</label>
            <input
              type="text"
              className="input"
              value={formData.hint}
              onChange={e => setFormData({...formData, hint: e.target.value})}
              placeholder="A helpful hint"
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              className="input"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="e.g., verbs, chapter-1, important"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {card ? 'Update' : 'Create'} Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Flashcards;
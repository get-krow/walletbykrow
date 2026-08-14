import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SortFilter } from './components/SortFilter';
import { CardList } from './components/CardList';
import { BarcodeModal } from './components/BarcodeModal';
import { AddCardModal } from './components/AddCardModal';
import { LiquidGlassNav } from './components/LiquidGlassNav';
import { loadCards, saveCard, incrementCardView, deleteCard } from './utils/storage';

export function App() {
  const [cards, setCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('recently');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cards');

  // Load initial cards from storage on mount
  useEffect(() => {
    const loaded = loadCards();
    setCards(loaded);
  }, []);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let result = [...cards];

    // Search filter by keyword/name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(card => 
        card.name.toLowerCase().includes(q) || 
        (card.codeNumber && card.codeNumber.toLowerCase().includes(q))
      );
    }

    // Sort mode
    result.sort((a, b) => {
      if (sortMode === 'recently') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortMode === 'mostViewed') {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortMode === 'az') {
        return a.name.localeCompare(b.name);
      }
      if (sortMode === 'za') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [cards, searchQuery, sortMode]);

  // Handle card selection & increment view counter
  const handleSelectCard = (card) => {
    setSelectedCard(card);
    const updated = incrementCardView(card.id);
    setCards(updated);
  };

  // Handle adding new card
  const handleSaveCard = (cardData) => {
    const newCard = saveCard(cardData);
    setCards(prev => [newCard, ...prev]);
    setSortMode('recently');
    setSearchQuery('');
    setIsAddModalOpen(false);
    setActiveTab('cards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle deleting card
  const handleDeleteCard = (cardId) => {
    const updated = deleteCard(cardId);
    setCards(updated);
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top App Header */}
      <Header />

      {/* Main Container - Centered on desktop, phone-first max-width */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-28 space-y-4">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Sort & Filter Controls */}
        <SortFilter
          activeSort={sortMode}
          onSelectSort={setSortMode}
          cardCount={filteredAndSortedCards.length}
        />

        {/* Cards List / Empty State */}
        <CardList
          cards={filteredAndSortedCards}
          onSelectCard={handleSelectCard}
          onOpenAddModal={() => {
            setIsAddModalOpen(true);
            setActiveTab('add');
          }}
          searchQuery={searchQuery}
        />
      </main>

      {/* Fullscreen Barcode Scan Modal */}
      {selectedCard && (
        <BarcodeModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* Add Card Upload Modal */}
      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setActiveTab('cards');
        }}
        onSaveCard={handleSaveCard}
      />

      {/* Floating Liquid Glass Taskbar */}
      <LiquidGlassNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'cards') {
            setIsAddModalOpen(false);
          }
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />
    </div>
  );
}

export default App;

const STORAGE_KEY = 'wallet_krow_cards_v1';

// Preset color themes for cards based on name or index
export const CARD_COLORS = [
  { name: 'purple', bg: 'from-purple-600 to-indigo-700', badge: 'bg-purple-100 text-purple-700' },
  { name: 'rose', bg: 'from-rose-500 to-pink-600', badge: 'bg-rose-100 text-rose-700' },
  { name: 'emerald', bg: 'from-emerald-500 to-teal-700', badge: 'bg-emerald-100 text-emerald-700' },
  { name: 'amber', bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-700' },
  { name: 'blue', bg: 'from-blue-600 to-cyan-600', badge: 'bg-blue-100 text-blue-700' },
  { name: 'dark', bg: 'from-slate-800 to-slate-900', badge: 'bg-slate-100 text-slate-800' },
];

export const getCardColor = (name = '') => {
  const charCode = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CARD_COLORS[charCode % CARD_COLORS.length];
};

const DEFAULT_DEMO_CARDS = [
  {
    id: 'demo_costco',
    name: 'Costco Wholesale',
    codeNumber: '719283746102',
    image: null,
    barcodeType: 'CODE128',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    views: 12,
    isDemo: true
  },
  {
    id: 'demo_target',
    name: 'Target Circle',
    codeNumber: '992018274631',
    image: null,
    barcodeType: 'CODE128',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    views: 8,
    isDemo: true
  },
  {
    id: 'demo_cvs',
    name: 'CVS ExtraCare',
    codeNumber: '441098273615',
    image: null,
    barcodeType: 'CODE128',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    views: 15,
    isDemo: true
  }
];

export const loadCards = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Save initial demo cards if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_CARDS));
      return DEFAULT_DEMO_CARDS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_DEMO_CARDS;
  } catch (err) {
    console.error('Error loading cards from localStorage:', err);
    return DEFAULT_DEMO_CARDS;
  }
};

export const saveCard = (cardData) => {
  const cards = loadCards();
  const newCard = {
    id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: cardData.name.trim(),
    codeNumber: cardData.codeNumber ? cardData.codeNumber.trim() : '',
    image: cardData.image || null,
    barcodeType: cardData.barcodeType || 'CODE128',
    createdAt: new Date().toISOString(),
    views: 0
  };
  
  const updatedCards = [newCard, ...cards];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
  return newCard;
};

export const incrementCardView = (cardId) => {
  const cards = loadCards();
  const updatedCards = cards.map(c => {
    if (c.id === cardId) {
      return { ...c, views: (c.views || 0) + 1 };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
  return updatedCards;
};

export const deleteCard = (cardId) => {
  const cards = loadCards();
  const filtered = cards.filter(c => c.id !== cardId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

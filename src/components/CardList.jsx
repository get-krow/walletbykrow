import React from 'react';
import { BarcodeRenderer } from './BarcodeRenderer';
import { getCardColor } from '../utils/storage';
import { Eye, Calendar, ChevronRight, PlusCircle, CreditCard } from 'lucide-react';

export const CardList = ({ cards, onSelectCard, onOpenAddModal, searchQuery }) => {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm my-4">
        <div className="w-16 h-16 rounded-full bg-krow-purple-tint flex items-center justify-center text-krow-purple mb-4 shadow-inner">
          <CreditCard className="w-8 h-8" />
        </div>
        {searchQuery ? (
          <>
            <h3 className="text-lg font-bold text-slate-900">No cards match "{searchQuery}"</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Check the spelling or try searching for another store name.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900">No Membership Cards Yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Tap below to save your first card barcode in seconds!
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-5 flex items-center gap-2 px-5 py-3 bg-krow-purple hover:bg-krow-purple-hover text-white font-bold text-sm rounded-2xl shadow-lg shadow-krow-purple/30 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Card
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pb-24">
      {cards.map((card) => {
        const color = getCardColor(card.name);
        const formattedDate = card.createdAt
          ? new Date(card.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '';

        return (
          <div
            key={card.id}
            onClick={() => onSelectCard(card)}
            className="group relative bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card-glow hover:shadow-card-hover transition-all duration-200 active:scale-[0.99] cursor-pointer overflow-hidden"
          >
            {/* Left accent pill */}
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b ${color.bg}`} />

            <div className="flex items-center justify-between gap-3 pl-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 truncate tracking-tight group-hover:text-krow-purple transition-colors">
                    {card.name}
                  </h3>
                  {card.views > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Eye className="w-3 h-3 text-krow-purple" />
                      {card.views}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  {formattedDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formattedDate}
                    </span>
                  )}
                  {card.codeNumber && (
                    <span className="font-mono text-slate-600 truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-[11px]">
                      #{card.codeNumber}
                    </span>
                  )}
                </div>

                {/* Barcode / Photo thumbnail preview */}
                <div className="mt-3 max-w-[240px]">
                  <BarcodeRenderer
                    codeNumber={card.codeNumber}
                    image={card.image}
                    name={card.name}
                    isLarge={false}
                  />
                </div>
              </div>

              {/* Tap arrow button */}
              <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 group-hover:bg-krow-purple-tint text-slate-400 group-hover:text-krow-purple transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

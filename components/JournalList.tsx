import React, { useMemo, useState } from 'react';
import { JournalEntry } from '../types';
import { BookIcon, SearchIcon, ArrowLeftIcon } from '../constants';

interface JournalListProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onBack: () => void;
}

export const JournalList: React.FC<JournalListProps> = ({ entries, onSelectEntry, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.date.includes(searchTerm)
    );
  }, [entries, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto animate-slide-up pb-20">
       <button 
            onClick={onBack}
            className="flex items-center text-sm font-medium text-sage-600 hover:text-sage-800 transition-colors mb-6"
        >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Upload
        </button>

       <div className="flex flex-col mb-8">
        <h2 className="font-serif text-2xl text-sage-900 mb-4">My Journal</h2>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-sage-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-sage-200 rounded-2xl leading-5 bg-white placeholder-sage-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sage-200 focus:border-sage-400 transition sm:text-sm"
            placeholder="Search by keyword or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
       </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-sage-100">
            <BookIcon className="w-12 h-12 text-sage-300 mx-auto mb-4" />
            <p className="text-sage-500 font-medium">No journal entries found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEntries.map((entry) => (
            <div 
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="group bg-white/70 hover:bg-white backdrop-blur-sm rounded-2xl p-6 border border-sage-100 hover:border-sage-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                 <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">
                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 </span>
                 <div className="flex gap-1">
                    {entry.moodTags.slice(0, 2).map(t => (
                        <div key={t} className="w-2 h-2 rounded-full bg-orange-200"></div>
                    ))}
                 </div>
              </div>
              
              <h3 className="font-serif text-xl text-sage-800 mb-2 group-hover:text-sage-900 line-clamp-2">
                {entry.title}
              </h3>
              <p className="text-sm text-sage-500 line-clamp-3 mb-4 flex-grow font-serif leading-relaxed">
                {entry.content}
              </p>
              
              <div className="flex items-center text-xs text-sage-400 font-medium border-t border-sage-50 pt-4 mt-auto">
                 <span>{entry.duration || 'Unknown length'}</span>
                 <span className="mx-2">•</span>
                 <span>Read entry &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

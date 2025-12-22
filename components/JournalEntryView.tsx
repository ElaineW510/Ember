import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { SparklesIcon, ArrowLeftIcon, EyeIcon } from '../constants';

interface JournalEntryViewProps {
  entry: JournalEntry;
  onBack: () => void;
  isNew?: boolean;
}

export const JournalEntryView: React.FC<JournalEntryViewProps> = ({ entry, onBack, isNew }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="max-w-3xl mx-auto animate-slide-up pb-20">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-medium text-sage-600 hover:text-sage-800 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Journal
      </button>

      {isNew && (
        <div className="mb-6 bg-sage-50 border border-sage-200 rounded-xl p-4 flex items-start gap-3">
          <SparklesIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sage-800 text-sm">Your Reflection is Ready</h4>
            <p className="text-sm text-sage-600">This entry has been automatically saved to "My Journal".</p>
          </div>
        </div>
      )}

      <article className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12 border border-white/60">
        <header className="mb-10 border-b border-sage-100 pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
                {entry.moodTags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-sage-50 text-sage-700 text-xs font-semibold uppercase tracking-wider rounded-full border border-sage-100">
                        {tag}
                    </span>
                ))}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-sage-900 leading-tight mb-4">{entry.title}</h1>
            <div className="flex items-center text-sage-500 text-sm font-medium">
                <time dateTime={entry.date}>
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <span className="mx-2">•</span>
                <span>{entry.duration || 'Session'}</span>
            </div>
        </header>

        <div className="prose prose-sage prose-lg max-w-none font-serif text-sage-800 leading-relaxed whitespace-pre-line">
            {entry.content}
        </div>

        <div className="mt-12 pt-8 border-t border-sage-100">
            <h3 className="text-sm font-bold uppercase tracking-widest text-sage-400 mb-6">Key Insights</h3>
            <ul className="grid gap-4 sm:grid-cols-2">
                {entry.insights.map((insight, idx) => (
                    <li key={idx} className="bg-sage-50/50 p-4 rounded-xl border border-sage-100 text-sage-700 text-sm font-medium flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-200 text-sage-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        {insight}
                    </li>
                ))}
            </ul>
        </div>

        {entry.transcript && (
          <div className="mt-8 pt-8 border-t border-sage-100">
             <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center gap-2 text-sm text-sage-500 hover:text-sage-700 font-medium transition-colors mb-4"
             >
                <EyeIcon className="w-4 h-4" />
                {showTranscript ? "Hide Source Transcript" : "Show Source Transcript"}
             </button>
             
             {showTranscript && (
                 <div className="bg-sage-50 p-6 rounded-xl border border-sage-100 text-sm font-mono text-sage-700 whitespace-pre-line leading-relaxed">
                    <h4 className="font-sans font-bold text-sage-400 uppercase text-xs mb-3 tracking-wider">Session Transcript</h4>
                    {entry.transcript}
                 </div>
             )}
          </div>
        )}
      </article>
    </div>
  );
};

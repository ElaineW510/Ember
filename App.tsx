import React, { useState, useEffect } from 'react';
import { AppView, JournalEntry, ProcessStatus } from './types';
import { processAudioJournal, processTextJournal } from './services/geminiService';
import { storageService } from './services/storageService';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { JournalEntryView } from './components/JournalEntryView';
import { JournalList } from './components/JournalList';
import { PrivacyNotice } from './components/PrivacyNotice';
import { LoginView } from './components/LoginView';
import { SignUpView } from './components/SignUpView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookIcon, PlayIcon, SAMPLE_TRANSCRIPT } from './constants';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);

  // Handle auth state changes
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      // User is not authenticated - redirect to login unless already on auth pages
      if (view !== AppView.LOGIN && view !== AppView.SIGNUP) {
        setView(AppView.LOGIN);
      }
    } else {
      // User is authenticated - redirect from auth pages to home
      if (view === AppView.LOGIN || view === AppView.SIGNUP) {
        setView(AppView.HOME);
      }
    }
  }, [user, authLoading, view]);

  // Load entries when authenticated and view changes
  useEffect(() => {
    if (user && (view === AppView.HOME || view === AppView.HISTORY)) {
      loadEntries();
    }
  }, [user, view]);

  const loadEntries = async () => {
    if (!user) return;
    
    setEntriesLoading(true);
    try {
      const loaded = await storageService.getAllEntries();
      setEntries(loaded);
    } catch (err: any) {
      console.error('Failed to load entries', err);
      setError('Failed to load journal entries. Please try again.');
    } finally {
      setEntriesLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      setView(AppView.LOGIN);
      return;
    }

    setView(AppView.PROCESSING);
    setStatus(ProcessStatus.UPLOADING);
    setError(null);

    try {
      setStatus(ProcessStatus.TRANSCRIBING);
      
      const entry = await processAudioJournal(file);
      
      setStatus(ProcessStatus.WRITING);
      await new Promise(r => setTimeout(r, 800)); 

      await storageService.saveEntry(entry);
      setCurrentEntry(entry);
      setStatus(ProcessStatus.COMPLETED);
      setView(AppView.RESULT);
      
      // Reload entries to include the new one
      await loadEntries();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong processing your file.");
      setView(AppView.HOME);
      setStatus(ProcessStatus.IDLE);
    }
  };

  const handleDemoSession = async () => {
    if (!user) {
      setView(AppView.LOGIN);
      return;
    }

    setView(AppView.PROCESSING);
    setStatus(ProcessStatus.TRANSCRIBING);
    setError(null);

    try {
      // Small delay to simulate processing
      await new Promise(r => setTimeout(r, 1500));
      setStatus(ProcessStatus.WRITING);
      
      const entry = await processTextJournal(SAMPLE_TRANSCRIPT);
      
      await new Promise(r => setTimeout(r, 1000));

      await storageService.saveEntry(entry);
      setCurrentEntry(entry);
      setStatus(ProcessStatus.COMPLETED);
      setView(AppView.RESULT);
      
      // Reload entries to include the new one
      await loadEntries();

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Demo failed. Check API key.");
        setView(AppView.HOME);
        setStatus(ProcessStatus.IDLE);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setView(AppView.LOGIN);
      setEntries([]);
      setCurrentEntry(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const renderContent = () => {
    // Show loading state while checking auth
    if (authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-sage-600">Loading...</div>
        </div>
      );
    }

    switch (view) {
      case AppView.LOGIN:
        return (
          <LoginView
            onSwitchToSignUp={() => setView(AppView.SIGNUP)}
            onSuccess={() => {
              // The auth state change will handle the redirect
              // But we can also set it here as a fallback
              if (user) {
                setView(AppView.HOME);
              }
            }}
          />
        );

      case AppView.SIGNUP:
        return (
          <SignUpView
            onSwitchToLogin={() => setView(AppView.LOGIN)}
            onSuccess={() => {
              // The auth state change will handle the redirect
              // But we can also set it here as a fallback
              if (user) {
                setView(AppView.HOME);
              }
            }}
          />
        );

      case AppView.HOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 md:py-20">
            <div className="text-center mb-12 max-w-4xl px-6 animate-fade-in">
              <h1 className="font-serif text-3xl md:text-4xl text-sage-900 mb-6 leading-[2.5rem]">
                Turn your therapy sessions into <br /><span className="text-sage-500 italic tracking-wide">personal growth</span>
              </h1>
              <p className="text-lg text-sage-600 mb-8 font-sans leading-relaxed max-w-2xl mx-auto">
                Ember listens to your session recordings and writes a deep, empathetic first-person journal entry for you—helping you retain insights and track your breakthroughs.
              </p>
            </div>
            
            <FileUpload onFileSelect={handleFileUpload} />
            
            <div className="mt-8">
                <button 
                  onClick={handleDemoSession}
                  className="text-sage-600 text-sm font-medium hover:text-sage-900 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-sage-100 transition-colors"
                >
                  <PlayIcon className="w-4 h-4" />
                  Try with Sample Session
                </button>
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 max-w-md">
                {error}
              </div>
            )}
            
            <div className="mt-12 flex gap-4 animate-fade-in animation-delay-500">
               <button 
                 onClick={() => setView(AppView.HISTORY)}
                 className="flex items-center gap-2 text-sage-600 font-medium hover:text-sage-800 px-6 py-3 rounded-full hover:bg-white/50 transition-all"
               >
                 <BookIcon className="w-5 h-5" />
                 View My Journal ({entriesLoading ? '...' : entries.length})
               </button>
            </div>
          </div>
        );

      case AppView.PROCESSING:
        return <ProcessingView status={status} />;

      case AppView.RESULT:
        return currentEntry ? (
          <JournalEntryView 
            entry={currentEntry} 
            onBack={() => setView(AppView.HISTORY)}
            isNew={true}
          />
        ) : null;

      case AppView.HISTORY:
        return (
          <JournalList 
            entries={entries} 
            onSelectEntry={(entry) => {
              setCurrentEntry(entry);
              setView(AppView.ENTRY_DETAIL);
            }}
            onBack={() => setView(AppView.HOME)}
          />
        );

      case AppView.ENTRY_DETAIL:
        return currentEntry ? (
          <JournalEntryView 
            entry={currentEntry} 
            onBack={() => setView(AppView.HISTORY)}
            isNew={false}
          />
        ) : null;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-sage-50 to-blue-50 relative overflow-hidden">
        {/* Ambient Background Elements */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sage-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 pointer-events-none"></div>

      <header className="p-6 md:p-8 flex justify-between items-center relative z-10">
        <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => user && setView(AppView.HOME)}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sage-400 to-sage-600"></div>
          <span className="font-serif text-xl font-bold text-sage-900 tracking-tight">Ember</span>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="text-sm text-sage-600 hover:text-sage-900 font-medium px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            Sign Out
          </button>
        )}
      </header>

      <main className="container mx-auto px-4 relative z-10">
        {renderContent()}
      </main>

      <footer className="relative z-10 pb-8">
        <PrivacyNotice />
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

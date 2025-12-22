import React from 'react';

interface ProcessingViewProps {
  status: string;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ status }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center p-6">
      <div className="relative w-64 h-64 mb-8">
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-64 h-64 bg-sage-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-white/50">
                <svg className="animate-spin h-8 w-8 text-sage-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        </div>
      </div>

      <h2 className="text-2xl font-serif text-sage-900 mb-3">Reflecting on your session...</h2>
      <p className="text-sage-600 font-sans max-w-md mx-auto">{status === 'UPLOADING' ? 'Uploading audio...' : status === 'TRANSCRIBING' ? 'Listening and transcribing...' : 'Writing your journal entry...'}</p>
      
      <div className="mt-8 w-64 bg-sage-100 rounded-full h-1.5 overflow-hidden">
        <div className="bg-sage-500 h-1.5 rounded-full animate-[wiggle_1s_ease-in-out_infinite]" style={{ width: '100%', transformOrigin: '0% 50%' }}></div>
      </div>
    </div>
  );
};

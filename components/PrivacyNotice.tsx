import React from 'react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="mt-8 py-5 px-4 bg-sage-50/50 rounded-xl border border-sage-100 backdrop-blur-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-sage-600">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p className="text-xs text-sage-600 flex-1">
          Privacy First: Your recordings are processed securely in memory and are never stored on our servers.
        </p>
      </div>
    </div>
  );
};

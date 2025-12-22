import React, { useCallback, useState } from 'react';
import { UploadIcon, FileAudioIcon } from '../constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateAndProcess = (file: File) => {
    setError(null);
    // 100MB Limit
    if (file.size > 100 * 1024 * 1024) {
      setError("File is too large. Max 100MB.");
      return;
    }
    
    // Accept audio
    if (!file.type.startsWith('audio/')) {
        setError("Please upload an audio file (MP3, WAV, M4A).");
        return;
    }

    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up">
      <div
        className={`relative group border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ease-out cursor-pointer
          ${isDragging 
            ? 'border-sage-500 bg-sage-50 scale-[1.02]' 
            : 'border-sage-200 hover:border-sage-400 hover:bg-white/50 bg-white/30'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('audio-input')?.click()}
      >
        <input
          type="file"
          id="audio-input"
          className="hidden"
          accept="audio/*"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-sage-100 text-sage-600' : 'bg-white text-sage-400 group-hover:text-sage-600 shadow-sm'}`}>
            {isDragging ? <FileAudioIcon className="w-8 h-8" /> : <UploadIcon className="w-8 h-8" />}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-serif text-xl text-sage-900">
              {isDragging ? 'Drop your recording here' : 'Upload your session'}
            </h3>
            <p className="text-sm text-sage-500 font-medium">
              MP3, M4A, WAV up to 100MB
            </p>
          </div>
        </div>

        {error && (
            <div className="absolute -bottom-12 left-0 right-0 text-red-500 text-sm bg-red-50 py-2 rounded-lg border border-red-100">
                {error}
            </div>
        )}
      </div>
    </div>
  );
};

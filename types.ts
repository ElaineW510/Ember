export interface JournalEntry {
  id: string;
  date: string; // ISO string
  title: string;
  content: string; // HTML or Markdown string
  insights: string[];
  duration: string;
  moodTags: string[];
  transcript?: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  HOME = 'HOME',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  ENTRY_DETAIL = 'ENTRY_DETAIL'
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  TRANSCRIBING = 'TRANSCRIBING',
  ANALYZING = 'ANALYZING',
  WRITING = 'WRITING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProcessingError {
  message: string;
  code?: string;
}

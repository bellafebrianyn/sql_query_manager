export interface QueryRow {
  no: string | number;
  deskripsi: string;
  jenisOperasi: string;
  namaTabel: string;
  query: string;
  kolom: string;
  contohNilai: string;
  step: string;
  // For Glossary Issue category
  deskripsiIssue?: string; // Alternative to deskripsi for Glossary Issue
  dokumentasiIssue?: string; // Image URL or path for issue screenshot
}

export interface ProjectData {
  projectName: string; // Derived from Sheet Name
  rows: QueryRow[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}
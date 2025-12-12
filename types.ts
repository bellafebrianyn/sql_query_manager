export interface QueryRow {
  no: string | number;
  deskripsi: string;
  jenisOperasi: string;
  namaTabel: string;
  query: string;
  kolom: string;
  contohNilai: string;
  step: string;
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
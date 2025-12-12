import React, { ChangeEvent, useState } from 'react';
import { Upload, Loader2, CloudUpload, CheckCircle } from 'lucide-react';
import { ProjectData, QueryRow } from '../types';
import { uploadToCloudinary } from '../services/cloudinaryService';

interface FileUploadProps {
  onDataLoaded: (data: ProjectData[]) => void;
  currentData: ProjectData[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, currentData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusText('Reading file...');

    try {
      // 1. Parse Locally for immediate UI update
      const arrayBuffer = await file.arrayBuffer();
      const XLSX = (window as any).XLSX;
      
      if (!XLSX) {
        throw new Error("Excel parser not loaded");
      }

      const workbook = XLSX.read(arrayBuffer);
      const allProjects: ProjectData[] = [];

      workbook.SheetNames.forEach((sheetName: string) => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length === 0) return;

        // Dynamic Header Detection
        const headers = (jsonData[0] as any[]).map(h => String(h || '').toLowerCase());
        
        const findIdx = (keywords: string[], defaultIdx: number) => {
          const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
          return idx !== -1 ? idx : defaultIdx;
        };
  
        const idxNo = findIdx(['no'], 0);
        const idxDesc = findIdx(['deskripsi', 'description', 'desc'], 1);
        const idxType = findIdx(['jenis', 'type', 'operation'], 2);
        const idxTable = findIdx(['tabel', 'table'], 3);
        const idxQuery = findIdx(['query', 'sql'], 4);
        const idxCol = findIdx(['kolom', 'column'], 5);
        const idxEx = findIdx(['contoh', 'example', 'nilai'], 6);
        const idxStep = findIdx(['step', 'langkah', 'catatan', 'note'], 7);
        
        const rows = jsonData.slice(1).map((row: any[]) => {
          return {
            no: row[idxNo] || '',
            deskripsi: row[idxDesc] || '',
            jenisOperasi: row[idxType] || '',
            namaTabel: row[idxTable] || '',
            query: row[idxQuery] || '',
            kolom: row[idxCol] || '',
            contohNilai: row[idxEx] || '',
            step: row[idxStep] || ''
          } as QueryRow;
        }).filter((r: QueryRow) => r.query || r.deskripsi);

        if (rows.length > 0) {
          allProjects.push({
            projectName: sheetName,
            rows: rows
          });
        }
      });

      // Update UI immediately
      onDataLoaded(allProjects);

      // 2. Upload to Cloudinary
      setStatusText('Syncing to Cloud...');
      await uploadToCloudinary(file);
      
      setStatusText('Done!');
      setTimeout(() => {
          setIsProcessing(false);
          setStatusText('');
      }, 2000);

    } catch (error) {
      console.error("Error:", error);
      alert("Error processing file: " + (error as Error).message);
      setIsProcessing(false);
      setStatusText('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-4">
        <label className={`cursor-pointer ${isProcessing ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium`}>
          {isProcessing ? (
             statusText === 'Done!' ? <CheckCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{isProcessing ? statusText : 'Import & Sync'}</span>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </label>
      </div>

      <div className="hidden lg:flex text-xs text-slate-500 items-center gap-1 ml-2">
        <CloudUpload className="w-3 h-3" />
        <span>Syncs to Cloud</span>
      </div>
    </div>
  );
};

export default FileUpload;
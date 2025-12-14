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
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1, 
          raw: false,
          defval: ''
        });

        if (jsonData.length === 0) return;

        // Get hyperlinks from sheet if available
        const hyperlinks: Record<string, string> = {};
        if (sheet['!links']) {
          Object.keys(sheet['!links']).forEach(cellAddress => {
            const link = sheet['!links'][cellAddress];
            if (link && link.Target) {
              hyperlinks[cellAddress] = link.Target;
            }
          });
        }

        // Dynamic Header Detection
        const headers = (jsonData[0] as any[]).map(h => String(h || '').toLowerCase());
        
        const findIdx = (keywords: string[], defaultIdx: number) => {
          const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
          return idx !== -1 ? idx : defaultIdx;
        };

        // Check if this is Glossary Issue category
        const isGlossaryIssue = sheetName.toLowerCase().includes('glossary') && 
                               sheetName.toLowerCase().includes('issue');
  
        const idxNo = findIdx(['no'], 0);
        const idxDesc = findIdx(['deskripsi', 'description', 'desc'], 1);
        const idxType = findIdx(['jenis', 'type', 'operation'], 2);
        const idxTable = findIdx(['tabel', 'table'], 3);
        const idxQuery = findIdx(['query', 'sql'], 4);
        const idxCol = findIdx(['kolom', 'column'], 5);
        const idxEx = findIdx(['contoh', 'example', 'nilai'], 6);
        const idxStep = findIdx(['step', 'langkah', 'catatan', 'note'], 7);
        
        // For Glossary Issue: find specific columns
        const idxDeskripsiIssue = isGlossaryIssue ? findIdx(['deskripsi issue', 'deskripsiissue'], 1) : -1;
        const idxDokumentasiIssue = isGlossaryIssue ? findIdx(['dokumentasi issue', 'dokumentasiissue', 'dokumentasi'], -1) : -1;

        // Helper to convert column index to Excel column letter
        const colToLetter = (col: number): string => {
          let result = '';
          while (col >= 0) {
            result = String.fromCharCode(65 + (col % 26)) + result;
            col = Math.floor(col / 26) - 1;
          }
          return result;
        };

        // Helper to get cell value with hyperlink support
        const getCellValue = (colIndex: number, rowIdx: number) => {
          if (colIndex === -1) return '';
          const cellValue = String((jsonData[rowIdx + 1] as any[])[colIndex] || '').trim();
          const excelRow = rowIdx + 2;
          const excelCol = colToLetter(colIndex);
          const cellAddress = `${excelCol}${excelRow}`;
          if (hyperlinks[cellAddress]) {
            console.log(`[FileUpload] Found hyperlink for ${cellAddress}:`, hyperlinks[cellAddress]);
            return hyperlinks[cellAddress];
          }
          if (cellValue && (cellValue.startsWith('http://') || cellValue.startsWith('https://'))) {
            console.log(`[FileUpload] Found URL in cell value for ${cellAddress}:`, cellValue);
            return cellValue;
          }
          return cellValue;
        };
        
        const rows = jsonData.slice(1).map((row: any[], rowIndex: number) => {
          const baseRow = {
            no: row[idxNo] || '',
            deskripsi: isGlossaryIssue && idxDeskripsiIssue !== -1 
              ? getCellValue(idxDeskripsiIssue, rowIndex) 
              : getCellValue(idxDesc, rowIndex),
            jenisOperasi: getCellValue(idxType, rowIndex),
            namaTabel: getCellValue(idxTable, rowIndex),
            query: getCellValue(idxQuery, rowIndex),
            kolom: getCellValue(idxCol, rowIndex),
            contohNilai: getCellValue(idxEx, rowIndex),
            step: getCellValue(idxStep, rowIndex)
          } as any;

          if (isGlossaryIssue) {
            if (idxDeskripsiIssue !== -1) {
              baseRow.deskripsiIssue = getCellValue(idxDeskripsiIssue, rowIndex);
            }
            if (idxDokumentasiIssue !== -1) {
              baseRow.dokumentasiIssue = getCellValue(idxDokumentasiIssue, rowIndex);
            }
          }

          return baseRow;
        }).filter((r: QueryRow) => r.query || r.deskripsi || (r as any).deskripsiIssue);

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
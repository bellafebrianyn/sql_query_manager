import React, { useState, useMemo } from 'react';
import { ProjectData } from '../types';
import { Search, Database, FileText, Copy, Check, ListOrdered } from 'lucide-react';

interface ProjectViewerProps {
  data: ProjectData[];
}

const ProjectViewer: React.FC<ProjectViewerProps> = ({ data }) => {
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeProject = data[selectedProjectIndex];

  const filteredRows = useMemo(() => {
    if (!activeProject) return [];
    if (!searchTerm) return activeProject.rows;
    const lower = searchTerm.toLowerCase();
    return activeProject.rows.filter(row => 
      row.deskripsi.toLowerCase().includes(lower) ||
      row.namaTabel.toLowerCase().includes(lower) ||
      row.query.toLowerCase().includes(lower)
    );
  }, [activeProject, searchTerm]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
        <Database className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No Data Loaded</p>
        <p className="text-sm">Please import an Excel file to view queries.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
          <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Select Category:</label>
          <select 
            value={selectedProjectIndex}
            onChange={(e) => setSelectedProjectIndex(Number(e.target.value))}
            className="bg-slate-100 border-none rounded-lg px-4 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {data.map((proj, idx) => (
              <option key={idx} value={idx}>{proj.projectName} ({proj.rows.length} queries)</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search description, table, or query..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider sticky top-0">
              <tr>
                <th className="px-4 py-3 border-b border-slate-100 w-12 text-center">No</th>
                <th className="px-4 py-3 border-b border-slate-100 w-64">Description</th>
                <th className="px-4 py-3 border-b border-slate-100 w-24">Type</th>
                <th className="px-4 py-3 border-b border-slate-100 w-32">Table</th>
                <th className="px-4 py-3 border-b border-slate-100 min-w-[300px]">SQL Query</th>
                <th className="px-4 py-3 border-b border-slate-100 w-48">Columns</th>
                <th className="px-4 py-3 border-b border-slate-100 min-w-[350px]">Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-4 py-3 text-center text-slate-400 text-sm font-medium">
                    {row.no}
                  </td>
                  
                  <td className="px-4 py-3 align-top">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">{row.deskripsi}</p>
                  </td>

                  <td className="px-4 py-3 align-top">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${row.jenisOperasi.toLowerCase().includes('select') ? 'bg-blue-100 text-blue-800' : 
                          row.jenisOperasi.toLowerCase().includes('update') ? 'bg-amber-100 text-amber-800' :
                          row.jenisOperasi.toLowerCase().includes('delete') ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'}`}>
                        {row.jenisOperasi}
                      </span>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <span className="text-xs font-mono font-medium text-slate-700 block bg-slate-100 px-2 py-1 rounded">
                        {row.namaTabel}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="relative group/code">
                      <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopy(row.query, idx)}
                          className="p-1.5 bg-white shadow-sm border border-slate-200 rounded hover:bg-slate-50 text-slate-500"
                          title="Copy SQL"
                        >
                          {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                        {row.query}
                      </pre>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    {row.kolom ? (
                        <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-tight">{row.kolom}</pre>
                    ) : (
                        <span className="text-xs text-slate-300 italic">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 align-top text-sm text-slate-600">
                    {row.step ? (
                      <div className="flex gap-3 items-start text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <ListOrdered className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                        <span className="whitespace-pre-wrap text-xs leading-relaxed">{row.step}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic">-</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No matching queries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewer;
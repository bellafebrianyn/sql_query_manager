import React, { useState, useEffect } from 'react';
import { Database, MessageSquare, LayoutDashboard, LogOut, Loader2, Cloud } from 'lucide-react';
import { ProjectData } from './types';
import ProjectViewer from './components/ProjectViewer';
import ChatInterface from './components/ChatInterface';
import FileUpload from './components/FileUpload';
import Login from './components/Login';
import { initializeChatSession } from './services/geminiService';
import { fetchFromCloudinary } from './services/cloudinaryService';
import { SAMPLE_DATA } from './utils/sampleData';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'cms' | 'cf' | null>(null);
  const [activeTab, setActiveTab] = useState<'queries' | 'chat'>('queries');
  const [projectData, setProjectData] = useState<ProjectData[]>(SAMPLE_DATA);
  const [hasLoadedCustomData, setHasLoadedCustomData] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Function to parse ArrayBuffer with dynamic header mapping
  const parseExcelBuffer = (arrayBuffer: ArrayBuffer): ProjectData[] => {
    const XLSX = (window as any).XLSX;
    if (!XLSX) return [];

    const workbook = XLSX.read(arrayBuffer);
    const allProjects: ProjectData[] = [];

    workbook.SheetNames.forEach((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      if (jsonData.length === 0) return;

      // Detect Header Indices
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

      const rows = jsonData.slice(1).map((row: any[]) => ({
        no: row[idxNo] || '',
        deskripsi: row[idxDesc] || '',
        jenisOperasi: row[idxType] || '',
        namaTabel: row[idxTable] || '',
        query: row[idxQuery] || '',
        kolom: row[idxCol] || '',
        contohNilai: row[idxEx] || '',
        step: row[idxStep] || ''
      })).filter((r: any) => r.query || r.deskripsi);

      if (rows.length > 0) {
        allProjects.push({ projectName: sheetName, rows: rows });
      }
    });
    return allProjects;
  };

  // Load data from Cloudinary on mount
  useEffect(() => {
    const loadCloudData = async () => {
      setIsSyncing(true);
      try {
        const buffer = await fetchFromCloudinary();
        const parsedData = parseExcelBuffer(buffer);
        if (parsedData.length > 0) {
          setProjectData(parsedData);
          setHasLoadedCustomData(true);
          initializeChatSession(parsedData);
          console.log("Data synced from Cloudinary successfully");
        }
      } catch (error) {
        console.warn("Could not fetch from Cloudinary (using sample data):", error);
        setCloudError("Could not sync with cloud. Showing local/sample data.");
        // Use local storage as fallback if cloud fails
        const savedData = localStorage.getItem('sql_app_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setProjectData(parsed);
          setHasLoadedCustomData(true);
          initializeChatSession(parsed);
        } else {
          initializeChatSession(SAMPLE_DATA);
        }
      } finally {
        setIsSyncing(false);
      }
    };

    // Check if XLSX is ready before loading
    const checkXLSX = setInterval(() => {
      if ((window as any).XLSX) {
        clearInterval(checkXLSX);
        loadCloudData();
      }
    }, 100);

    return () => clearInterval(checkXLSX);
  }, []);

  const handleDataLoaded = (newData: ProjectData[]) => {
    setProjectData(newData);
    setHasLoadedCustomData(true);
    localStorage.setItem('sql_app_data', JSON.stringify(newData)); // Keep local backup
    initializeChatSession(newData);
    setCloudError(null); // Clear error if manual load succeeds
  };

  const handleLogin = (role: 'cms' | 'cf') => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveTab('queries');
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm z-30 flex-none">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${userRole === 'cms' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 leading-tight">Query Manager</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Excel to SQL Assistant</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                  userRole === 'cms' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {userRole} Mode
                </span>
                {isSyncing && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse border border-blue-100">
                    <Cloud className="w-3 h-3" /> Syncing...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {userRole === 'cms' && (
              <FileUpload onDataLoaded={handleDataLoaded} currentData={projectData} />
            )}
            
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('queries')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'queries' 
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Queries</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Assistant</span>
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full z-20">
            {cloudError && !hasLoadedCustomData && (
                <div className="bg-amber-50 text-amber-600 px-4 py-1 text-center text-xs border-b border-amber-100">
                    Warning: {cloudError}
                </div>
            )}
            {!hasLoadedCustomData && !isSyncing && !cloudError && (
            <div className="bg-blue-50 text-blue-600 px-4 py-1 text-center text-xs border-b border-blue-100">
                Currently viewing <strong>Sample Data</strong>. 
                {userRole === 'cms' ? " Upload Excel to sync to Cloud." : " Waiting for admin to upload project data."}
            </div>
            )}
        </div>

        <div className={`h-full transition-opacity duration-300 ${activeTab === 'queries' ? 'block' : 'hidden'}`}>
          <ProjectViewer data={projectData} />
        </div>
        
        <div className={`h-full transition-opacity duration-300 ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
          <ChatInterface />
        </div>
      </main>

    </div>
  );
};

export default App;
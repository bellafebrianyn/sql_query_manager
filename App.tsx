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

  // Load data from Cloudinary on mount and when userRole changes
  // Both CMS and CF use the same data source (database -> Cloudinary)
  useEffect(() => {
    if (!userRole) return; // Don't load data if user is not logged in

    const loadCloudData = async () => {
      setIsSyncing(true);
      console.log(`[${userRole.toUpperCase()}] Starting data sync from database/Cloudinary...`);
      try {
        // Both CMS and CF fetch from the same source: database -> Cloudinary
        console.log(`[${userRole.toUpperCase()}] Fetching file URL from database...`);
        const buffer = await fetchFromCloudinary();
        console.log(`[${userRole.toUpperCase()}] File downloaded, parsing Excel data...`);
        const parsedData = parseExcelBuffer(buffer);
        if (parsedData.length > 0) {
          setProjectData(parsedData);
          setHasLoadedCustomData(true);
          initializeChatSession(parsedData);
          console.log(`✅ [${userRole.toUpperCase()}] Data synced successfully: ${parsedData.length} project(s) loaded`);
        } else {
          console.warn(`⚠️ [${userRole.toUpperCase()}] No data found in Excel file`);
        }
      } catch (error) {
        console.warn(`❌ [${userRole.toUpperCase()}] Could not fetch from Cloudinary:`, error);
        setCloudError("Could not sync with cloud. Showing local/sample data.");
        // Use local storage as fallback if cloud fails
        const savedData = localStorage.getItem('sql_app_data');
        if (savedData) {
          console.log(`[${userRole.toUpperCase()}] Using cached data from localStorage`);
          const parsed = JSON.parse(savedData);
          setProjectData(parsed);
          setHasLoadedCustomData(true);
          initializeChatSession(parsed);
        } else {
          console.log(`[${userRole.toUpperCase()}] Using sample data`);
          setProjectData(SAMPLE_DATA);
          initializeChatSession(SAMPLE_DATA);
        }
      } finally {
        setIsSyncing(false);
        console.log(`[${userRole.toUpperCase()}] Data sync completed`);
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
  }, [userRole]); // Reload data when userRole changes

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
                  <span className="flex items-center gap-1.5 text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full animate-pulse border border-blue-200 shadow-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <Cloud className="w-3 h-3" />
                    <span className="font-medium">Syncing from database...</span>
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
                {userRole === 'cms' 
                  ? " Upload Excel to sync to Cloud." 
                  : " Data will load automatically from database when available."}
            </div>
            )}
        </div>

        {/* Loading Overlay when syncing */}
        {isSyncing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <Cloud className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-800 mb-1">Syncing Data</p>
                <p className="text-sm text-slate-500">Fetching from database and Cloudinary...</p>
              </div>
              <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        <div className={`h-full transition-opacity duration-300 ${isSyncing ? 'opacity-30 pointer-events-none' : ''} ${activeTab === 'queries' ? 'block' : 'hidden'}`}>
          <ProjectViewer data={projectData} />
        </div>
        
        <div className={`h-full transition-opacity duration-300 ${isSyncing ? 'opacity-30 pointer-events-none' : ''} ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
          <ChatInterface />
        </div>
      </main>

    </div>
  );
};

export default App;
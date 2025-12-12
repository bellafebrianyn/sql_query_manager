import React, { useState } from 'react';
import { Shield, User, Database, Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'cms' | 'cf') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'selection' | 'cms_login'>('selection');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleCmsClick = () => {
    setView('cms_login');
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleBack = () => {
    setView('selection');
    setError('');
  };

  const handleCmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded Credentials Validation
    const isValidAdmin = username === 'admin' && password === 'adminCMS123#';
    const isValidCredentialQuery = username === 'credentialquery' && password === 'Contentmanagement123_';

    if (isValidAdmin || isValidCredentialQuery) {
      onLogin('cms');
    } else {
      setError('Username or password incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-200 transition-all duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">SQL Query Manager</h1>
          <p className="text-slate-500 text-sm">
            {view === 'selection' ? 'Select your access level to continue' : 'Enter CMS Credentials'}
          </p>
        </div>
        
        {view === 'selection' ? (
          /* Role Selection View */
          <div className="space-y-4">
            <button 
              onClick={handleCmsClick}
              className="w-full flex items-center p-4 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all group outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="ml-4 text-left">
                <p className="font-bold text-slate-800 group-hover:text-blue-700">Content Management (CMS)</p>
                <p className="text-xs text-slate-500 mt-0.5">Admin access. Can upload and manage Excel files.</p>
              </div>
            </button>

            <button 
              onClick={() => onLogin('cf')}
              className="w-full flex items-center p-4 border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl transition-all group outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="ml-4 text-left">
                <p className="font-bold text-slate-800 group-hover:text-emerald-700">Client View (CF)</p>
                <p className="text-xs text-slate-500 mt-0.5">Standard access. View queries and AI Assistant.</p>
              </div>
            </button>
          </div>
        ) : (
          /* Login Form View */
          <form onSubmit={handleCmsSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm shadow-blue-200 transition-colors mt-4"
            >
              Sign In to CMS
            </button>

            <button 
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 text-sm py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Role Selection
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">Internal Use Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
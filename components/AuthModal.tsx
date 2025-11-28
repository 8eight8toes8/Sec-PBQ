
import React, { useState, useEffect } from 'react';

interface AuthModalProps {
  onLogin: (username: string) => void;
  onCancel: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onCancel }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  // Register State
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');

  // Simulating Lockout Timer
  useEffect(() => {
    if (attempts >= 3) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setAttempts(0);
        setIsLocked(false);
        setLoginError('');
      }, 30000); // 30 second lockout
      return () => clearTimeout(timer);
    }
  }, [attempts]);

  // Helper: Hash password (Simulation of backend hashing)
  const hashPassword = async (pass: string) => {
    const msgBuffer = new TextEncoder().encode(pass);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // 1. Password Complexity Check
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!complexityRegex.test(regPass)) {
      setRegError('Password must be at least 12 chars, include uppercase, lowercase, number, and symbol.');
      return;
    }

    if (regPass !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }

    // 2. Check if user exists (Mock DB)
    const existingUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
    if (existingUsers[regUser]) {
      setRegError('Username unavailable.'); // Generic enough, though usually "User exists" is unavoidable in registration
      return;
    }

    // 3. Save User
    const hashed = await hashPassword(regPass);
    existingUsers[regUser] = { passwordHash: hashed, joined: new Date().toISOString() };
    localStorage.setItem('mock_users_db', JSON.stringify(existingUsers));
    
    alert('Registration successful! Please log in.');
    setView('login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isLocked) return;

    // 1. Fetch User (Mock DB)
    const existingUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
    const userRecord = existingUsers[loginUser];

    // 2. Validate Credentials
    // Note: In a real app, this happens on server.
    // Best Practice: Slow comparison to prevent timing attacks (not really possible in JS/Localstorage, but conceptually important)
    const hashedInput = await hashPassword(loginPass);
    
    if (userRecord && userRecord.passwordHash === hashedInput) {
      // Success - Move to MFA
      setMfaStep(true);
      setLoginError('');
    } else {
      // Failure
      setAttempts(prev => prev + 1);
      setLoginError('Invalid username or password.'); // Generic error message
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate MFA check (Hardcoded "123456" for demo)
    if (mfaCode === '123456') {
      onLogin(loginUser);
    } else {
      setLoginError('Invalid MFA code.');
    }
  };

  const handleDemoUser = async () => {
    const demoUser = 'student_demo';
    const demoPass = 'Security+Lab2024!';

    // Ensure demo user exists in local storage
    const existingUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
    if (!existingUsers[demoUser]) {
        const hashed = await hashPassword(demoPass);
        existingUsers[demoUser] = { passwordHash: hashed, joined: new Date().toISOString() };
        localStorage.setItem('mock_users_db', JSON.stringify(existingUsers));
    }

    setLoginUser(demoUser);
    setLoginPass(demoPass);
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
               <i className={`fas ${mfaStep ? 'fa-shield-alt' : 'fa-lock'}`}></i>
            </div>
            <div>
               <h2 className="text-xl font-bold text-gray-800">
                 {mfaStep ? 'Security Verification' : (view === 'login' ? 'Student Login' : 'Create Account')}
               </h2>
               <p className="text-xs text-gray-500">Secure Access Portal</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
        </div>

        {/* Body */}
        <div className="p-8">
          {mfaStep ? (
             <form onSubmit={handleMfaSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 flex items-start gap-3">
                    <i className="fas fa-envelope-open-text mt-1"></i>
                    <div>
                        <p className="font-bold">Device Verification</p>
                        <p>We've sent a 6-digit code to your registered email ending in ***@example.com.</p>
                        <p className="text-xs mt-2 text-blue-600 italic">(Demo: Enter 123456)</p>
                    </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Authentication Code</label>
                   <input 
                      type="text" 
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                   />
                </div>
                {loginError && <p className="text-red-500 text-sm font-bold text-center"><i className="fas fa-exclamation-triangle"></i> {loginError}</p>}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">
                   Verify & Login
                </button>
             </form>
          ) : view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                <div className="relative">
                    <i className="fas fa-user absolute left-3 top-3.5 text-gray-400"></i>
                    <input 
                        type="text" 
                        value={loginUser}
                        onChange={e => setLoginUser(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Enter your username"
                        disabled={isLocked}
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                    <i className="fas fa-key absolute left-3 top-3.5 text-gray-400"></i>
                    <input 
                        type="password" 
                        value={loginPass}
                        onChange={e => setLoginPass(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="••••••••••••"
                        disabled={isLocked}
                    />
                </div>
              </div>
              
              {isLocked ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                      <i className="fas fa-lock"></i>
                      <span>Account locked due to too many failed attempts. Try again in 30s.</span>
                  </div>
              ) : (
                  loginError && <p className="text-red-500 text-sm font-bold text-center">{loginError}</p>
              )}

              <button 
                type="submit" 
                disabled={isLocked}
                className={`w-full font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2
                    ${isLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                `}
              >
                Log In <i className="fas fa-arrow-right"></i>
              </button>

              <button
                type="button"
                onClick={handleDemoUser}
                disabled={isLocked}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-colors text-sm border border-gray-200"
              >
                Use Demo Account
              </button>
              
              <div className="text-center pt-2">
                 <p className="text-sm text-gray-500">Don't have an account? <button type="button" onClick={() => setView('register')} className="text-blue-600 font-bold hover:underline">Register</button></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
               <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                <input 
                    type="text" 
                    value={regUser}
                    onChange={e => setRegUser(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input 
                    type="password" 
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Min 12 chars, upper, lower, symbol"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                <input 
                    type="password" 
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Re-enter password"
                />
              </div>

              {regError && <p className="text-red-500 text-xs font-bold">{regError}</p>}

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md">
                Create Account
              </button>
              
              <div className="text-center pt-2">
                 <p className="text-sm text-gray-500">Already registered? <button type="button" onClick={() => setView('login')} className="text-blue-600 font-bold hover:underline">Log In</button></p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
    
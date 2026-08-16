import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { 
  Truck, 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  User, 
  Building2, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  Sparkles,
  UserPlus,
  LogIn,
  Check,
  AlertCircle
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: { name: string; email: string; role: UserRole; companyName?: string }) => void;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  companyName?: string;
  businessDetails?: string;
  desc?: string;
  badgeColor?: string;
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-customer-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@tata.com',
    password: 'password123',
    role: 'Customer',
    desc: 'Track personal & commercial incoming packages and digital POD receipts across India.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 'usr-business-1',
    name: 'Priya Patel',
    email: 'priya.p@reliance.com',
    password: 'password123',
    role: 'Business Client',
    companyName: 'Reliance Supply Chain',
    businessDetails: 'GSTIN: 27AAAAA0000A1Z5 | Retail & Supply Chain',
    desc: 'Book enterprise freight, manage bulk dispatch & SLA performance in Indian supply chains.',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'usr-logistics-1',
    name: 'Rajesh Verma',
    email: 'rajesh.v@mahindra.com',
    password: 'password123',
    role: 'Logistics Operator',
    desc: 'Manage live driver telemetry, national highway route navigation & fleet dispatches.',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'usr-support-1',
    name: 'Ananya Iyer',
    email: 'ananya.i@shiptrack.in',
    password: 'password123',
    role: 'Support Agent',
    desc: 'Resolve transit exceptions, update delivery status & assist pan-India customers.',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 'usr-admin-1',
    name: 'Rajesh Admin',
    email: 'admin@shiptrack.in',
    password: 'password123',
    role: 'Administrator',
    desc: 'Full system control, user accounts management, analytics & executive audit reports.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Accounts stored in localStorage
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('shiptrack_accounts_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse accounts', e);
      }
    }
    localStorage.setItem('shiptrack_accounts_db', JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  });

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Customer');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regBusinessDetails, setRegBusinessDetails] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAccountEmail, setResetAccountEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);
    setResetSuccessMsg(null);

    const emailOrName = resetAccountEmail.trim().toLowerCase();
    const newPass = resetNewPassword.trim();

    if (!emailOrName || !newPass) {
      setResetErrorMsg('Please provide both the email/username and new password.');
      return;
    }

    const matchedIndex = accounts.findIndex(
      a => a.email.toLowerCase() === emailOrName || a.name.toLowerCase() === emailOrName
    );

    if (matchedIndex === -1) {
      setResetErrorMsg(`No account found matching "${resetAccountEmail}". Check username/email.`);
      return;
    }

    const updated = [...accounts];
    updated[matchedIndex] = { ...updated[matchedIndex], password: newPass };
    saveAccountsToStorage(updated);

    setResetSuccessMsg(`Password for ${updated[matchedIndex].name} (${updated[matchedIndex].email}) has been changed successfully! You can now sign in.`);
    setResetAccountEmail('');
    setResetNewPassword('');
  };

  // Sync back accounts to localStorage
  const saveAccountsToStorage = (updated: UserAccount[]) => {
    setAccounts(updated);
    localStorage.setItem('shiptrack_accounts_db', JSON.stringify(updated));
  };

  // Login Submit Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputTrim = loginEmail.trim();
    const emailLower = inputTrim.toLowerCase();
    const passwordTrim = loginPassword.trim();

    if (!inputTrim || !passwordTrim) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    // Find account by matching either email or full name (case-insensitive)
    const existing = accounts.find(a => 
      a.email.toLowerCase() === emailLower || 
      a.name.toLowerCase() === emailLower
    );

    if (!existing) {
      setErrorMsg(`No account found matching "${inputTrim}". Please check your username/email or click "Create Account" to register.`);
      return;
    }

    // Verify Password match
    if (existing.password && existing.password !== passwordTrim) {
      setErrorMsg(`Incorrect password for account "${existing.name}". Please check your password and try again.`);
      return;
    }

    // Success login
    setSuccessMsg(`Welcome back, ${existing.name}! Logging into your ${existing.role} portal...`);
    
    setTimeout(() => {
      onLogin({
        name: existing.name,
        email: existing.email,
        role: existing.role,
        companyName: existing.companyName
      });
    }, 600);
  };

  // Register Submit Handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regRole === 'Business Client' && !regCompanyName.trim()) {
      setErrorMsg('Please enter your Company Name for Business Client registration.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Check if email already exists
    const existing = accounts.find(a => a.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existing) {
      setErrorMsg('An account with this email address already exists. Please log in instead.');
      setAuthMode('login');
      setLoginEmail(regEmail.trim());
      return;
    }

    // Create New Account
    const badgeColors: Record<UserRole, string> = {
      'Customer': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Business Client': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'Logistics Operator': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Support Agent': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Administrator': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };

    const newAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      role: regRole,
      companyName: regRole === 'Business Client' ? regCompanyName.trim() : undefined,
      businessDetails: regRole === 'Business Client' ? (regBusinessDetails.trim() || 'Enterprise Freight Client') : undefined,
      desc: regRole === 'Business Client' 
        ? `Registered enterprise Business Client account for ${regCompanyName.trim()}.`
        : `Registered ${regRole} account on ShipTrack Pro portal.`,
      badgeColor: badgeColors[regRole] || 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };

    const updated = [newAccount, ...accounts];
    saveAccountsToStorage(updated);

    setSuccessMsg(`Account created successfully for ${newAccount.name}${newAccount.companyName ? ` (${newAccount.companyName})` : ''}! Logging you in...`);

    setTimeout(() => {
      onLogin({
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
        companyName: newAccount.companyName
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Form Card */}
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-xl shadow-blue-500/25 mb-1">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-white tracking-tight">
              <span>ShipTrack</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">Pro</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Logistics Control & Tracking Access Portal
            </p>
          </div>
        </div>

        {/* Security / SSL Badge */}
        <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorized login required to access shipment records.</span>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono text-[10px] font-bold shrink-0">
            256-Bit Auth
          </span>
        </div>

        {/* Auth Mode Nav Bar */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold gap-1">
          <button
            onClick={() => { setAuthMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'login' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In (Login)
          </button>
          
          <button
            onClick={() => { setAuthMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'register' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>

        {/* Alerts & Messages */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SIGN IN (LOGIN) FORM */}
        {/* ========================================================================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="text-slate-300 text-xs font-medium">
              Enter your account username/email and password to log in:
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username or Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-300 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role perspective is automatically assigned based on your registered account profile.</span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                Keep me signed in
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetErrorMsg(null);
                    setResetSuccessMsg(null);
                  }}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Change / Reset Password?
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Create account?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              Sign In to Access Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 2. CREATE ACCOUNT (REGISTER) FORM */}
        {/* ========================================================================= */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="text-slate-300 text-xs font-medium">
              Fill out the details below to create a new Customer, Business Client, or Logistics account:
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. John Smith or TechCorp Logistics"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Role Category</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
              >
                <option value="Customer">Customer (Track personal packages & digital POD)</option>
                <option value="Business Client">Business Client (Book freight & manage bulk dispatches)</option>
                <option value="Logistics Operator">Logistics Operator (Fleet telemetry & driver routes)</option>
                <option value="Support Agent">Support Agent (Assist users & exception resolution)</option>
                <option value="Administrator">Administrator (System-wide control & audit reports)</option>
              </select>
            </div>

            {regRole === 'Business Client' && (
              <div className="space-y-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
                <div>
                  <label className="block text-indigo-300 font-semibold mb-1">Company / Enterprise Name *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      placeholder="e.g. Reliance Supply Chain / Tata Freight"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-indigo-500/40 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-indigo-300 font-semibold mb-1">Tax ID / GSTIN / Industry Details</label>
                  <input
                    type="text"
                    value={regBusinessDetails}
                    onChange={(e) => setRegBusinessDetails(e.target.value)}
                    placeholder="e.g. GSTIN: 27AAAAA0000A1Z5 | Retail & Supply Chain"
                    className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/40 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Register Account & Login
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 space-y-1">
          <p>© 2026 ShipTrack Pro Inc. All Rights Reserved.</p>
          <div className="flex justify-center gap-3 font-mono text-slate-400">
            <span>Server Active</span>
            <span>•</span>
            <span>256-bit Auth</span>
            <span>•</span>
            <span>Live GPS Sync</span>
          </div>
        </div>

      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Lock className="w-5 h-5" />
                <span>Account Password Change / Reset</span>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {resetSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {resetErrorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resetErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Account Email or Name *</label>
                <input
                  required
                  type="text"
                  value={resetAccountEmail}
                  onChange={(e) => setResetAccountEmail(e.target.value)}
                  placeholder="e.g. admin@global-logistics.com or Alex Mercer"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password *</label>
                <input
                  required
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new password for this account..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-[11px] text-slate-400">
                Administrators can reset any user's password here or from the <strong>User & Accounts</strong> admin dashboard tab.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  Save & Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

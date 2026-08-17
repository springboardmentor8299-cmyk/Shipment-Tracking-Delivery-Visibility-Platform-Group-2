import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { 
  Building2, 
  UserCheck, 
  User,
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert,
  Save,
  Edit3
} from 'lucide-react';

interface UserRoleManagementProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser?: { name: string; email: string; role: UserRole; companyName?: string } | null;
  onUpdateCurrentUser?: (user: { name: string; email: string; role: UserRole; companyName?: string }) => void;
  onNavigateTab?: (tab: string) => void;
  initialSubTab?: 'profile';
}

export const UserRoleManagement: React.FC<UserRoleManagementProps> = ({ 
  currentRole, 
  onRoleChange, 
  currentUser, 
  onUpdateCurrentUser,
  onNavigateTab,
}) => {

  // Profile Form State
  const [profileForm, setProfileForm] = useState(() => {
    try {
      const saved = localStorage.getItem('shiptrack_customer_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email?.toLowerCase() === (currentUser?.email || '').toLowerCase()) {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      name: currentUser?.name || 'Aarav Sharma',
      email: currentUser?.email || 'aarav.sharma@gmail.com',
      companyName: currentUser?.companyName || (currentRole === 'Business Client' ? 'Reliance E-Commerce' : 'Individual Customer'),
      phone: '+91 98765 43210',
    };
  });

  // Keep profile form synced strictly when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        companyName: currentUser.companyName || prev.companyName || 'Individual Customer',
      }));
    }
  }, [currentUser]);

  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Self Change Password Form State (in Settings)
  const [selfOldPassword, setSelfOldPassword] = useState<string>('');
  const [selfNewPassword, setSelfNewPassword] = useState<string>('');
  const [selfConfirmPassword, setSelfConfirmPassword] = useState<string>('');
  const [selfPasswordMsg, setSelfPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tax ID Placeholder helper based on region choice
  const getTaxIdPlaceholder = (type: string) => {
    switch (type) {
      case 'GSTIN (India)':
        return '22AAAAA0000A1Z5';
      case 'EIN (USA)':
        return '12-3456789';
      case 'VAT ID (EU)':
        return 'EU123456789';
      default:
        return 'TAX-987654321';
    }
  };

  // Function to save profile changes for current user
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newName = profileForm.name.trim();
    const newEmail = profileForm.email.trim();

    if (!newName || !newEmail) return;

    try {
      localStorage.setItem('shiptrack_customer_profile', JSON.stringify(profileForm));
    } catch (err) {}

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        name: newName,
        email: newEmail,
        role: currentRole,
        companyName: profileForm.companyName,
      });
    }

    const currEmail = (currentUser?.email || profileForm.email).toLowerCase();

    try {
      const savedAccounts = localStorage.getItem('shiptrack_accounts_db');
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        const updated = parsed.map((acc: any) => {
          if (acc.email.toLowerCase() === currEmail) {
            return { ...acc, name: newName, email: newEmail, companyName: profileForm.companyName };
          }
          return acc;
        });
        localStorage.setItem('shiptrack_accounts_db', JSON.stringify(updated));
      }
    } catch (e) {}

    setProfileSuccessMsg(`Profile updated successfully! Display name is now "${newName}".`);
  };

  // Self Password Change Handler
  const handleSelfChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSelfPasswordMsg(null);

    if (!selfOldPassword) {
      setSelfPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (selfNewPassword !== selfConfirmPassword) {
      setSelfPasswordMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (selfNewPassword.length < 6) {
      setSelfPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      const savedAccounts = localStorage.getItem('shiptrack_accounts_db');
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        const currEmail = (currentUser?.email || profileForm.email).toLowerCase();
        const updated = parsed.map((acc: any) => {
          if (acc.email.toLowerCase() === currEmail) {
            return { ...acc, password: selfNewPassword.trim() };
          }
          return acc;
        });
        localStorage.setItem('shiptrack_accounts_db', JSON.stringify(updated));
      }

      setSelfPasswordMsg({ type: 'success', text: 'Your account password has been updated successfully!' });
      setSelfOldPassword('');
      setSelfNewPassword('');
      setSelfConfirmPassword('');
    } catch (err) {
      setSelfPasswordMsg({ type: 'error', text: 'Failed to update password. Please try again.' });
    }
  };

  return (
    <div className="space-y-6">

      {/* PROFILE MANAGEMENT */}
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              {currentRole} Account Profile Details
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              View your account details and edit personal contact information and account settings below.
            </p>
          </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Role: {currentRole}
            </span>
          </div>

          {/* Active Profile Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shrink-0 shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{profileForm.name}</h4>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                    Active Account
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{profileForm.email}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                  <span>Phone: <strong className="text-slate-200">{profileForm.phone}</strong></span>
                  <span>•</span>
                  <span>ID: <code className="text-blue-400 font-mono">USR-ACC-9402</code></span>
                </div>
              </div>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 text-xs shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
              <button onClick={() => setProfileSuccessMsg(null)} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
            </div>
          )}

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs bg-slate-850/60 p-5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-400" />
              Edit Account Information & Preferences
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name / Display Name *</label>
                <input
                  required
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="e.g. aarav.sharma@gmail.com"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization / Company Name</label>
                <input
                  type="text"
                  value={profileForm.companyName}
                  onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                  placeholder="e.g. Individual Customer or Enterprise"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </button>
            </div>
          </form>

          {/* Change Account Password Section */}
          <div className="bg-slate-850/60 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Change Account Password
            </h4>

            <p className="text-slate-400">
              Update your account password below. The new password will take effect immediately.
            </p>

            {selfPasswordMsg && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                selfPasswordMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {selfPasswordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{selfPasswordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSelfChangePassword} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Password *</label>
                <input
                  required
                  type="password"
                  value={selfOldPassword}
                  onChange={(e) => setSelfOldPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Password *</label>
                  <input
                    required
                    type="password"
                    value={selfNewPassword}
                    onChange={(e) => setSelfNewPassword(e.target.value)}
                    placeholder="Min. 6 characters..."
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm New Password *</label>
                  <input
                    required
                    type="password"
                    value={selfConfirmPassword}
                    onChange={(e) => setSelfConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password..."
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                Update Password
              </button>
            </form>
          </div>
        </div>

    </div>
  );
};

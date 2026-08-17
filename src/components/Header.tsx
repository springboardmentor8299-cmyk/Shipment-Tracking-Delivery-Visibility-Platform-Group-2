import React, { useState } from 'react';
import { UserRole, AppNotification } from '../types';
import { 
  Truck, 
  Search, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Package, 
  ChevronDown, 
  MapPin, 
  Check, 
  Clock,
  AlertTriangle,
  X,
  LogOut,
  User
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id?: string) => void;
  onOpenAiAssistant: () => void;
  currentUser?: { name: string; email: string };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  notifications,
  onMarkNotificationRead,
  onOpenAiAssistant,
  currentUser,
  onLogout,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const unreadCount = notifications.filter(n => !n.read)?.length;

  const roles: { role: UserRole; label: string; desc: string; icon: any }[] = [
    { role: 'Customer', label: 'Customer', desc: 'Track packages & view POD', icon: Package },
    { role: 'Business Client', label: 'Business Client', desc: 'Book shipments & bulk logistics', icon: ShieldCheck },
    { role: 'Logistics Operator', label: 'Logistics Operator', desc: 'Live dispatch & driver telemetry', icon: Truck },
    { role: 'Support Agent', label: 'Support Agent', desc: 'Handle inquiries & status updates', icon: Users },
    { role: 'Administrator', label: 'Administrator', desc: 'System analytics & user management', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('tracking')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">ShipTrack</span>
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text font-black text-sm uppercase tracking-wider">Pro</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Shipment Tracking & Delivery Visibility</p>
            </div>
          </div>

          {/* Quick Tracking Search Bar */}
          <form onSubmit={onSearchSubmit} className="flex-1 max-w-md hidden md:block relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Tracking # (e.g. STP-9482-US)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-24 py-2 bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition shadow"
              >
                Track
              </button>
            </div>
          </form>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Assistant Copilot Trigger */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-medium shadow-sm transition transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden sm:inline">
                {localStorage.getItem('shiptrack_copilot_name') || 'Chatbot'}
              </span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifPopover && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-white">Notifications</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
                    </div>
                    <button
                      onClick={() => onMarkNotificationRead()}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                    {!notifications || notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center">No notifications yet</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs flex gap-3 hover:bg-slate-750 transition ${notif.read ? 'opacity-70' : 'bg-slate-800/90 font-medium'}`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
                            {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                            {notif.type === 'info' && <Clock className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{notif.title}</span>
                              <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                            </div>
                            <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">{notif.message}</p>
                            <span className="inline-block mt-1 text-[10px] text-blue-400 font-mono">{notif.trackingNumber}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Selector & Logged-In User Profile */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs text-white transition cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">{currentRole}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Log Out Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                  title="Sign Out / Exit Session"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden md:inline">Log Out</span>
                </button>
              )}

              {showRoleDropdown && (
                <div className="absolute right-0 top-10 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                  
                  {currentUser && (
                    <button
                      onClick={() => {
                        onTabChange('profile');
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left p-2.5 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg border border-blue-500/30 mb-2 space-y-0.5 transition cursor-pointer group"
                    >
                      <div className="text-[10px] text-blue-300 font-medium flex items-center justify-between">
                        <span>Logged in as {currentRole}:</span>
                        <span className="text-[10px] text-blue-400 font-semibold underline group-hover:text-white">Edit Profile</span>
                      </div>
                      <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-300 font-mono truncate">{currentUser.email}</div>
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Click here to view & edit profile</span>
                      </div>
                    </button>
                  )}

                  {currentRole === 'Administrator' ? (
                    <>
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                        Administrator Perspective Switcher
                      </div>

                      {roles.map((r) => {
                        const RoleIcon = r.icon;
                        const isSelected = currentRole === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              onRoleChange(r.role);
                              if (r.role === 'Customer') {
                                onTabChange('profile');
                              } else {
                                onTabChange('tracking');
                              }
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg transition text-xs cursor-pointer ${
                              isSelected ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40' : 'text-slate-200 hover:bg-slate-700/60'
                            }`}
                          >
                            <RoleIcon className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                            <div>
                              <div className="font-semibold">{r.label}</div>
                              <div className="text-[10px] text-slate-400">{r.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs space-y-2 my-1">
                      <button
                        onClick={() => {
                          onTabChange('profile');
                          setShowRoleDropdown(false);
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Open Customer Profile & Edits</span>
                      </button>
                      <p className="text-[10px] text-slate-400 leading-snug text-center">
                        Viewing as <strong>{currentRole}</strong>.
                      </p>
                    </div>
                  )}

                  {onLogout && (
                    <div className="pt-1.5 border-t border-slate-700/80 mt-1">
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left flex items-center gap-2 p-2 rounded-lg text-rose-300 hover:bg-rose-500/10 transition text-xs font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Log Out of Session
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Sub-Header Navigation Tabs Filtered by Active Role */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 text-xs border-t border-slate-800 scrollbar-none">
          {(() => {
            const roleTabsMap: Record<UserRole, { id: string; label: string }[]> = {
              Customer: [
                { id: 'dashboard', label: 'Customer Dashboard' },
                { id: 'tracking', label: 'My Package Tracking' },
                { id: 'management', label: 'Create Shipment Request' },
                { id: 'pod', label: 'Delivery Receipts' },
                { id: 'notifications', label: 'My Alerts & Updates' },
                { id: 'profile', label: 'My Profile & Edits' },
              ],
              'Business Client': [
                { id: 'dashboard', label: 'Executive Dashboard' },
                { id: 'tracking', label: 'Freight Tracking' },
                { id: 'management', label: 'Freight Booking & Orders' },
                { id: 'pod', label: 'POD Receipts' },
                { id: 'analytics', label: 'Business SLA Analytics' },
                { id: 'notifications', label: 'Freight Notifications' },
                { id: 'profile', label: 'Profile Settings' },
              ],
              'Logistics Operator': [
                { id: 'monitoring', label: 'Driver App & Today\'s Tasks' },
                { id: 'routes', label: 'Route Optimization' },
                { id: 'management', label: 'Shipment Dispatch' },
                { id: 'tracking', label: 'Shipment Lookup' },
                { id: 'pod', label: 'POD Receipts' },
                { id: 'notifications', label: 'Dispatch Alerts' },
                { id: 'profile', label: 'Profile Settings' },
              ],
              'Support Agent': [
                { id: 'dashboard', label: 'Support Desk Console' },
                { id: 'tracking', label: '360° Package Lookup' },
                { id: 'management', label: 'Exception Resolution' },
                { id: 'pod', label: 'Verify POD Signatures' },
                { id: 'notifications', label: 'Support Desk Alerts' },
                { id: 'reports', label: 'Audit Reports' },
                { id: 'profile', label: 'Profile Settings' },
              ],
              Administrator: [
                { id: 'dashboard', label: 'Control Tower' },
                { id: 'tracking', label: 'Track Shipment' },
                { id: 'management', label: 'Global Shipments' },
                { id: 'monitoring', label: 'Live GPS Monitoring' },
                { id: 'routes', label: 'Route Management' },
                { id: 'pod', label: 'Proof of Delivery & Receipts' },
                { id: 'notifications', label: 'Notifications & Alerts' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'reports', label: 'Reports & Export' },
                { id: 'users', label: 'User Roles' },
                { id: 'profile', label: 'My Profile & Edits' },
              ],
            };

            const availableTabs = roleTabsMap[currentRole] || roleTabsMap.Customer;

            return availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ));
          })()}
        </div>
      </div>
    </header>
  );
};

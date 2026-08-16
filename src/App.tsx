import React, { useState, useEffect } from 'react';
import { UserRole, Shipment, AppNotification, ShipmentStatus } from './types';
import { Header } from './components/Header';
import { ShipmentTracker } from './components/ShipmentTracker';
import { ShipmentManagement } from './components/ShipmentManagement';
import { LiveMonitoring } from './components/LiveMonitoring';
import { RouteManagement } from './components/RouteManagement';
import { PODManagement } from './components/PODManagement';
import { NotificationModule } from './components/NotificationModule';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ReportsExport } from './components/ReportsExport';
import { UserRoleManagement } from './components/UserRoleManagement';
import { ProofOfDeliveryModal } from './components/ProofOfDeliveryModal';
import { AILogisticsAssistant } from './components/AILogisticsAssistant';
import { LoginScreen } from './components/LoginScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DriverDashboard } from './components/DriverDashboard';
import { SupportConsole } from './components/SupportConsole';
import { AdminControlTower } from './components/AdminControlTower';
import { User, Building2, Truck, Users, ShieldCheck, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('shiptrack_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: UserRole; companyName?: string } | null>(() => {
    const saved = localStorage.getItem('shiptrack_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => currentUser?.role || 'Customer');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('STP-9482-IN');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchNotFoundMsg, setSearchNotFoundMsg] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showPodModal, setShowPodModal] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const handleUpdateCurrentUser = (updatedUser: { name: string; email: string; role: UserRole; companyName?: string }) => {
    setCurrentUser(updatedUser);
    setCurrentRole(updatedUser.role);
    localStorage.setItem('shiptrack_user', JSON.stringify(updatedUser));
  };

  // Auto-switch tab if current tab is not allowed for currentRole
  useEffect(() => {
    const roleTabsMap: Record<UserRole, string[]> = {
      Customer: ['dashboard', 'tracking', 'management', 'pod', 'notifications', 'profile'],
      'Business Client': ['dashboard', 'tracking', 'management', 'pod', 'analytics', 'notifications', 'profile'],
      'Logistics Operator': ['monitoring', 'routes', 'management', 'tracking', 'pod', 'notifications', 'profile'],
      'Support Agent': ['dashboard', 'pod', 'tracking', 'management', 'notifications', 'reports', 'profile'],
      Administrator: ['dashboard', 'tracking', 'management', 'monitoring', 'routes', 'pod', 'notifications', 'analytics', 'reports', 'users', 'profile'],
    };

    const allowed = roleTabsMap[currentRole] || roleTabsMap.Customer;
    if (!allowed.includes(activeTab)) {
      setActiveTab(allowed[0]);
    }
  }, [currentRole, activeTab]);

  const handleLogin = (user: { name: string; email: string; role: UserRole; companyName?: string }) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);

    const defaultTabByRole: Record<UserRole, string> = {
      Customer: 'dashboard',
      'Business Client': 'dashboard',
      'Logistics Operator': 'monitoring',
      'Support Agent': 'dashboard',
      Administrator: 'dashboard',
    };
    setActiveTab(defaultTabByRole[user.role] || 'dashboard');

    localStorage.setItem('shiptrack_auth', 'true');
    localStorage.setItem('shiptrack_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedShipment(null);
    setActiveTab('dashboard');
    localStorage.removeItem('shiptrack_auth');
    localStorage.removeItem('shiptrack_user');
  };

  // Fetch initial data from server
  const fetchShipments = async () => {
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
      }
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchShipments();
      fetchNotifications();
    }, 15000); // Periodic live sync
    return () => clearInterval(interval);
  }, []);

  // Synchronize selectedShipment with shipments and searchQuery
  useEffect(() => {
    if (shipments?.length === 0) return;

    // 1. If searchQuery matches a shipment, keep selectedShipment synced
    const matchByQuery = shipments.find(s => s.trackingNumber.toUpperCase() === searchQuery.trim().toUpperCase());
    if (matchByQuery) {
      if (!selectedShipment || selectedShipment.id !== matchByQuery.id || selectedShipment !== matchByQuery) {
        setSelectedShipment(matchByQuery);
      }
      return;
    }

    // 2. Otherwise if selectedShipment exists in shipments, sync latest object reference
    if (selectedShipment) {
      const matchById = shipments.find(s => s.id === selectedShipment.id);
      if (matchById && matchById !== selectedShipment) {
        setSelectedShipment(matchById);
      }
      return;
    }

    // 3. Fallback: select first shipment and update searchQuery
    setSelectedShipment(shipments[0]);
    setSearchQuery(shipments[0].trackingNumber);
  }, [searchQuery, shipments]);

  // Tracking Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toUpperCase();
    const match = shipments.find(s => s.trackingNumber.toUpperCase() === query) ||
                  shipments.find(s => s.trackingNumber.toUpperCase().includes(query)) ||
                  shipments.find(s => s.id.toUpperCase() === query);

    if (match) {
      setSelectedShipment(match);
      setSearchQuery(match.trackingNumber);
      setSearchNotFoundMsg(null);
      setActiveTab('tracking');
    } else {
      const partialMatch = shipments.find(s => 
        s.receiverName.toUpperCase().includes(query) || 
        s.senderName.toUpperCase().includes(query) ||
        s.packageType.toUpperCase().includes(query)
      );
      if (partialMatch) {
        setSelectedShipment(partialMatch);
        setSearchQuery(partialMatch.trackingNumber);
        setSearchNotFoundMsg(null);
      } else {
        setSearchNotFoundMsg(`Tracking number "${query}" not found. Please check and try again.`);
      }
      setActiveTab('tracking');
    }
  };

  // Create Shipment Handler
  const handleCreateShipment = async (data: any) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newShipment = await res.json();
        setShipments(prev => [newShipment, ...prev]);
        setSelectedShipment(newShipment);
        setSearchQuery(newShipment.trackingNumber);
        if (activeTab !== 'dashboard') {
          setActiveTab('tracking');
        }
      }
    } catch (err) {
      console.error('Create shipment error:', err);
    }
  };

  // Status Update Handler
  const handleUpdateStatus = async (id: string, status: ShipmentStatus, location: string, note: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, location, note, updatedBy: currentRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (selectedShipment?.id === updated.id) {
          setSelectedShipment(updated);
        }
        fetchNotifications();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Full Shipment Update Handler
  const handleUpdateShipment = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, updatedBy: currentRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (selectedShipment?.id === updated.id) {
          setSelectedShipment(updated);
        }
        fetchNotifications();
      }
    } catch (err) {
      console.error('Update shipment error:', err);
    }
  };

  // Shipment Cancellation Handler
  const handleCancelShipment = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, cancelledBy: currentRole }),
      });
      if (res.ok) {
        const result = await res.json();
        setShipments(prev => prev.map(s => s.id === id ? result.shipment : s));
        if (selectedShipment?.id === id) {
          setSelectedShipment(result.shipment);
        }
        fetchNotifications();
      }
    } catch (err) {
      console.error('Cancel shipment error:', err);
    }
  };

  // Proof of Delivery Submit Handler
  const handleSubmitPod = async (shipmentId: string, podData: any) => {
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/pod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(podData),
      });
      if (res.ok) {
        const result = await res.json();
        setShipments(prev => prev.map(s => s.id === shipmentId ? result.shipment : s));
        if (selectedShipment?.id === shipmentId) {
          setSelectedShipment(result.shipment);
        }
        fetchNotifications();
      }
    } catch (err) {
      console.error('POD submit error:', err);
    }
  };

  // Mark Notifications Read
  const handleMarkNotificationsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error('Mark read error:', err);
      // Fallback local update
      setNotifications(prev => prev.map(n => id && n.id !== id ? n : { ...n, read: true }));
    }
  };

  const handleAddNotification = (newNotif: AppNotification) => {
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
        
        {/* Navbar Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationsRead}
          onOpenAiAssistant={() => setShowAiAssistant(true)}
          currentUser={currentUser || undefined}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Initializing ShipTrack Pro Fleet Telemetry...</p>
            </div>
          ) : (
            <>
              {searchNotFoundMsg && (
                <div className="bg-rose-950/90 border border-rose-500/40 text-rose-200 p-4 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xl mb-6 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 text-rose-300 rounded-lg">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <span className="font-bold block text-sm text-white">Tracking Number Not Found</span>
                      <span>{searchNotFoundMsg}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSearchNotFoundMsg(null)}
                    className="p-1.5 hover:bg-rose-900/60 rounded-lg text-rose-300 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {activeTab === 'tracking' && (
                <ShipmentTracker
                  shipment={selectedShipment}
                  allShipments={shipments}
                  userRole={currentRole}
                  onSelectShipment={(s) => {
                    setSelectedShipment(s);
                    setSearchQuery(s.trackingNumber);
                  }}
                  onOpenPodModal={() => setShowPodModal(true)}
                  onOpenAiPredictor={() => setShowAiAssistant(true)}
                />
              )}

              {activeTab === 'management' && (
                <ShipmentManagement
                  shipments={shipments}
                  userRole={currentRole}
                  onSelectShipment={(s) => {
                    setSelectedShipment(s);
                    setSearchQuery(s.trackingNumber);
                    setActiveTab('tracking');
                  }}
                  onCreateShipment={handleCreateShipment}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateShipment={handleUpdateShipment}
                  onCancelShipment={handleCancelShipment}
                />
              )}

              {activeTab === 'monitoring' && (
                currentRole === 'Logistics Operator' ? (
                  <DriverDashboard
                    currentUser={currentUser}
                    shipments={shipments}
                    onUpdateStatus={handleUpdateStatus}
                    onSubmitPod={handleSubmitPod}
                  />
                ) : (
                  <LiveMonitoring shipments={shipments} />
                )
              )}

              {activeTab === 'routes' && (
                <RouteManagement shipments={shipments} />
              )}

              {activeTab === 'pod' && (
                currentRole === 'Support Agent' ? (
                  <SupportConsole
                    shipments={shipments}
                    onUpdateShipmentPod={handleSubmitPod}
                    onUpdateStatus={handleUpdateStatus}
                    onRefreshData={fetchShipments}
                    onSelectShipmentToTrack={(s) => {
                      setSelectedShipment(s);
                      setActiveTab('tracking');
                    }}
                  />
                ) : (
                  <PODManagement shipments={shipments} onUpdateShipmentPod={handleSubmitPod} />
                )
              )}

              {activeTab === 'notifications' && (
                <NotificationModule
                  notifications={notifications}
                  shipments={shipments}
                  onAddNotification={handleAddNotification}
                  onMarkAllAsRead={() => handleMarkNotificationsRead()}
                  onClearNotifications={handleClearNotifications}
                />
              )}

              {(activeTab === 'analytics' || activeTab === 'dashboard') && (
                currentRole === 'Administrator' ? (
                  <AdminControlTower
                    shipments={shipments}
                    currentUser={currentUser || undefined}
                    onUpdateShipmentStatus={handleUpdateStatus}
                    onRefreshData={fetchShipments}
                    onSelectShipmentToTrack={(s) => {
                      setSelectedShipment(s);
                      setActiveTab('tracking');
                    }}
                    onRoleChange={(r: string) => setCurrentRole(r)}
                  />
                ) : currentRole === 'Support Agent' ? (
                  <SupportConsole
                    shipments={shipments}
                    onUpdateShipmentPod={handleSubmitPod}
                    onUpdateStatus={handleUpdateStatus}
                    onRefreshData={fetchShipments}
                    onSelectShipmentToTrack={(s) => {
                      setSelectedShipment(s);
                      setActiveTab('tracking');
                    }}
                  />
                ) : (
                  <AnalyticsDashboard 
                    userRole={currentRole} 
                    shipments={shipments}
                    currentUser={currentUser}
                    onSelectShipment={(s) => {
                      setSelectedShipment(s);
                      setActiveTab('tracking');
                    }}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onCreateShipment={handleCreateShipment}
                  />
                )
              )}

              {activeTab === 'reports' && (
                <ReportsExport shipments={shipments} />
              )}

              {(activeTab === 'users' || activeTab === 'profile') && (
                <UserRoleManagement
                  currentRole={currentRole}
                  onRoleChange={setCurrentRole}
                  currentUser={currentUser}
                  onUpdateCurrentUser={handleUpdateCurrentUser}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  initialSubTab="profile"
                />
              )}

              {!['dashboard', 'tracking', 'management', 'monitoring', 'routes', 'pod', 'notifications', 'analytics', 'reports', 'users', 'profile'].includes(activeTab) && (
                <ShipmentTracker
                  shipment={selectedShipment}
                  onOpenPodModal={() => setShowPodModal(true)}
                  onOpenAiPredictor={() => setShowAiAssistant(true)}
                />
              )}
            </>
          )}

        </main>

        {/* Proof of Delivery Modal */}
        {showPodModal && selectedShipment && (
          <ProofOfDeliveryModal
            shipment={selectedShipment}
            userRole={currentRole}
            onClose={() => setShowPodModal(false)}
            onSubmitPod={handleSubmitPod}
          />
        )}

        {/* AI Assistant Copilot Drawer */}
        <AILogisticsAssistant
          isOpen={showAiAssistant}
          onClose={() => setShowAiAssistant(false)}
          userRole={currentRole}
          shipments={shipments}
        />

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900 py-6 text-slate-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:items-center">
            <p>© 2026 ShipTrack Pro Inc. - Full-Stack Real-Time Shipment Tracking & Visibility Platform.</p>
            <div className="mt-2 sm:mt-0 flex justify-center space-x-4 text-[11px] text-slate-500 font-mono">
              <span><p>Server: Express + Vite • AI: ShipTrack Predictive Engine • SLA: 99.98%</p></span>
              <span>•</span>
              <span> </span>
              <span>•</span>
              <span>SLA: 99.98%</span>
            </div>
          </div>
        </footer>

      </div>
    </ErrorBoundary>
  );
}

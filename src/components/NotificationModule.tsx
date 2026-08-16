import React, { useState } from 'react';
import { Shipment, AppNotification, NotificationCategory, NotificationChannel, NotificationChannelPreferences } from '../types';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter, 
  Search, 
  Settings, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Radio, 
  Volume2, 
  Copy, 
  Check, 
  Eye, 
  Trash2, 
  Plus, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NotificationModuleProps {
  notifications: AppNotification[];
  shipments: Shipment[];
  onAddNotification?: (notif: AppNotification) => void;
  onMarkAllAsRead?: () => void;
  onClearNotifications?: () => void;
}

export const NotificationModule: React.FC<NotificationModuleProps> = ({
  notifications,
  shipments,
  onAddNotification,
  onMarkAllAsRead,
  onClearNotifications
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'preferences'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dispatch Form State
  const [targetShipmentId, setTargetShipmentId] = useState<string>(shipments[0]?.id || '');
  const [notificationCategory, setNotificationCategory] = useState<NotificationCategory>('Shipment Update');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<string | null>(null);

  // Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationChannelPreferences>({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    notifyOnShipmentUpdate: true,
    notifyOnEtaUpdate: true,
    notifyOnDeliveryAlert: true,
    notifyOnDelayWarning: true,
    smsPhoneNumber: '+1 (555) 948-2041',
    notificationEmail: 'dispatch-alerts@global-logistics.com',
  });

  // Selected Notification for Live Device Preview
  const [previewNotification, setPreviewNotification] = useState<AppNotification | null>(notifications[0] || null);

  // Filtered Notification Feed
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesChannel = selectedChannel === 'All' || (n.channels && n.channels.includes(selectedChannel as NotificationChannel));

    return matchesSearch && matchesCategory && matchesChannel;
  });

  const selectedShipment = shipments.find(s => s.id === targetShipmentId) || shipments[0];

  // Quick Preset Dispatch Templates
  const handleApplyTemplate = (category: NotificationCategory) => {
    setNotificationCategory(category);
    if (!selectedShipment) return;

    if (category === 'Shipment Update') {
      setCustomTitle(`Shipment #${selectedShipment.trackingNumber} Location Update`);
      setCustomMessage(`Package is currently in transit near ${selectedShipment.currentLocation?.city || 'the logistics hub'}. Priority: ${selectedShipment.priority}.`);
    } else if (category === 'ETA Update') {
      setCustomTitle(`Recalculated Arrival for #${selectedShipment.trackingNumber}`);
      setCustomMessage(`Estimated arrival time recalculated to ${selectedShipment.estimatedDeliveryTime} based on real-time traffic conditions.`);
    } else if (category === 'Delivery Alert') {
      setCustomTitle(`Delivery Doorstep Alert for #${selectedShipment.trackingNumber}`);
      setCustomMessage(`Your package has arrived at ${selectedShipment.receiverAddress.city}. Driver is making final delivery approach!`);
    } else if (category === 'Delay Warning') {
      setCustomTitle(`Delay Warning Advisory for #${selectedShipment.trackingNumber}`);
      setCustomMessage(`Risk level: ${selectedShipment.aiPredictedDelayRisk || 'High'}. ${selectedShipment.aiDelayReason || 'Potential congestion on delivery corridor.'}`);
    }
  };

  // Handle Multi-Channel Broadcast
  const handleDispatchNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    const channels: NotificationChannel[] = ['In-App'];
    if (sendEmail) channels.push('Email');
    if (sendSms) channels.push('SMS');
    if (sendPush) channels.push('Push');

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      trackingNumber: selectedShipment.trackingNumber,
      title: customTitle || `${notificationCategory}: #${selectedShipment.trackingNumber}`,
      message: customMessage || `Status updated for shipment bound to ${selectedShipment.receiverAddress.city}.`,
      type: notificationCategory === 'Delay Warning' ? 'warning' : notificationCategory === 'Delivery Alert' ? 'success' : 'info',
      category: notificationCategory,
      channels,
      recipientEmail: selectedShipment.receiverEmail || preferences.notificationEmail,
      recipientPhone: selectedShipment.receiverPhone || preferences.smsPhoneNumber,
      timestamp: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    if (onAddNotification) {
      onAddNotification(newNotif);
    }

    setPreviewNotification(newNotif);
    setDispatchSuccessToast(`Dispatched via ${channels.join(', ')} to ${selectedShipment.trackingNumber}!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => setDispatchSuccessToast(null), 4000);
    setCustomTitle('');
    setCustomMessage('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              Alert Center
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Alerts & Notifications
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time shipment status updates, delivery alerts, and subscription preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'feed'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          Live Alert Log ({notifications.length})
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Subscription Settings
        </button>
      </div>

      {/* TAB 1: LIVE ALERT LOG */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracking #, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <span className="text-slate-400 px-2 font-semibold text-[11px]">Type:</span>
                {['All', 'Shipment Update', 'ETA Update', 'Delivery Alert', 'Delay Warning'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition text-[11px] whitespace-nowrap ${
                      selectedCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition shadow-lg ${
                  notif.type === 'warning' 
                    ? 'bg-amber-500/5 border-amber-500/30' 
                    : notif.type === 'success'
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : notif.type === 'alert'
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl text-white mt-0.5 shrink-0 ${
                      notif.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      notif.type === 'alert' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {notif.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                       notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                       notif.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                          #{notif.trackingNumber}
                        </span>
                        {notif.category && (
                          <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                            {notif.category}
                          </span>
                        )}
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" title="Unread Alert" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">{notif.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono block">{notif.timestamp}</span>
                    <button
                      onClick={() => setPreviewNotification(notif)}
                      className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CHANNEL & SUBSCRIPTION SETTINGS */}
      {activeTab === 'preferences' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Subscriber Notification Preferences & Gateways
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle multi-channel communication pipelines and set fallback recipient contacts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channel Toggles */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Broadcasting Channels</h4>
              
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block">Email Notifications (SendGrid)</span>
                      <span className="text-[10px] text-slate-400">Receive rich HTML shipment milestones</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailEnabled}
                    onChange={(e) => setPreferences({ ...preferences, emailEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block">SMS Notifications (Twilio)</span>
                      <span className="text-[10px] text-slate-400">Instant doorstep and driver proximity texts</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsEnabled}
                    onChange={(e) => setPreferences({ ...preferences, smsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="font-bold text-white block">Web Push Notifications</span>
                      <span className="text-[10px] text-slate-400">Browser desktop popups with audio chiming</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.pushEnabled}
                    onChange={(e) => setPreferences({ ...preferences, pushEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            {/* Event Category Trigger Preferences */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Trigger Event Rules</h4>
              
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-200">(i) Shipment Status Updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifyOnShipmentUpdate}
                    onChange={(e) => setPreferences({ ...preferences, notifyOnShipmentUpdate: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-200">(ii) ETA Recalculation Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifyOnEtaUpdate}
                    onChange={(e) => setPreferences({ ...preferences, notifyOnEtaUpdate: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-200">(iii) Delivery Doorstep Confirmations</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifyOnDeliveryAlert}
                    onChange={(e) => setPreferences({ ...preferences, notifyOnDeliveryAlert: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-200">(iv) AI Delay Hazard Warnings</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifyOnDelayWarning}
                    onChange={(e) => setPreferences({ ...preferences, notifyOnDelayWarning: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

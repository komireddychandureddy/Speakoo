import { useState } from 'react';
import { X, Bell } from 'lucide-react';
import { NOTIFICATIONS } from '../../data/mockData';

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-80 h-full bg-white shadow-xl flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#43A047]" />
            <span className="font-semibold text-gray-900">Notifications</span>
            {unread > 0 && (
              <span className="bg-[#43A047] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Mark all read */}
        {unread > 0 && (
          <div className="px-4 py-2 border-b border-[#EEEEEE]">
            <button
              onClick={markAllRead}
              className="text-xs text-[#43A047] font-medium hover:underline"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Bell size={32} />
              <p className="mt-2 text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-4 py-3 border-b border-[#EEEEEE] ${
                  !notif.isRead ? 'bg-[#FFFBE4]' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">
                    {notif.type === 'booking' ? '📅' : notif.type === 'reminder' ? '⏰' : '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#43A047] flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, Briefcase, CalendarDays, ShieldAlert, User } from 'lucide-react';

const WORKER_TABS = [
  { label: 'Shifts', path: '/MyShifts', icon: CalendarDays },
  { label: 'Open', path: '/AvailableShifts', icon: Briefcase },
  { label: 'Incidents', path: '/WorkerIncidents', icon: ShieldAlert },
  { label: 'Alerts', path: '/NotificationsCenter', icon: Bell },
  { label: 'Profile', path: '/WorkerProfile', icon: User },
];

const ADMIN_TABS = [
  { label: 'Roster', path: '/Rostering', icon: CalendarDays },
  { label: 'Incidents', path: '/Incidents', icon: ShieldAlert },
  { label: 'Alerts', path: '/NotificationsCenter', icon: Bell },
  { label: 'Profile', path: '/WorkerProfile', icon: User },
];

interface User {
  id: string;
  organization_id: string;
  role?: string;
  position?: string;
}

interface Props {
  user?: User | null;
}

export default function BottomNav({ user }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['bottom-nav-user'],
    queryFn: () => base44.auth.me(),
    enabled: !user,
  });

  const activeUser = user || currentUser;

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ['bottom-nav-notifications', activeUser?.id],
    queryFn: () =>
      base44.entities.Notification.filter({
        user_id: activeUser?.id,
        organization_id: activeUser?.organization_id,
        is_read: false,
      }, '-created_date', 20),
    enabled: !!activeUser?.id && !!activeUser?.organization_id,
  });

  if (!activeUser) return null;

  const isAdmin = activeUser.role === 'admin' || activeUser.position === 'manager' || activeUser.position === 'coordinator';
  const tabs = isAdmin ? ADMIN_TABS : WORKER_TABS;
  const unreadCount = unreadNotifications.length;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-slate-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-xl md:hidden">
      <div className={`mx-auto grid max-w-3xl gap-1 ${tabs.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const isBell = tab.path === '/NotificationsCenter';

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`relative flex min-h-[52px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition-all ${
                isActive ? 'bg-white text-slate-950 shadow-lg' : 'text-white/70 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className="mb-1 h-5 w-5" />
                {isBell && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

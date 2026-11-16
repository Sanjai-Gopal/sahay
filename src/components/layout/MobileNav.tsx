import React, { useEffect } from 'react';
import {
  Menu,
  X,
  Leaf,
  Home,
  Gamepad2,
  Clock,
  Users,
  TrendingUp,
  Heart,
  Settings as SettingsGear,
  Calendar,
  Phone,
  MoreHorizontal,
  LogOut,
} from 'lucide-react';
import { PageId, UserRole } from '../../types';

interface MobileNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
  onOpenSos: () => void;
  onLogout?: () => void;
  userRole?: UserRole;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  isDrawerOpen,
  onOpenDrawer,
  onCloseDrawer,
  onOpenSos,
  onLogout,
  userRole = 'companion',
}) => {
  const isCompanion = userRole === 'companion';

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const allNavItems: { id: PageId; label: string; icon: React.ElementType; companionOnly?: boolean }[] = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'activities', label: 'Activities', icon: Gamepad2, companionOnly: true },
    { id: 'reminders', label: 'Reminders', icon: Clock },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'family', label: isCompanion ? 'Memory Book' : 'Family Dashboard', icon: isCompanion ? Heart : Users },
    { id: 'insights', label: isCompanion ? 'My Insights' : 'Care Insights', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SettingsGear },
  ];

  const navItems = allNavItems.filter((item) => !item.companionOnly || isCompanion);

  const bottomNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    ...(isCompanion
      ? [{ id: 'activities', label: 'Activities', icon: Gamepad2 }]
      : [{ id: 'insights', label: 'Insights', icon: TrendingUp }]),
    { id: 'reminders', label: 'Reminders', icon: Clock },
    { id: 'family', label: isCompanion ? 'Memory' : 'Family', icon: isCompanion ? Heart : Users },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header
        role="banner"
        className="md:hidden flex items-center justify-between px-4 py-3 bg-[#22403A] text-[#FBF7EE] sticky top-0 z-40 shadow-xs"
      >
        <div className="flex items-center gap-2 font-fraunces text-lg font-semibold">
          <div className="w-8 h-8 rounded-lg bg-[#E2A33D] text-[#152B26] flex items-center justify-center">
            <Leaf className="w-4 h-4" aria-hidden="true" />
          </div>
          <span>Sahay</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Quick SOS button */}
          <button
            onClick={onOpenSos}
            aria-label="Emergency SOS call"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#BD5B3B]/20 text-[#F0AF97] border border-[#BD5B3B]/40 font-baloo font-bold text-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#BD5B3B] animate-ping" aria-hidden="true" />
            <Phone className="w-3 h-3" aria-hidden="true" />
            <span>SOS</span>
          </button>

          {/* Menu Drawer Toggle */}
          <button
            onClick={onOpenDrawer}
            aria-label="Open mobile navigation menu"
            aria-expanded={isDrawerOpen}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-[#E2A33D]"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Drawer Backdrop Overlay */}
      {isDrawerOpen && (
        <div
          onClick={onCloseDrawer}
          aria-hidden="true"
          className="fixed inset-0 bg-[#152B26]/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={`fixed top-0 left-0 bottom-0 w-[78%] max-w-[300px] bg-[#22403A] text-[#FBF7EE] z-50 p-6 flex flex-col transition-transform duration-300 md:hidden shadow-2xl ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5 font-fraunces text-xl font-semibold">
            <div className="w-9 h-9 rounded-xl bg-[#E2A33D] text-[#152B26] flex items-center justify-center">
              <Leaf className="w-4 h-4" aria-hidden="true" />
            </div>
            <span>Sahay</span>
          </div>
          <button
            onClick={onCloseDrawer}
            aria-label="Close navigation menu"
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2A33D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Mobile menu navigation" className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseDrawer();
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-baloo font-semibold text-sm transition-all cursor-pointer text-left min-h-[44px] focus-visible:outline-2 focus-visible:outline-[#E2A33D] ${
                  isActive
                    ? 'bg-[#E2A33D]/20 text-[#E2A33D] font-bold'
                    : 'text-[#C9D6D0] hover:bg-white/5 hover:text-[#FBF7EE]'
                }`}
              >
                <Icon className="w-4 h-4 opacity-90" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 space-y-2.5">
          {onLogout && (
            <button
              onClick={() => {
                onCloseDrawer();
                onLogout();
              }}
              aria-label="Log out"
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 text-[#C9D6D0] hover:text-white font-baloo font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Logout</span>
            </button>
          )}

          <button
            onClick={() => {
              onCloseDrawer();
              onOpenSos();
            }}
            aria-label="Open emergency assistance"
            className="w-full py-3 px-3 rounded-full bg-[#BD5B3B]/25 text-[#F0AF97] border border-[#BD5B3B]/40 font-baloo font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* Accessible Mobile Bottom Navigation Bar (WCAG AA Compliant) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6DAB9] px-2 py-1.5 flex items-center justify-around z-30 shadow-[0_-4px_16px_rgba(34,31,27,0.06)]"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as PageId)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 font-baloo font-bold text-[11px] cursor-pointer transition-colors relative focus-visible:outline-2 focus-visible:outline-[#22403A] rounded-xl ${
                isActive ? 'text-[#22403A]' : 'text-[#575246] hover:text-[#221F1B]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2A33D] absolute bottom-0.5" aria-hidden="true" />
              )}
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={onOpenDrawer}
          aria-label="Open more menu options"
          aria-expanded={isDrawerOpen}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 font-baloo font-bold text-[11px] text-[#575246] hover:text-[#221F1B] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#22403A] rounded-xl"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};

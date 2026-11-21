import React from 'react';
import { Activity, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Sidebar({
  navItems = [],
  activeSection,
  onSelectSection,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onExitDemo,
  notificationCount = 0,
}) {
  const { t } = useLanguage();

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-[#0B1728] transition-all duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[76px]' : 'w-[264px]'}`}
      >
        {/* Header Branding */}
        <div
          className={`flex h-[72px] items-center border-b border-white/5 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          <button
            onClick={onExitDemo}
            className="flex min-w-0 items-center gap-3 text-left focus:outline-none"
            title="Back to CareBridge AI home"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-accent-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <Activity size={21} />
            </span>
            {!collapsed && (
              <span>
                <span className="block whitespace-nowrap font-bold text-white">
                  CareBridge <b className="text-accent-cyan font-extrabold">AI</b>
                </span>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  {t('Care coordination')}
                </span>
              </span>
            )}
          </button>

          {!collapsed && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-2 text-text-muted hover:bg-white/5 lg:hidden focus:outline-none"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Workspace Label */}
        {!collapsed && (
          <div className="px-4 pb-2 pt-4">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              {t('Workspace')}
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map(({ label, icon: Icon }) => {
            const isActive = activeSection === label;
            return (
              <button
                key={label}
                title={collapsed ? t(label) : undefined}
                onClick={() => onSelectSection(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-300/10 font-medium text-accent-cyan border border-cyan-300/20'
                    : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{t(label)}</span>}
                {!collapsed && label === 'Notifications' && notificationCount > 0 && (
                  <span className="ml-auto rounded-full bg-health-error/20 px-1.5 py-0.5 text-[10px] font-semibold text-health-error border border-health-error/30">
                    {notificationCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Collapse Button */}
        <div className="border-t border-white/5 p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-3">
              <p className="text-xs font-medium text-white">{t('Demo workspace')}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                {t('Sample interface · no real patient data')}
              </p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-text-muted hover:bg-white/5 hover:text-white transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <>
                <PanelLeftClose size={17} />
                <span>{t('Collapse sidebar')}</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Menu, X, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';

export default function Navbar({ onOpenAuth, onOpenGetStarted, currentUser, onLogout, onOpenDashboard }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07111F]/90 backdrop-blur-md border-b border-[rgba(0,212,255,0.12)] py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#3478F6] p-[1.5px] shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#00D4FF] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#F8FAFC] flex items-center gap-1">
                CareBridge <span className="text-[#00D4FF]">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#71849A] font-semibold -mt-1">
                HealthTech
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-[#A9BCD0] hover:text-[#00D4FF] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#00D4FF] hover:after:w-full after:transition-all after:duration-300"
              >
                {t(link.label)}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3.5">
            <LanguageSwitcher compact />
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101F33] hover:bg-[#152740] border border-cyan-500/30 text-xs font-semibold text-white transition-colors"
                >
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'CB'}
                  </span>
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/50">
                    {currentUser.role}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                >
                  Log out
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenAuth('login', 'Patient')}
                >
                  {t('Login')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={ArrowRight}
                  onClick={onOpenGetStarted}
                >
                  {t('Get Started')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-[#A9BCD0] hover:text-[#F8FAFC] hover:bg-[#101F33] border border-white/5 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#0B1728]/95 backdrop-blur-xl border-b border-[rgba(0,212,255,0.15)] px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2 mb-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-4 py-3 rounded-xl text-base font-medium text-[#A9BCD0] hover:text-[#00D4FF] hover:bg-[#101F33] transition-colors"
              >
                {t(link.label)}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
            <LanguageSwitcher />
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#101F33]">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'CB'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                    <p className="text-xs text-cyan-400">{currentUser.role}</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenDashboard();
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full justify-center text-rose-400"
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth('login', 'Patient');
                  }}
                >
                  {t('Login')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  rightIcon={ArrowRight}
                  onClick={() => {
                    setIsOpen(false);
                    onOpenGetStarted();
                  }}
                >
                  {t('Get Started')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

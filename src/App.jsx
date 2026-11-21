import React, { useState } from 'react';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import LandingPage from './pages/LandingPage';
import AuthModal from './components/AuthModal';
import { ToastProvider } from './components/ui/Toast';
import DashboardApp from './pages/DashboardApp';
import { LanguageProvider } from './i18n/LanguageContext';
import FloatingAssistant from './components/assistant/FloatingAssistant';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('carebridge_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: 'login',
    role: 'Patient',
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const [targetDashboardSection, setTargetDashboardSection] = useState('Dashboard');

  const openAuth = (mode = 'login', role = 'Patient') => {
    setAuthModalState({
      isOpen: true,
      mode,
      role,
    });
  };

  const closeModal = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('carebridge_current_user', JSON.stringify(user));
    } catch {}
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('carebridge_current_user');
    } catch {}
    setShowDashboard(false);
  };

  const handleAssistantNavigation = (section) => {
    setShowDashboard(true);
    if (section) {
      setTargetDashboardSection(section);
    }
  };

  return (
    <ToastProvider>
      <LanguageProvider>
      <div className="min-h-screen bg-[#07111F] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#00D4FF]/20 selection:text-[#00D4FF]">
        {showDashboard ? (
          <DashboardApp
            initialSection={targetDashboardSection}
            currentUser={currentUser}
            onLogout={handleLogout}
            onExitDemo={() => setShowDashboard(false)}
          />
        ) : (
          <>
            <Navbar
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenDashboard={() => setShowDashboard(true)}
              onOpenAuth={(mode, role) => openAuth(mode || 'login', role || 'Patient')}
              onOpenGetStarted={() => openAuth('signup', 'Patient')}
            />
            <main className="flex-1">
              <LandingPage
                onOpenGetStarted={() => openAuth('signup', 'Patient')}
                onOpenAuth={openAuth}
              />
            </main>
            <Footer />
          </>
        )}

        {/* Floating CareBridge AI Assistant (Phase 5) */}
        <FloatingAssistant onNavigateSection={handleAssistantNavigation} />

        {/* Dedicated Role Authentication & Registration Modal */}
        <AuthModal
          key={`${authModalState.mode}-${authModalState.role}-${authModalState.isOpen}`}
          isOpen={authModalState.isOpen}
          onClose={closeModal}
          initialMode={authModalState.mode}
          initialRole={authModalState.role}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
      </LanguageProvider>
    </ToastProvider>
  );
}

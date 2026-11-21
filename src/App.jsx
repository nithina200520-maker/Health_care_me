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
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: 'signup',
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const [targetDashboardSection, setTargetDashboardSection] = useState('Dashboard');

  const openSignUp = () => {
    setShowDashboard(true);
  };

  const openLogin = () => {
    setAuthModalState({ isOpen: true, mode: 'login' });
  };

  const closeModal = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
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
            onExitDemo={() => setShowDashboard(false)}
          />
        ) : (
          <>
            <Navbar onOpenAuth={openLogin} onOpenGetStarted={openSignUp} />
            <main className="flex-1">
              <LandingPage onOpenGetStarted={openSignUp} onOpenAuth={openLogin} />
            </main>
            <Footer />
          </>
        )}

        {/* Floating CareBridge AI Assistant (Phase 5) */}
        <FloatingAssistant onNavigateSection={handleAssistantNavigation} />

        {/* Interactive Auth/Onboarding Modal */}
        <AuthModal
          key={authModalState.mode}
          isOpen={authModalState.isOpen}
          onClose={closeModal}
          initialMode={authModalState.mode}
        />
      </div>
      </LanguageProvider>
    </ToastProvider>
  );
}

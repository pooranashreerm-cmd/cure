import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { CommunityWorkerDashboard } from './components/chw/CommunityWorkerDashboard';
import { PharmacyDashboard } from './components/pharmacy/PharmacyDashboard';
import { AlarmModal } from './components/common/AlarmModal';
import { AiCallModal } from './components/common/AiCallModal';
import { AiAssistantModal } from './components/common/AiAssistantModal';
import { AuthModal } from './components/auth/AuthModal';
import { ScrollBackgroundAnimation } from './components/common/ScrollBackgroundAnimation';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { currentRole, setCurrentRole, isLoggedIn, setAuthModalOpen, theme } = useApp();
  const [showLanding, setShowLanding] = useState(!isLoggedIn);

  const handleEnterApp = (role?: UserRole) => {
    if (role) {
      setCurrentRole(role);
    }
    setShowLanding(false);
  };

  if (showLanding && !isLoggedIn) {
    return (
      <>
        <LandingPage onEnterApp={handleEnterApp} />
        <AuthModal />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors relative">
      {/* Visible Background Animation */}
      <ScrollBackgroundAnimation
        isGlobalBackground={true}
        defaultOpacity={0.88}
        showFloatingControls={true}
        initialMode="loop"
      />

      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {currentRole === 'patient' && <PatientDashboard />}
          {currentRole === 'doctor' && <DoctorDashboard />}
          {currentRole === 'community_worker' && <CommunityWorkerDashboard />}
          {currentRole === 'pharmacy' && <PharmacyDashboard />}
        </main>
      </div>

      <BottomNav />

      {/* Global Interactive Overlays */}
      <AlarmModal />
      <AiCallModal />
      <AiAssistantModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

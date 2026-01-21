'use client';

import { useState, useEffect } from 'react';
import { Loading, Toast } from '@/components/common';
import {
  OnboardingView,
  HomeView,
  RecordDreamView,
  DreamDetailView,
  StatsView
} from '@/components/views';
import {
  signInAnonymousUser,
  subscribeToAuth,
  subscribeToProfile,
  subscribeToDreams
} from '@/services/firebase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('onboarding');
  const [selectedDreamId, setSelectedDreamId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 인증 초기화
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymousUser();
      } catch (err) {
        console.error("Auth Failed", err);
      }
    };

    initAuth();

    const unsubscribe = subscribeToAuth(setUser);
    return () => unsubscribe();
  }, []);

  // 프로필 및 꿈 목록 구독
  useEffect(() => {
    if (!user) return;

    const unsubProfile = subscribeToProfile(user.uid, (data) => {
      if (data) {
        setProfile(data);
        setCurrentView('home');
      }
      setLoading(false);
    });

    const unsubDreams = subscribeToDreams(user.uid, setDreams);

    return () => {
      unsubProfile();
      unsubDreams();
    };
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <OnboardingView onComplete={() => setCurrentView('home')} />;
      case 'record':
        return (
          <RecordDreamView
            profile={profile}
            onBack={() => setCurrentView('home')}
            showToast={showToast}
          />
        );
      case 'detail':
        return (
          <DreamDetailView
            profile={profile}
            dream={dreams.find(d => d.id === selectedDreamId)}
            onBack={() => setCurrentView('home')}
            showToast={showToast}
          />
        );
      case 'stats':
        return <StatsView dreams={dreams} onBack={() => setCurrentView('home')} />;
      default:
        return (
          <HomeView
            dreams={dreams}
            profile={profile}
            onRecord={() => setCurrentView('record')}
            onStats={() => setCurrentView('stats')}
            onViewDetail={(id) => {
              setSelectedDreamId(id);
              setCurrentView('detail');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#05040a] text-gray-100 font-sans relative pb-safe flex flex-col items-center overflow-x-hidden selection:bg-purple-500/30">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-2%] w-[60%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute bottom-[-5%] right-[-2%] w-[70%] h-[50%] bg-indigo-900/15 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-2xl px-4 pt-safe relative z-10 flex flex-col flex-1 min-h-0">
        <div className="flex-1 w-full overflow-y-auto no-scrollbar">
          {renderView()}
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast} />
    </div>
  );
}

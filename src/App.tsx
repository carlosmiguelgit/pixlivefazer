import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { StatusBar } from './components/StatusBar';
import { MessageInbox } from './components/MessageInbox';
import { Dashboard } from './components/Dashboard';
import { Extrato } from './components/Extrato';
import { Ranking } from './components/Ranking';
import { BottomNav } from './components/BottomNav';
import PrivateChat from './components/PrivateChat';
import NubankSheet from './components/NubankSheet';
import { Notification } from './types';
import { useNotificationSystem } from './hooks/useNotificationSystem';

function loadHistories(): Record<string, { text: string; sender: 'me' | 'them' }[]> {
  try {
    const raw = localStorage.getItem('chatHistories');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function ChatApp() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'dash' | 'extrato' | 'ranking'>('inbox');
  const [confirmedNotifications, setConfirmedNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const [modoMeses, setModoMeses] = useState(false);
  const [chatNotification, setChatNotification] = useState<Notification | null>(null);
  const [batteryClickCount, setBatteryClickCount] = useState(0);
  const [searchClickCount, setSearchClickCount] = useState(0);
  const [fraseAgradecimento, setFraseAgradecimento] = useState('');
  const [nubankSheetOpen, setNubankSheetOpen] = useState(false);
  const [nubankNotification, setNubankNotification] = useState<Notification | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, { text: string; sender: 'me' | 'them' }[]>>(loadHistories);
  const [nubankCompleted, setNubankCompleted] = useState(false);
  const [hideDateTime, setHideDateTime] = useState(false);
  const [mensagensClickCount, setMensagensClickCount] = useState(0);
  const pendingBotTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const chatNotificationRef = useRef<Notification | null>(null);
  chatNotificationRef.current = chatNotification;

  const handleScheduleBotResponse = useCallback((notifId: string, texto: string, delayMs: number) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, typing: true } : n));
    if (pendingBotTimersRef.current[notifId]) {
      clearTimeout(pendingBotTimersRef.current[notifId]);
    }
    pendingBotTimersRef.current[notifId] = setTimeout(() => {
      delete pendingBotTimersRef.current[notifId];
      const isChatOpen = chatNotificationRef.current?.id === notifId;
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, typing: false, lastMessage: texto, lastMessageTimestamp: Date.now(), ...(isChatOpen ? {} : { unreadCount: (n.unreadCount || 0) + 1 }) } : n));
      setChatHistories(prev => {
        const existing = prev[notifId] || [];
        const alreadyHas = existing.some(m => m.sender === 'them' && m.text === texto);
        if (alreadyHas) return prev;
        return { ...prev, [notifId]: [...existing, { text: texto, sender: 'them' as const }] };
      });
    }, delayMs);
  }, []);

  const {
    notifications,
    setNotifications,
    dynamicTestimonials,
    setPendingTestimonials,
    addToBlacklist,
    generateNotification
  } = useNotificationSystem(modoMeses);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('theme-dark');
    root.classList.remove('theme-light');
    root.style.backgroundColor = '#000000';
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
  }, [chatHistories]);

  const handleBatteryClick = () => {
    setBatteryClickCount(prev => {
      const next = prev + 1;
      if (next === 3) {
        setIsAnonymousMode(!isAnonymousMode);
        return 0;
      }
      return next;
    });
    setTimeout(() => setBatteryClickCount(0), 3000);
  };

  const handleSearchClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setSearchClickCount(prev => {
      const next = prev + 1;
      if (next === 3) {
        setModoMeses(prev => !prev);
        return 0;
      }
      return next;
    });
    setTimeout(() => setSearchClickCount(0), 3000);
  };

  const handleMensagensClick = () => {
    setMensagensClickCount(prev => {
      const next = prev + 1;
      if (next === 3) {
        setHideDateTime(prev => !prev);
        return 0;
      }
      return next;
    });
    setTimeout(() => setMensagensClickCount(0), 3000);
  };

  const handleStartChat = (notif: Notification) => {
    setChatNotification(notif);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true, unreadCount: 0, typing: false } : n));
    setFraseAgradecimento(notif.fraseAgradecimento || "obrigado");
    setNubankCompleted(false);
  };

  const handleOpenNubank = (notif: Notification) => {
    setNubankNotification(notif);
    setNubankSheetOpen(true);
  };

  const handleCloseNubank = () => {
    setNubankSheetOpen(false);
  };

  const handleNubankComplete = () => {
    setNubankSheetOpen(false);
    setNubankCompleted(true);
    setChatNotification(nubankNotification);
  };

  const handleHistoryUpdate = (notifId: string, messages: { text: string; sender: 'me' | 'them'; timestamp?: number }[]) => {
    setChatHistories(prev => ({
      ...prev,
      [notifId]: messages
    }));
  };

  const handleChatComplete = (name: string, pixKey: string) => {
    if (!chatNotification) return;
    const notif = { ...chatNotification, name, pixKey };
    setConfirmedNotifications(prev => [notif, ...prev]);
    setNotifications(prev => prev.filter(n => n.id !== chatNotification.id));
    addToBlacklist(chatNotification.name);
    setChatHistories(prev => {
      const next = { ...prev };
      delete next[chatNotification.id];
      return next;
    });
    if (Math.random() < 0.85) {
      const delaySeconds = Math.floor(Math.random() * 180) + 300;
      const visibleAt = Date.now() + (delaySeconds * 1000);
      setPendingTestimonials(prev => [...prev, {
        id: `dyn-${chatNotification.id}`,
        name: chatNotification.name,
        text: "só gratidão guilherme, de verdade",
        rating: 5,
        gender: chatNotification.gender,
        photo: "",
        months: chatNotification.months,
        timestamp: new Date(Date.now() - 3600000),
        visibleAt
      }]);
    }
    setChatNotification(null);
    setNubankCompleted(false);
  };

  const handleChatBack = () => {
    if (chatNotification) {
      const hist = chatHistories[chatNotification.id];
      const lastMsg = hist && hist.length > 0 ? hist[hist.length - 1] : null;
      const flowDone = lastMsg?.sender === 'them';
      setNotifications(prev => prev.map(n => n.id === chatNotification.id ? { ...n, typing: flowDone ? false : n.typing } : n));
    }
    setChatNotification(null);
    setNubankCompleted(false);
    if (flowCompletedRef.current) {
      flowCompletedRef.current = false;
      scheduleNextNotifications();
    }
  };

  const handleFlowEnd = () => {
    flowCompletedRef.current = true;
  };

  const flowCompletedRef = useRef(false);

  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scheduleNextNotifications = useCallback(() => {
    autoTimersRef.current.forEach(t => clearTimeout(t));
    autoTimersRef.current = [];

    const shouldSpawnTwo = Math.random() < 0.35;
    const count = shouldSpawnTwo ? 2 : 1;

    for (let i = 0; i < count; i++) {
      const delay = 3000 + Math.random() * 5000;
      const timer = setTimeout(() => {
        generateNotification();
      }, delay + (i === 1 ? 500 : 0));
      autoTimersRef.current.push(timer);
    }
  }, [generateNotification]);

  const handleScreenClick = (e: ReactMouseEvent) => {
    if (activeTab !== 'inbox' || chatNotification) return;
    if ((e.target as HTMLElement).closest('[data-chat-card]')) return;
    if ((e.target as HTMLElement).closest('[data-nav]')) return;
    if (notificationTimer.current !== null) return;
    const delay = Math.floor(Math.random() * 3000) + 5000;
    notificationTimer.current = setTimeout(() => {
      notificationTimer.current = null;
      generateNotification();
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
      autoTimersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen overflow-hidden bg-black">
      <div className="relative w-full max-w-[430px] h-full max-h-[932px] overflow-hidden flex flex-col bg-[#000000] text-white" onClick={handleScreenClick}>
        <StatusBar
          onBatteryClick={handleBatteryClick}
          isDarkMode={true}
          hideDateTime={hideDateTime}
        />

        <main className="relative z-10 flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          {activeTab === 'inbox' && (
            <MessageInbox
              notifications={notifications}
              isDarkMode={true}
              isAnonymousMode={isAnonymousMode}
              modoMeses={modoMeses}
              onOpenChat={handleStartChat}
              onSearchClick={handleSearchClick}
              hideDateTime={hideDateTime}
            />
          )}
          {activeTab === 'dash' && (
            <Dashboard
              notifications={notifications}
              activeNotification={activeNotification}
              setActiveNotification={setActiveNotification}
              isAnonymousMode={isAnonymousMode}
              isDarkMode={true}
              onStartChat={handleStartChat}
              onRessarcir={(n) => {
                setNotifications(prev => prev.filter(x => x.id !== n.id));
                setActiveNotification(null);
              }}
            />
          )}
          {activeTab === 'extrato' && (
            <Extrato
              confirmedNotifications={confirmedNotifications}
              dynamicTestimonials={dynamicTestimonials}
              isAnonymousMode={isAnonymousMode}
              isDarkMode={true}
              hideDateTime={hideDateTime}
            />
          )}
          {activeTab === 'ranking' && (
            <Ranking
              confirmedNotifications={confirmedNotifications}
              isAnonymousMode={isAnonymousMode}
              isDarkMode={true}
            />
          )}
        </main>

        <div className="shrink-0">
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={true}
            unreadCount={notifications.filter(n => !n.read).length}
            onMensagensClick={handleMensagensClick}
          />
        </div>

        {chatNotification && (
          <PrivateChat
            username={chatNotification.username}
            nickname={chatNotification.name}
            fullName={chatNotification.fullName}
            avatar={chatNotification.photo}
            followingCount={chatNotification.followingCount}
            followerCount={chatNotification.followerCount}
            pixKey={chatNotification.pixKey}
            initialMessage={chatNotification.initialMessage}
            onComplete={handleChatComplete}
            onBack={handleChatBack}
            onBotMessage={(text) => {
              setNotifications(prev => prev.map(n => n.id === chatNotification.id ? { ...n, lastMessage: text } : n));
            }}
            fraseAgradecimento={fraseAgradecimento}
            fraseConfirmacao={chatNotification.fraseConfirmacao}
            modoMeses={modoMeses}
            notification={chatNotification}
            onOpenNubank={handleOpenNubank}
            historyMessages={chatHistories[chatNotification.id]}
            onHistoryUpdate={(messages) => handleHistoryUpdate(chatNotification.id, messages)}
            nubankCompleted={nubankCompleted}
            onFlowEnd={handleFlowEnd}
            hideDateTime={hideDateTime}
            onScheduleBotResponse={handleScheduleBotResponse}
          />
        )}

        {nubankSheetOpen && nubankNotification && (
          <NubankSheet
            isOpen={nubankSheetOpen}
            onClose={handleCloseNubank}
            notification={nubankNotification}
            nubankBalance={348742.18}
            onConfirm={handleNubankComplete}
            isAnonymousMode={isAnonymousMode}
            isDarkMode={true}
            hideDateTime={hideDateTime}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (hash.startsWith('#/nubank')) {
    return <ChatApp />;
  }

  return <ChatApp />;
}

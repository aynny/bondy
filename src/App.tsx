import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from './components/AppShell';
import { BottomNav } from './components/BottomNav';
import { PersonModal } from './components/PersonModal';
import { currentUser, findPerson, Person } from './data/people';
import { CalendarHistory } from './pages/CalendarHistory';
import { CommonConnections } from './pages/CommonConnections';
import { ConnectionDetail } from './pages/ConnectionDetail';
import { ConnectionList } from './pages/ConnectionList';
import { Discover } from './pages/Discover';
import { AuthGate } from './pages/AuthGate';
import { HomeMap } from './pages/HomeMap';
import { MeetingRecord } from './pages/MeetingRecord';
import { Memo } from './pages/Memo';
import { NewConnection } from './pages/NewConnection';
import { Profile } from './pages/Profile';
import { QrCode } from './pages/QrCode';
import { Ranking } from './pages/Ranking';
import { Reminder } from './pages/Reminder';
import { Requests } from './pages/Requests';
import { ScoreBreakdown } from './pages/ScoreBreakdown';
import { Settings } from './pages/Settings';
import { SnsList } from './pages/SnsList';

export type Page =
  | 'home'
  | 'ranking'
  | 'detail'
  | 'meeting'
  | 'score'
  | 'common'
  | 'memo'
  | 'reminder'
  | 'list'
  | 'sns'
  | 'discover'
  | 'profile'
  | 'new'
  | 'qr'
  | 'requests'
  | 'calendar'
  | 'settings';

export type AppActions = {
  go: (page: Page, personId?: string) => void;
  back: () => void;
  openPerson: (person: Person) => void;
  setCenter: (personId: string) => void;
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => window.localStorage.getItem('bondySession') === 'true');
  const [page, setPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page>('home');
  const [selectedPersonId, setSelectedPersonId] = useState(currentUser.id);
  const [centerPersonId, setCenterPersonId] = useState(currentUser.id);
  const [modalPerson, setModalPerson] = useState<Person | null>(null);

  const selectedPerson = useMemo(() => findPerson(selectedPersonId), [selectedPersonId]);
  const centerPerson = useMemo(() => findPerson(centerPersonId), [centerPersonId]);

  const actions: AppActions = {
    go: (nextPage, personId) => {
      if (personId) setSelectedPersonId(personId);
      setPreviousPage(page);
      setPage(nextPage);
    },
    back: () => {
      setPage(previousPage);
      setPreviousPage('home');
    },
    openPerson: setModalPerson,
    setCenter: (personId) => {
      setCenterPersonId(personId);
      setPage('home');
    },
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomeMap centerPerson={centerPerson} actions={actions} />;
      case 'ranking':
        return <Ranking actions={actions} />;
      case 'detail':
        return <ConnectionDetail person={selectedPerson} actions={actions} />;
      case 'meeting':
        return <MeetingRecord person={selectedPerson} actions={actions} />;
      case 'score':
        return <ScoreBreakdown person={selectedPerson} actions={actions} />;
      case 'common':
        return <CommonConnections person={selectedPerson} actions={actions} />;
      case 'memo':
        return <Memo person={selectedPerson} actions={actions} />;
      case 'reminder':
        return <Reminder person={selectedPerson} actions={actions} />;
      case 'list':
        return <ConnectionList actions={actions} />;
      case 'sns':
        return <SnsList actions={actions} />;
      case 'discover':
        return <Discover actions={actions} />;
      case 'profile':
        return <Profile actions={actions} />;
      case 'new':
        return <NewConnection actions={actions} />;
      case 'qr':
        return <QrCode actions={actions} />;
      case 'requests':
        return <Requests actions={actions} />;
      case 'calendar':
        return <CalendarHistory actions={actions} />;
      case 'settings':
        return <Settings actions={actions} />;
      default:
        return <HomeMap centerPerson={centerPerson} actions={actions} />;
    }
  };

  if (!authenticated) {
    return <AuthGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <AppShell page={page} actions={actions}>
      <AnimatePresence mode="wait">
        <motion.main
          key={page + selectedPerson.id + centerPerson.id}
          className="app-main"
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      <BottomNav page={page} go={actions.go} />
      <PersonModal person={modalPerson} onClose={() => setModalPerson(null)} actions={actions} />
    </AppShell>
  );
}

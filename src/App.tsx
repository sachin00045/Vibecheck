import { useState } from 'react';
import { LandingPage } from '@/pages/Landing';
import { TryOnPage } from '@/pages/TryOn';
import { SettingsPage } from '@/pages/Settings';
import type { Page } from '@/types';

function App() {
  const [page, setPage] = useState<Page>('landing');

  return (
    <>
      {page === 'landing' && <LandingPage onStart={() => setPage('tryon')} />}
      {page === 'tryon' && <TryOnPage onBack={() => setPage('landing')} />}
      {page === 'settings' && <SettingsPage onBack={() => setPage('landing')} />}
    </>
  );
}

export default App;

import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { JwtProvider, useJwtContext } from '@lit-protocol/vincent-app-sdk/react';

import { env } from '@/config/env';

import './App.css';

import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DottedBackground } from '@/components/ui/dotted-background';

const { VITE_APP_ID } = env;

function AppContent() {
  const { authInfo } = useJwtContext();

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen overflow-x-hidden">
      <DottedBackground />
      <Header title="Vincent DCA" />
      {authInfo ? <Home /> : <Login />}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <JwtProvider appId={VITE_APP_ID}>
      <AppContent />
    </JwtProvider>
  );
}

export default App;

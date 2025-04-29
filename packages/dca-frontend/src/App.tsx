import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

import { JwtProvider, useJwtContext } from '@lit-protocol/vincent-sdk';

import '@/App.css';

import { APP_ID } from '@/config';
import { Home } from '@/pages/home';
import { Login } from '@/pages/login';

function AppContent() {
  const { authInfo } = useJwtContext();

  return authInfo ? <Home /> : <Login />;
}

function App() {
  return (
    <JwtProvider appId={APP_ID}>
      <AppContent />
    </JwtProvider>
  );
}

export default App;

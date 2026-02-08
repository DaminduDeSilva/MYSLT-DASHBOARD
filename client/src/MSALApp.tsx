import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppRouter } from './AppRouter';

// Azure AD app credentials
const msalConfig = {
  auth: {
    clientId: '7f6a0b9b-f362-4417-853e-d1b962e4018d',
    authority: 'https://login.microsoftonline.com/534253fc-dfb6-462f-b5ca-cbe81939f5ee',
    redirectUri: window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export function MSALApp() {
  return (
    <MsalProvider instance={msalInstance}>
      <AppRouter />
    </MsalProvider>
  );
}

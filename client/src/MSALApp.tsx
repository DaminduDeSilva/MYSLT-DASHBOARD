import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppRouter } from './AppRouter';

// TODO: Replace with your Azure AD app credentials
const msalConfig = {
  auth: {
    clientId: 'YOUR_AZURE_AD_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
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

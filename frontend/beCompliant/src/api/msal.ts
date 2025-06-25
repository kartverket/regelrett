import {
  type Configuration,
  type PopupRequest,
  PublicClientApplication,
  type RedirectRequest,
  type SsoSilentRequest,
} from '@azure/msal-browser';

export const clientId = __CLIENT_ID__;
const authority = __AUTHORITY__;
const redirectUri = new URL(document.URL).origin;
if (!clientId) {
  throw new Error('Client ID is not set');
}
if (!authority) {
  throw new Error('Authority is not set');
}
if (!redirectUri) {
  throw new Error('Redirect URI is not set');
}

// MSAL configuration
const configuration: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri, // Points to window.location.origin. You must register this URI on Microsoft Entra admin center/App Registration.
    postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
    navigateToLoginRequestUrl: true, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: 'localStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

export const msalInstance = new PublicClientApplication(configuration);

export const scopes = [`${clientId}/.default`];

export const authenticationRequest:
  | PopupRequest
  | RedirectRequest
  | SsoSilentRequest = {
  authority,
  scopes,
};

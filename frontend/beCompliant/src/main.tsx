import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { Toaster } from '@/components/ui/sonner';
import 'material-symbols';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { authenticationRequest, msalInstance } from '@/api/msal';
// import { InteractionType } from '@azure/msal-browser';
// import { MsalAuthenticationTemplate, MsalProvider } from '@azure/msal-react';
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <MsalProvider instance={msalInstance}> */}
    {/* <MsalAuthenticationTemplate */}
    {/*   interactionType={InteractionType.Redirect} */}
    {/*   authenticationRequest={authenticationRequest} */}
    {/* > */}
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="bottom-center" />
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
    {/*   </MsalAuthenticationTemplate> */}
    {/* </MsalProvider> */}
  </React.StrictMode>
);

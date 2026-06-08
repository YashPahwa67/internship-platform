import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { store } from './app/store';
import { ThemeProvider } from './theme/ThemeProvider';
import LoadingScreen from './components/ui/LoadingScreen';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider>
          <CssBaseline />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <App />
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

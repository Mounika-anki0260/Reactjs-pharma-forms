import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import PharmaLayout from './components/Layout/PharmaLayout';
import ConfirmDialog from './components/Shared/ConfirmDialog';
import AppRoutes from './routes';
import './assets/styles/global.css';

const App: React.FC = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <PharmaLayout>
      <AnimatePresence mode="wait">
        {outlet 
          ? React.cloneElement(outlet, { key: location.pathname }) 
          : <AppRoutes key={location.pathname} />}
      </AnimatePresence>
      <ConfirmDialog />
    </PharmaLayout>
  );
};

export default App;
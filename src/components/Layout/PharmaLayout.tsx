import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PharmaHeader from './PharmaHeader';
import PharmaSidebar from './PharmaSidebar';
import ConfirmDialog from '../Shared/ConfirmDialog';
import '../../assets/styles/global.css';
import './PharmaLayout.css';

interface PharmaLayoutProps {
  children?: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3
};

const PharmaLayout: React.FC<PharmaLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="pharma-app">
      <PharmaHeader />
      <div className="pharma-body">
        <PharmaSidebar />
        <main className="pharma-main">
          {children ? (
            children
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                style={{ height: '100%' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
      <ConfirmDialog />
    </div>
  );
};

export default PharmaLayout;
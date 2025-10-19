import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { ClerkProvider } from '@clerk/clerk-react';
import Layout from './components/Layout';
import QueryPage from './pages/QueryPage-simple';
import SimpleChatInterface from './components/SimpleChatInterface';
import ProcessMiningPage from './pages/ProcessMiningPage';
import WhatIfAnalysisPage from './pages/WhatIfAnalysis';
import AdminSettings from './pages/AdminSettings';
import HomePage from './pages/HomePage';
import UserProfileManager from './components/UserProfileManager';
import CommsConfig from './components/CommsConfig';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeSettings } from './utils/initializeSettings';

// Temporary simple pages
const HistoryPage = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h4">History Page</Typography>
    <Typography>Query history will be shown here</Typography>
  </Paper>
);

const SchemaPage = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h4">Schema Page</Typography>
    <Typography>Database schema will be shown here</Typography>
  </Paper>
);

const HealthPage = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h4">Health Page</Typography>
    <Typography>System health will be shown here</Typography>
  </Paper>
);

function App() {
  console.log('App component rendering');
  console.log('Environment:', import.meta.env);
  
  useEffect(() => {
    initializeSettings();
  }, []);

  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  console.log('Clerk Publishable Key:', clerkPubKey ? `Loaded: ${clerkPubKey.substring(0, 20)}...` : 'Missing');
  
  if (!clerkPubKey) {
    console.error('Missing Clerk Publishable Key - Authentication will not work!');
    // Return app without Clerk provider if key is missing
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<SimpleChatInterface />} />
            <Route path="/process-mining" element={<ProcessMiningPage />} />
            <Route path="/whatif-analysis" element={<WhatIfAnalysisPage />} />
            <Route path="/query" element={<QueryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/schema" element={<SchemaPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/profile" element={<UserProfileManager />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/comms/config" element={<CommsConfig />} />
          </Routes>
        </Layout>
      </Box>
    );
  }
  
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute routePath="/chat">
                  <SimpleChatInterface />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/process-mining" 
              element={
                <ProtectedRoute routePath="/process-mining">
                  <ProcessMiningPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/whatif-analysis" 
              element={
                <ProtectedRoute routePath="/whatif-analysis">
                  <WhatIfAnalysisPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/query" 
              element={
                <ProtectedRoute routePath="/query">
                  <QueryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute routePath="/history">
                  <HistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/schema" 
              element={
                <ProtectedRoute routePath="/schema">
                  <SchemaPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health" 
              element={
                <ProtectedRoute routePath="/health">
                  <HealthPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute routePath="/profile">
                  <UserProfileManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute routePath="/admin/settings">
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comms/config"
              element={
                <ProtectedRoute routePath="/comms/config">
                  <CommsConfig />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Box>
    </ClerkProvider>
  );
}

export default App;
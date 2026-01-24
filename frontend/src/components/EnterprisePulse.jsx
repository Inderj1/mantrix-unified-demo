import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Box,
  Dialog,
  DialogContent,
} from '@mui/material';
import AgentCreationWizard from './pulse/AgentCreationWizard';
import EnterprisePulseLanding from './pulse/EnterprisePulseLanding';
import KitAlertsView from './pulse/KitAlertsView';
import AgentsManagementView from './pulse/AgentsManagementView';

const EnterprisePulse = ({ darkMode = false }) => {
  const { user } = useUser();
  // Use fixed 'persona' ID for persona-based insights
  const userId = 'persona';
  const [showWizard, setShowWizard] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [alertCount, setAlertCount] = useState(12);
  const [agentCount, setAgentCount] = useState(8);

  // Dark mode colors
  const bgColor = darkMode ? '#0d1117' : '#f5f5f5';

  const handleTileClick = (tileId) => {
    setSelectedView(tileId);
  };

  const handleBack = () => {
    setSelectedView(null);
  };

  // Render ML Insights view (KitAlertsView)
  if (selectedView === 'alerts') {
    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
        <KitAlertsView onBack={handleBack} darkMode={darkMode} />
      </Box>
    );
  }

  // Render AI Agents view (AgentsManagementView)
  if (selectedView === 'agents') {
    return (
      <Box sx={{
        p: 3,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        bgcolor: bgColor
      }}>
        {/* Agent Creation Wizard Dialog */}
        <Dialog
          open={showWizard}
          onClose={() => setShowWizard(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ p: 3 }}>
            <AgentCreationWizard
              userId={userId}
              onClose={() => setShowWizard(false)}
              onSave={() => {
                setShowWizard(false);
              }}
              darkMode={darkMode}
            />
          </DialogContent>
        </Dialog>

        <AgentsManagementView
          userId={userId}
          onBack={handleBack}
          onCreateAgent={() => setShowWizard(true)}
          darkMode={darkMode}
        />
      </Box>
    );
  }

  // Render landing page with tiles
  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>
      <EnterprisePulseLanding
        onTileClick={handleTileClick}
        alertCount={alertCount}
        agentCount={agentCount}
        darkMode={darkMode}
      />
    </Box>
  );
};

export default EnterprisePulse;

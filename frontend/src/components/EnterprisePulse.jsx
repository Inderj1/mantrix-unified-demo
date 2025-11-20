import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Box,
  Dialog,
  DialogContent,
} from '@mui/material';
import AgentCreationWizard from './pulse/AgentCreationWizard';
import AgentDashboard from './pulse/AgentDashboard';

const EnterprisePulse = () => {
  const { user } = useUser();
  // Use fixed 'persona' ID for persona-based insights
  const userId = 'persona';
  const [showWizard, setShowWizard] = useState(false);

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      bgcolor: '#f5f5f5'
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
          />
        </DialogContent>
      </Dialog>

      {/* Main Dashboard */}
      <AgentDashboard
        userId={userId}
        onCreateAgent={() => setShowWizard(true)}
      />
    </Box>
  );
};

export default EnterprisePulse;

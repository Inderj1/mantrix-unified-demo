import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  alpha,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  SmartToy as AgentsIcon,
} from '@mui/icons-material';
import AgentCreationWizard from './pulse/AgentCreationWizard';
import ProactiveActionsTab from './pulse/ProactiveActionsTab';
import AgentsManagementView from './pulse/AgentsManagementView';
import { getColors } from '../config/brandColors';

const EnterprisePulse = ({ darkMode = false }) => {
  const { user } = useUser();
  const userId = 'persona';
  const colors = getColors(darkMode);

  const [activeTab, setActiveTab] = useState(0);
  const [showWizard, setShowWizard] = useState(false);

  const bgColor = darkMode ? '#0d1117' : '#f5f5f5';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: bgColor }}>
      {/* Tab Bar */}
      <Box sx={{ borderBottom: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'divider', bgcolor: colors.paper }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: colors.textSecondary,
              minHeight: 48,
              '&.Mui-selected': { color: colors.primary },
            },
            '& .MuiTabs-indicator': { bgcolor: colors.primary },
          }}
        >
          <Tab icon={<PsychologyIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Proactive Actions" />
          <Tab icon={<AgentsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="AI Agents" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 3 }}>
        {activeTab === 0 && (
          <ProactiveActionsTab darkMode={darkMode} />
        )}

        {activeTab === 1 && (
          <>
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
                  onSave={() => setShowWizard(false)}
                  darkMode={darkMode}
                />
              </DialogContent>
            </Dialog>

            <AgentsManagementView
              userId={userId}
              onBack={() => setActiveTab(0)}
              onCreateAgent={() => setShowWizard(true)}
              darkMode={darkMode}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default EnterprisePulse;

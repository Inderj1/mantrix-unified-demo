import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  IconButton,
  Chip,
  Stack,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
} from '@mui/material';
import {
  Share as ShareIcon,
  NavigateNext as NavigateNextIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  AccountTree as ProcessIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import ProcessFlowDiagram from './process-flow/ProcessFlowDiagram';

const ProcessAnalysisDashboard = ({ template, processData, onBack }) => {
  const processTitle = template ? template.name : 'Process Analysis';
  const [selectedActivity, setSelectedActivity] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Generate process-specific data based on the template
  const getProcessSpecificData = () => {
    // If we have real process data, use it
    if (processData && processData.events) {
      return {
        activities: processData.activities || template.steps,
        caseDescription: template.description,
        totalCases: processData.cases || 0,
        avgThroughput: processData.avgCycleTime || 'N/A',
      };
    }
    
    // Otherwise use template defaults
    const templateDefaults = {
      'order-to-cash': {
        activities: template?.steps || ['Order Entry', 'Credit Check', 'Fulfillment', 'Shipping', 'Invoice', 'Payment'],
        caseDescription: template?.description || "End-to-end order fulfillment process",
        totalCases: 12453,
        avgThroughput: '4.2 days',
      },
      'procure-to-pay': {
        activities: template?.steps || ['Requisition', 'Approval', 'PO Creation', 'Receipt', 'Invoice', 'Payment'],
        caseDescription: template?.description || "Complete procurement lifecycle",
        totalCases: 8932,
        avgThroughput: '3.8 days',
      },
      'quote-to-cash': {
        activities: template?.steps || ['Lead', 'Quote', 'Negotiate', 'Contract', 'Order', 'Delivery', 'Invoice', 'Collection'],
        caseDescription: template?.description || "Sales process from quote to revenue",
        totalCases: 5421,
        avgThroughput: '38 days',
      },
      'hire-to-retire': {
        activities: template?.steps || ['Recruitment', 'Onboarding', 'Development', 'Performance', 'Offboarding'],
        caseDescription: template?.description || "Employee lifecycle management",
        totalCases: 234,
        avgThroughput: '45 days',
      },
      'Opportunity Management': {
        activities: ['Lead Qualification', 'Proposal Creation', 'Negotiation', 'Contract Signing', 'Deal Closure'],
        caseDescription: "Sales opportunity tracking from lead to closure",
        totalCases: 34,
        avgThroughput: '12.3 days',
      },
      'Incident Management': {
        activities: ['Incident Reported', 'Incident Assigned', 'Diagnosis', 'Resolution', 'Verification', 'Closure'],
        caseDescription: "IT incident resolution process management",
        totalCases: 203,
        avgThroughput: '0.9 days',
      },
    };

    const templateId = template?.id;
    return templateDefaults[templateId] || templateDefaults['order-to-cash'];
  };

  const processSpecificData = getProcessSpecificData();

  // Mock data - in real implementation, this would come from props or API
  const mockProcessData = {
    cases: {
      total: processSpecificData.totalCases,
      description: processSpecificData.caseDescription,
    },
    casesOverTime: [
      { date: '2024-01', cases: 1 },
      { date: '2024-02', cases: 2 },
      { date: '2024-03', cases: 1 },
      { date: '2024-04', cases: 3 },
    ],
    variantActivities: {
      total: processSpecificData.activities.length,
      description: `${processSpecificData.activities.length} distinct activities occurred across all process instances. View details in the Variant Explorer`,
    },
    activityFrequency: processSpecificData.activities.map((activity, index) => ({
      name: activity,
      frequency: 95 - (index * 10),
      color: '#4285F4',
    })),
    caseDetails: [
      {
        caseId: 'C001',
        activities: 3,
        throughput: '2.5 days',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        status: 'Completed',
      },
      {
        caseId: 'C002',
        activities: 4,
        throughput: '3.1 days',
        startDate: '2024-02-01',
        endDate: '2024-02-04',
        status: 'Completed',
      },
    ],
  };

  const activities = ['All', ...processSpecificData.activities];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFullscreenOpen = () => {
    setFullscreenOpen(true);
  };

  const handleFullscreenClose = () => {
    setFullscreenOpen(false);
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link color="inherit" href="#" onClick={onBack}>
            Business Miner
          </Link>
          <Link color="inherit" href="#" onClick={onBack}>
            [Quickstarts] {template?.name}
          </Link>
          <Link color="inherit" href="#" onClick={onBack}>
            {template?.name} Workspace
          </Link>
          <Typography color="text.primary">
            What does your process look like?
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            What does your process look like?
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              sx={{ borderRadius: 2 }}
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content Area */}
        <Grid item xs={12} lg={9}>
          {/* Metrics Dashboard */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={3}>
              {/* Number of Cases */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Number of Cases
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#4285F4', fontWeight: 600 }}>
                      {mockProcessData.cases.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {mockProcessData.cases.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Cases over time */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cases over time
                    </Typography>
                    <Box sx={{ height: 120 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockProcessData.casesOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="cases"
                            stroke="#4285F4"
                            strokeWidth={2}
                            dot={{ fill: '#4285F4', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Variant Activities */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Variant activities
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#4285F4', fontWeight: 600 }}>
                      {mockProcessData.variantActivities.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {mockProcessData.variantActivities.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Activity Frequency */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Activity frequency
                    </Typography>
                    <Box sx={{ height: 120 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={mockProcessData.activityFrequency}
                          layout="horizontal"
                          margin={{ left: 100 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="frequency" fill="#4285F4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Data Table Section */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Case Details
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Activities</InputLabel>
                <Select
                  value={selectedActivity}
                  label="Activities"
                  onChange={(e) => setSelectedActivity(e.target.value)}
                >
                  {activities.map((activity) => (
                    <MenuItem key={activity} value={activity}>
                      {activity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Case ID</TableCell>
                    <TableCell># of Activities</TableCell>
                    <TableCell>Throughput</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockProcessData.caseDetails
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((caseItem) => (
                      <TableRow key={caseItem.caseId} hover>
                        <TableCell>
                          <Typography sx={{ color: '#4285F4', fontWeight: 500 }}>
                            {caseItem.caseId}
                          </Typography>
                        </TableCell>
                        <TableCell>{caseItem.activities}</TableCell>
                        <TableCell>{caseItem.throughput}</TableCell>
                        <TableCell>{caseItem.startDate}</TableCell>
                        <TableCell>{caseItem.endDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={caseItem.status}
                            color="success"
                            size="small"
                            sx={{ borderRadius: 2 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={mockProcessData.caseDetails.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>

          {/* Process Explorer */}
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 500 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Process Explorer
              </Typography>
              <Button
                variant="outlined"
                startIcon={<FullscreenIcon />}
                onClick={handleFullscreenOpen}
                sx={{ borderRadius: 2 }}
              >
                Fullscreen
              </Button>
            </Box>
            <ProcessFlowDiagram 
              processData={processData || { template }} 
              height={450}
            />
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} lg={3}>
          <Stack spacing={3}>
            {/* Definitions Panel */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Definitions
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Cases
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Individual process instances from start to finish
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Activities
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Individual steps or tasks within a process
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Variants
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Different paths through the same process
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Process Statistics */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Process Statistics
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Avg. Throughput</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {processSpecificData.avgThroughput}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Activities</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {processSpecificData.activities.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Process Variants</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    3
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Completion Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                    100%
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Filter Controls */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Filter Controls
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Time Range Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Performance Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<InfoIcon />}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Case Attributes
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Fullscreen Process Explorer Dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={handleFullscreenClose}
        maxWidth={false}
        fullWidth
        fullScreen
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Process Explorer - {template?.name || 'Process Flow'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interactive process flow diagram in fullscreen mode
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              sx={{ borderRadius: 2 }}
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
            <IconButton
              onClick={handleFullscreenClose}
              sx={{
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            height: 'calc(100vh - 120px)',
            overflow: 'hidden',
          }}
        >
          <ProcessFlowDiagram 
            processData={processData || { template }} 
            height="100%"
          />
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`${processSpecificData.totalCases} Total Cases`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${processSpecificData.avgThroughput} Avg. Time`}
              color="secondary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${processSpecificData.activities.length} Activities`}
              color="info"
              variant="outlined"
              size="small"
            />
          </Box>
          
          <Button
            onClick={handleFullscreenClose}
            variant="contained"
            startIcon={<FullscreenExitIcon />}
            sx={{ borderRadius: 2 }}
          >
            Exit Fullscreen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessAnalysisDashboard;
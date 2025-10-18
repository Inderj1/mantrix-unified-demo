import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  SummarizeOutlined as SummaryIcon,
  InsightsOutlined as InsightIcon,
  RecommendOutlined as RecommendIcon,
  AssessmentOutlined as DataIcon,
  ExpandMoreOutlined as ExpandIcon,
  TrendingUpOutlined as TrendIcon,
  WarningAmberOutlined as AnomalyIcon,
  CompareArrowsOutlined as ComparisonIcon,
  ScatterPlotOutlined as CorrelationIcon,
  DownloadOutlined as DownloadIcon,
  ShareOutlined as ShareIcon,
} from '@mui/icons-material';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box pt={3}>{children}</Box>}
  </div>
);

const importanceColors = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const categoryIcons = {
  trend: <TrendIcon />,
  anomaly: <AnomalyIcon />,
  comparison: <ComparisonIcon />,
  correlation: <CorrelationIcon />,
};

const ResearchResults = ({ executionId, apiService }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await apiService.getResearchResults(executionId);
        setResults(response.data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        console.error('Error details:', err.response);
        setError(err.response?.data?.detail || err.message || 'Failed to load research results');
      } finally {
        setLoading(false);
      }
    };

    if (executionId) {
      fetchResults();
    }
  }, [executionId, apiService]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDownload = () => {
    // Create a downloadable report
    const reportData = {
      title: results.title,
      generated_at: results.generated_at,
      executive_summary: results.executive_summary,
      key_findings: results.key_findings,
      insights: results.insights,
      recommendations: results.recommendations,
      methodology: results.methodology,
      data_summary: results.data_summary,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_report_${results.report_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress />
        <Typography variant="body2" ml={2}>
          Loading research results...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!results) {
    return (
      <Alert severity="info">
        No results available for this research execution.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {results.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generated on {new Date(results.generated_at).toLocaleString()}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              size="small"
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              startIcon={<ShareIcon />}
              variant="outlined"
              size="small"
              disabled
            >
              Share
            </Button>
          </Box>
        </Box>

        <Paper sx={{ backgroundColor: 'primary.light', p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
            <SummaryIcon sx={{ mr: 1 }} />
            Executive Summary
          </Typography>
          <Typography variant="body1">
            {results.executive_summary}
          </Typography>
        </Paper>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Key Findings" />
          <Tab label="Insights" />
          <Tab label="Recommendations" />
          <Tab label="Data Summary" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <List>
            {results.key_findings.map((finding, index) => (
              <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon>
                  <Chip
                    label={index + 1}
                    size="small"
                    color="primary"
                    sx={{ width: 32, height: 32 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={finding}
                  primaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2}>
            {results.insights.map((insight) => (
              <Grid item xs={12} key={insight.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {categoryIcons[insight.category] || <InsightIcon />}
                        <Typography variant="h6">{insight.title}</Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Chip
                          label={insight.importance}
                          size="small"
                          color={importanceColors[insight.importance]}
                        />
                        <Chip
                          label={`${Math.round(insight.confidence * 100)}% confidence`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {insight.description}
                    </Typography>

                    {insight.supporting_data && Object.keys(insight.supporting_data).length > 0 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandIcon />}>
                          <Typography variant="body2" color="text.secondary">
                            Supporting Data
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                            {JSON.stringify(insight.supporting_data, null, 2)}
                          </pre>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={2}>
            {results.recommendations.map((rec) => (
              <Grid item xs={12} key={rec.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <RecommendIcon color="primary" />
                        <Typography variant="h6">{rec.title}</Typography>
                      </Box>
                      <Chip
                        label={`${rec.priority} priority`}
                        size="small"
                        color={importanceColors[rec.priority]}
                      />
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {rec.description}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Expected Impact:</strong> {rec.expected_impact}
                    </Typography>

                    {rec.related_insights.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Related Insights:
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {rec.related_insights.map((insightId) => (
                            <Chip
                              key={insightId}
                              label={insightId}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <DataIcon sx={{ mr: 1 }} />
                  Analysis Overview
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Total Queries Executed"
                      secondary={results.data_summary.total_queries_executed}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Rows Analyzed"
                      secondary={results.data_summary.total_rows_analyzed.toLocaleString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Query Time"
                      secondary={`${results.data_summary.average_query_time.toFixed(2)}s`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Data Coverage"
                      secondary={`${results.data_summary.data_coverage.steps_completed} of ${results.data_summary.data_coverage.steps_completed + results.data_summary.data_coverage.steps_failed} steps completed`}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Methodology
                </Typography>
                <Typography variant="body2">
                  {results.methodology}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default ResearchResults;
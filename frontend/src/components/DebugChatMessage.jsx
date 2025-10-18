import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

const DebugChatMessage = ({ message }) => {
  if (message.type !== 'ai_query_result') {
    return null;
  }

  const { sql, results, metadata } = message;

  return (
    <Box sx={{ mb: 2, p: 2, border: '2px solid red' }}>
      <Typography variant="h6" color="error">Debug Info</Typography>
      
      <Paper sx={{ p: 2, my: 1, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2">Message Type: {message.type}</Typography>
        <Typography variant="subtitle2">Has SQL: {sql ? 'Yes' : 'No'}</Typography>
        <Typography variant="subtitle2">Has Results: {results ? 'Yes' : 'No'}</Typography>
        <Typography variant="subtitle2">Results Type: {typeof results}</Typography>
        <Typography variant="subtitle2">Is Array: {Array.isArray(results) ? 'Yes' : 'No'}</Typography>
        <Typography variant="subtitle2">Results Length: {results?.length || 0}</Typography>
        
        {results && results.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>First Row Keys:</Typography>
            <Typography variant="body2" component="pre">
              {JSON.stringify(Object.keys(results[0]), null, 2)}
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>First Row Data:</Typography>
            <Typography variant="body2" component="pre" sx={{ overflow: 'auto', maxHeight: 200 }}>
              {JSON.stringify(results[0], null, 2)}
            </Typography>
          </>
        )}
        
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Full Message:</Typography>
        <Typography variant="body2" component="pre" sx={{ overflow: 'auto', maxHeight: 300 }}>
          {JSON.stringify(message, null, 2)}
        </Typography>
      </Paper>
      
      <Button 
        variant="contained" 
        onClick={() => console.log('Full message object:', message)}
        sx={{ mt: 1 }}
      >
        Log to Console
      </Button>
    </Box>
  );
};

export default DebugChatMessage;
import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Box } from '@mui/material';

SyntaxHighlighter.registerLanguage('sql', sql);

function SQLDisplay({ sql: sqlCode }) {
  return (
    <Box sx={{ 
      '& pre': { 
        margin: 0,
        borderRadius: 1,
        fontSize: '0.875rem',
      } 
    }}>
      <SyntaxHighlighter
        language="sql"
        style={vs2015}
        customStyle={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#1e1e1e',
        }}
      >
        {sqlCode || '-- No SQL generated yet'}
      </SyntaxHighlighter>
    </Box>
  );
}

export default SQLDisplay;
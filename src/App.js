

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Tabs, Tab, Avatar } from '@mui/material';
import QuestionManager from './QuestionManager';
import QuizInterface from './QuizInterface';
import ResultsInterface from './ResultsInterface';

function App() {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)', boxShadow: 3 }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Avatar sx={{ bgcolor: '#fff', color: '#1976d2', mr: 2, width: 40, height: 40, fontWeight: 'bold', fontSize: 24 }}>S</Avatar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            SimpleQuiz
          </Typography>
        </Toolbar>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          centered
          textColor="inherit"
          TabIndicatorProps={{ style: { background: '#fff', height: 4, borderRadius: 2 } }}
          sx={{
            '.MuiTab-root': {
              color: '#e3f2fd',
              fontWeight: 500,
              fontSize: 16,
              textTransform: 'none',
              mx: 2,
              transition: 'color 0.2s',
            },
            '.Mui-selected': {
              color: '#fff',
            },
          }}
        >
          <Tab label="Take Quiz" />
          <Tab label="Results" />
          <Tab label="Question Manager" />
        </Tabs>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {tab === 0 && (
          <Box>
            <QuizInterface />
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <ResultsInterface />
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <QuestionManager />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;

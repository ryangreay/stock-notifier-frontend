import React, { useEffect } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const GoodbyePage = () => {
  const navigate = useNavigate();

  // Clear any remaining auth data after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100vw',
        minHeight: 'calc(100vh - 64px - 56px)', // Subtract AppBar and Footer heights
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <SentimentVeryDissatisfiedIcon
            sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
          />
          <Typography variant="h4" gutterBottom>
            We're Sorry to See You Go
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your account has been successfully deleted. Thank you for using StockNudger.
            We hope our paths cross again in the future.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            If you ever decide to come back, we'll be here to help you make smarter trading decisions.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default GoodbyePage; 
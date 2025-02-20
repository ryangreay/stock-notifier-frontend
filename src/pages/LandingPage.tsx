import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TimelineIcon from '@mui/icons-material/Timeline';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import TelegramIcon from '@mui/icons-material/Telegram';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const features = [
    {
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning models analyze market patterns to predict significant stock movements before they happen.',
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: 'Professional Trading Insights',
      description: 'Get access to Wall Street-grade analysis and predictions, traditionally available only to professional traders.',
    },
    {
      icon: <NotificationsActiveIcon sx={{ fontSize: 40 }} />,
      title: 'Real-time Alerts',
      description: 'Stay informed with instant notifications about predicted stock movements during market hours.',
    },
    {
      icon: <TelegramIcon sx={{ fontSize: 40 }} />,
      title: 'Telegram Integration',
      description: 'Receive predictions and alerts directly through Telegram, keeping you updated wherever you are.',
    },
  ];

  const technicalIndicators = [
    {
      icon: <TrendingUpIcon />,
      title: 'Moving Averages',
      description: 'Moving averages to identify trends and potential support/resistance levels',
    },
    {
      icon: <BarChartIcon />,
      title: 'Volume Analysis',
      description: 'Trading volume patterns to confirm price movements and market sentiment',
    },
    {
      icon: <SignalCellularAltIcon />,
      title: 'MACD',
      description: 'Moving Average Convergence Divergence for trend direction and momentum',
    },
    {
      icon: <AutoGraphIcon />,
      title: 'RSI & Bollinger Bands',
      description: 'Relative Strength Index and volatility bands for overbought/oversold conditions',
    },
  ];

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          pt: 6,
          pb: 8,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, md: 8, lg: 12 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI-Powered Stock Predictions
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, fontWeight: 400 }}
              >
                Get Wall Street-grade stock movement predictions powered by advanced machine learning
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {user ? 'Go to Dashboard' : 'Start Predicting'}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    right: '10%',
                    bottom: '10%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                    borderRadius: '50%',
                  },
                }}
              >
                <ShowChartIcon
                  sx={{
                    fontSize: 280,
                    width: '100%',
                    height: 'auto',
                    color: alpha(theme.palette.primary.main, 0.8),
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ width: '100%', background: theme.palette.background.default }}>
        <Container maxWidth="xl" sx={{ py: 8, px: { xs: 4, sm: 6, md: 8, lg: 12 } }}>
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              fontWeight: 600,
            }}
          >
            Your AI Trading Assistant
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(
                      theme.palette.background.paper,
                      0.4
                    )} 100%)`,
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {feature.icon}
                    <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Technical Analysis Section */}
      <Box 
        sx={{ 
          width: '100%', 
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          py: 8,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, md: 8, lg: 12 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Advanced ML Technology
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Our Random Forest Classifier analyzes multiple technical indicators to provide accurate predictions of significant price movements.
              </Typography>
              <List>
                {technicalIndicators.map((indicator, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                      {indicator.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          {indicator.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {indicator.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  p: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Model Performance
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Our machine learning model combines multiple technical indicators to identify potential market movements with high accuracy:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AutoGraphIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Random Forest Classifier"
                      secondary="Ensemble learning for robust predictions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimelineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Historical Analysis"
                      secondary="Training on extensive market data"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PrecisionManufacturingIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Continuous Learning"
                      secondary="Model retraining with new market data"
                    />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          width: '100%',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          py: 8,
          borderTop: `1px solid ${theme.palette.divider}`,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, md: 8, lg: 12 } }}>
          <Box textAlign="center" sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Start Making Smarter Trading Decisions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join traders who use AI to predict market movements
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 
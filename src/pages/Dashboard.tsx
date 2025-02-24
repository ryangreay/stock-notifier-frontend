import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { stocks, model, settings } from '../services/api';
import type { UserStock, UserSettings, AvailableStock } from '../services/api';
import SettingsPanel from '../components/SettingsPanel';
import TelegramConnect from '../components/TelegramConnect';
import PredictionModal from '../components/PredictionModal';
import ModelTrainingModal from '../components/ModelTrainingModal';
import { alpha } from '@mui/material/styles';
import DeleteAccountDialog from '../components/DeleteAccountDialog';

const Dashboard = () => {
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [availableStocks, setAvailableStocks] = useState<AvailableStock[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState<string | null>(null);
  const [trainingStock, setTrainingStock] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionModalOpen, setPredictionModalOpen] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [trainSuccess, setTrainSuccess] = useState<string | null>(null);
  const [trainError, setTrainError] = useState<{symbol: string, message: string} | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [trainingMetrics, setTrainingMetrics] = useState(null);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [trainedSymbol, setTrainedSymbol] = useState('');
  const STOCK_LIMIT = 5; // Define the stock limit constant
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadUserStocks();
    loadAvailableStocks();
    const loadSettings = async () => {
      try {
        const response = await settings.getSettings();
        setUserSettings(response.data);
      } catch (err) {
        setError('Failed to load settings');
      }
    };
    
    loadSettings();
  }, []);

  const loadUserStocks = async () => {
    try {
      setIsLoading(true);
      const response = await stocks.getStocks();
      setUserStocks(response.data);
    } catch (err: any) {
      setError('Failed to load stocks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableStocks = async () => {
    try {
      const response = await stocks.getAvailableStocks(true); // Only get enabled stocks
      setAvailableStocks(response.data);
    } catch (err: any) {
      setError('Failed to load available stocks');
    }
  };

  const trainStock = async (symbol: string) => {
    try {
      setTrainSuccess(null);
      setTrainError(null);
      setTrainingStock(symbol);
      const response = await model.train({ symbol });
      setTrainSuccess(symbol);
      setTrainingMetrics(response.data.metrics);
      setTrainedSymbol(symbol);
      setTrainingModalOpen(true);
      setTimeout(() => {
        setTrainSuccess(null);
      }, 2000);
    } catch (err: any) {
      setTrainError({
        symbol,
        message: err.response?.data?.detail || 'Failed to train model'
      });
      setTimeout(() => {
        setTrainError(null);
      }, 5000);
    } finally {
      setTrainingStock(null);
    }
  };

  // Calculate remaining slots
  const enabledStocksCount = userStocks.filter(stock => stock.enabled).length;
  const remainingSlots = STOCK_LIMIT - enabledStocksCount;

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;

    try {
      setIsLoading(true);
      setError('');
      const response = await stocks.addStocks([newSymbol]);
      setUserStocks(prev => [...prev, ...response.data]);
      setNewSymbol('');
      
      // Automatically train the model for the new stock
      await trainStock(newSymbol);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add stock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    try {
      setIsLoading(true);
      await stocks.removeStocks([symbol]);
      setUserStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    } catch (err: any) {
      setError('Failed to remove stock');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setPredictionModalOpen(true);
  };

  const makePrediction = async () => {
    if (!selectedSymbol) return;
    
    try {
      setPredictionLoading(selectedSymbol);
      const response = await stocks.predict(selectedSymbol, notifyEnabled);
      setPredictionResult(response.data);
    } catch (err: any) {
      setError('Failed to get prediction');
    } finally {
      setPredictionLoading(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Settings Panel - Full Width */}
        <Grid item xs={12}>
          <SettingsPanel />
        </Grid>

        {/* Stocks Section */}
        <Grid item xs={12} md={8}>
          {/* Add Stock Form */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Add Stock to Watchlist
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {enabledStocksCount} of {STOCK_LIMIT} stocks watched
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(enabledStocksCount / STOCK_LIMIT) * 100}
                  sx={{ 
                    width: 100,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>
            </Box>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {remainingSlots === 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You have reached the maximum limit of {STOCK_LIMIT} stocks. Please remove some stocks before adding new ones.
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleAddStock} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <FormControl size="small" sx={{ minWidth: 300, maxWidth: '60%' }}>
                  <InputLabel>Select Stock ({remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining)</InputLabel>
                  <Select
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    label={`Select Stock (${remainingSlots} slot${remainingSlots !== 1 ? 's' : ''} remaining)`}
                    disabled={isLoading || remainingSlots === 0}
                  >
                    {availableStocks
                      .filter(stock => !userStocks.some(us => us.symbol === stock.symbol && us.enabled))
                      .map((stock) => (
                        <MenuItem key={stock.symbol} value={stock.symbol}>
                          {stock.name} ({stock.symbol})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !newSymbol || remainingSlots === 0}
                >
                  Add Stock
                </Button>
              </Box>
            )}
          </Paper>

          {/* Stocks List */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Watchlist
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {enabledStocksCount} of {STOCK_LIMIT} stocks watched
              </Typography>
            </Box>
            {trainError && trainError.symbol && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setTrainError(null)}
              >
                {`Failed to train model for ${trainError.symbol}: ${trainError.message}`}
              </Alert>
            )}
            {isLoading && !predictionLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : userStocks.length === 0 ? (
              <Typography color="textSecondary" sx={{ p: 2 }}>
                No stocks in your watchlist
              </Typography>
            ) : (
              <List>
                {userStocks.map((stock, index) => (
                  <React.Fragment key={stock.symbol}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={stock.symbol}
                        secondary={`Added: ${new Date(stock.created_at).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                          <Button
                            onClick={() => trainStock(stock.symbol)}
                            disabled={trainingStock === stock.symbol}
                            sx={{ 
                              minWidth: '80px',
                              position: 'relative',
                            }}
                          >
                            {trainingStock === stock.symbol ? (
                              <CircularProgress size={24} />
                            ) : trainSuccess === stock.symbol ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: 'success.main',
                                  animation: 'fadeIn 0.2s',
                                  '@keyframes fadeIn': {
                                    '0%': {
                                      opacity: 0,
                                      transform: 'scale(0.8)',
                                    },
                                    '100%': {
                                      opacity: 1,
                                      transform: 'scale(1)',
                                    },
                                  },
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  width="28"
                                  height="28"
                                >
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                              </Box>
                            ) : (
                              'Train'
                            )}
                          </Button>
                        </Box>
                        <Button
                          onClick={() => handlePredictClick(stock.symbol)}
                          sx={{ mr: 1 }}
                        >
                          Predict
                        </Button>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveStock(stock.symbol)}
                          disabled={isLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Telegram Section */}
        <Grid item xs={12} md={4}>
          <TelegramConnect />
        </Grid>

        {/* Delete Account Section - Full Width */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              mt: 3,
              borderTop: '2px solid',
              borderColor: 'error.main',
              bgcolor: theme => alpha(theme.palette.background.paper, 0.6),
            }}
          >
            <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
              <Typography variant="h6" color="error" gutterBottom>
                Delete Account
              </Typography>
              <Box sx={{ 
                p: 3, 
                border: '1px solid',
                borderColor: 'error.main',
                borderRadius: 1,
                bgcolor: theme => alpha(theme.palette.error.main, 0.08),
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Delete Your Account Permanently
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This will permanently delete your account, all your watchlists, settings, and trained models.
                      This action cannot be undone.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      ml: 3,
                      minWidth: 150,
                      '&:hover': {
                        bgcolor: theme => alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />

      <PredictionModal
        open={predictionModalOpen}
        onClose={() => {
          setPredictionModalOpen(false);
          setSelectedSymbol(null);
          setPredictionResult(null);
        }}
        symbol={selectedSymbol || ''}
        predictionResult={predictionResult}
        isLoading={!!predictionLoading}
        notifyEnabled={notifyEnabled}
        onNotifyChange={(e) => setNotifyEnabled(e.target.checked)}
        onPredict={makePrediction}
        movementThreshold={userSettings?.significant_movement_threshold}
      />
      <ModelTrainingModal
        open={trainingModalOpen}
        onClose={() => {
          setTrainingModalOpen(false);
          setTrainingMetrics(null);
          setTrainedSymbol('');
        }}
        metrics={trainingMetrics}
        symbol={trainedSymbol}
      />
    </Box>
  );
};

export default Dashboard; 
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { stocks, model, settings } from '../services/api';
import type { UserStock, UserSettings } from '../services/api';
import SettingsPanel from '../components/SettingsPanel';
import TelegramConnect from '../components/TelegramConnect';
import PredictionModal from '../components/PredictionModal';
import ModelTrainingModal from '../components/ModelTrainingModal';

const Dashboard = () => {
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
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

  useEffect(() => {
    loadUserStocks();
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

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;

    try {
      setIsLoading(true);
      setError('');
      const response = await stocks.addStocks([newSymbol.toUpperCase()]);
      setUserStocks(prev => [...prev, ...response.data]);
      setNewSymbol('');
      
      // Automatically train the model for the new stock
      await trainStock(newSymbol.toUpperCase());
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
            <Typography variant="h6" gutterBottom>
              Add Stock to Watchlist
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleAddStock} sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                label="Stock Symbol"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="e.g., AAPL"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !newSymbol}
              >
                Add Stock
              </Button>
            </Box>
          </Paper>

          {/* Stocks List */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Watchlist
            </Typography>
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
      </Grid>
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
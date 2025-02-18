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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { stocks } from '../services/api';
import type { UserStock } from '../services/api';

const Dashboard = () => {
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUserStocks();
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

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol) return;

    try {
      setIsLoading(true);
      setError('');
      const response = await stocks.addStocks([newSymbol.toUpperCase()]);
      setUserStocks(prev => [...prev, ...response.data]);
      setNewSymbol('');
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

  const handlePredict = async (symbol: string) => {
    try {
      setPredictionLoading(symbol);
      const response = await stocks.predict(symbol);
      // TODO: Show prediction results in a modal or alert
      console.log('Prediction:', response.data);
    } catch (err: any) {
      setError('Failed to get prediction');
    } finally {
      setPredictionLoading(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Add Stock Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
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
        </Grid>

        {/* Stocks List Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Watchlist
            </Typography>
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
                      <ListItemSecondaryAction>
                        <Button
                          onClick={() => handlePredict(stock.symbol)}
                          disabled={predictionLoading === stock.symbol}
                          sx={{ mr: 1 }}
                        >
                          {predictionLoading === stock.symbol ? (
                            <CircularProgress size={24} />
                          ) : (
                            'Predict'
                          )}
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
      </Grid>
    </Box>
  );
};

export default Dashboard; 
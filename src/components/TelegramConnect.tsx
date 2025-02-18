import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../services/api';

interface TelegramStatus {
  is_connected: boolean;
  connected_at: string | null;
}

const TelegramConnect = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await api.get<TelegramStatus>('/telegram-status');
        setIsConnected(response.data.is_connected);
        setConnectedAt(response.data.connected_at);
      } catch (err) {
        console.error('Failed to check Telegram connection status');
      }
    };
    
    checkConnection();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await api.post('/connect-telegram', { connection_token: token });
      // After successful connection, check the status again
      const response = await api.get<TelegramStatus>('/telegram-status');
      setIsConnected(response.data.is_connected);
      setConnectedAt(response.data.connected_at);
      setSuccess('Telegram connected successfully!');
      setToken('');
      setIsExpanded(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect Telegram');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: isConnected ? 'pointer' : 'default',
        }}
        onClick={() => isConnected && setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="div">
            Telegram Connection
          </Typography>
          {isConnected && (
            <CheckCircleIcon color="success" sx={{ ml: 1 }} />
          )}
        </Box>
        {isConnected && (
          <IconButton
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        )}
      </Box>

      {isConnected && !isExpanded && connectedAt && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Connected since {new Date(connectedAt).toLocaleDateString()}
        </Typography>
      )}

      {!isConnected && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          1. Start a chat with @stock_lord_bot on Telegram
          <br />
          2. Send the /start command to the bot
          <br />
          3. Enter the connection code you receive below
        </Typography>
      )}

      <Collapse in={!isConnected || isExpanded}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleConnect}>
          <TextField
            fullWidth
            label="Connection Code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading || !token}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : isConnected ? (
              'Reconnect Telegram'
            ) : (
              'Connect Telegram'
            )}
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TelegramConnect;

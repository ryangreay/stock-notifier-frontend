import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface PredictionResult {
  symbol: string;
  prediction: number;
  confidence: number;
  predicted_movement: 'up' | 'down';
  up_probability: number;
  down_probability: number;
  movement_exceeds_threshold: boolean;
  timestamp: string;
  current_price: number;
  notification_sent?: boolean;
  notification_error?: string;
  significant_movement_threshold: number;
}

interface PredictionModalProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  predictionResult: PredictionResult | null;
  isLoading: boolean;
  notifyEnabled: boolean;
  onNotifyChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPredict: () => void;
  movementThreshold?: number;
}

const PredictionModal: React.FC<PredictionModalProps> = ({
  open,
  onClose,
  symbol,
  predictionResult,
  isLoading,
  notifyEnabled,
  onNotifyChange,
  onPredict,
  movementThreshold,
}) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Stock Prediction: {symbol}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifyEnabled}
                onChange={onNotifyChange}
                disabled={isLoading}
              />
            }
            label="Send Telegram Notification"
          />

          {predictionResult && (
            <Box sx={{ mt: 3 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={predictionResult.predicted_movement === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${predictionResult.predicted_movement === 'up' ? 'Upward' : 'Downward'} Movement ${
                    movementThreshold 
                      ? `> ${(movementThreshold * 100).toFixed(1)}%` 
                      : ''
                  }`}
                  color={predictionResult.predicted_movement === 'up' ? 'success' : 'error'}
                />
              </Box>

              <Typography variant="body1" sx={{ mt: 2 }}>
                Current Price: ${predictionResult.current_price.toFixed(2)}
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Prediction Confidence: {formatPercentage(predictionResult.confidence)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`Up: ${formatPercentage(predictionResult.up_probability)}`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TrendingDownIcon />}
                    label={`Down: ${formatPercentage(predictionResult.down_probability)}`}
                    color="error"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Prediction made at: {new Date(predictionResult.timestamp).toLocaleString()}
              </Typography>

              {predictionResult.notification_sent && (
                <Chip
                  label="Notification Sent"
                  color="success"
                  sx={{ mt: 2 }}
                />
              )}
              
              {predictionResult.notification_error && predictionResult.notification_error !== 'Message sent' && (
                <Typography color="error" sx={{ mt: 2 }}>
                  Notification Error: {predictionResult.notification_error}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          onClick={onPredict}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            predictionResult ? 'Predict Again' : 'Make Prediction'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PredictionModal;

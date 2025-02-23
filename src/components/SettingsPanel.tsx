import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { settings } from '../services/api';
import type { UserSettings } from '../services/api';

const timeframeOptions = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1wk', label: '1 Week' },
  { value: '1mo', label: '1 Month' },
];

const SettingsPanel = () => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    prediction_threshold: 0.85,
    significant_movement_threshold: 0.025,
    prediction_window: 24,
    historical_days: 700,
    training_timeframe: '1d',
    notification_days: '1111100',
    notify_market_open: true,
    notify_midday: false,
    notify_market_close: true,
    timezone: 'America/New_York',
  });
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);
  const [movementThresholdInput, setMovementThresholdInput] = useState('2.5');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRetrainAlert, setShowRetrainAlert] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await settings.getSettings();
      setUserSettings(response.data);
      setOriginalSettings(response.data);
      setMovementThresholdInput((response.data.significant_movement_threshold * 100).toFixed(1));
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfRetrainingNeeded = (newSettings: UserSettings) => {
    if (!originalSettings) return false;
    
    return (
      newSettings.training_timeframe !== originalSettings.training_timeframe ||
      newSettings.significant_movement_threshold !== originalSettings.significant_movement_threshold
    );
  };

  const handleChange = (field: keyof UserSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (field === 'prediction_threshold' || field === 'significant_movement_threshold') {
      // Allow empty string or valid decimal number
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        const numValue = value === '' ? 0 : parseFloat(value);
        setUserSettings(prev => ({ 
          ...prev, 
          [field]: numValue / 100 
        }));
      }
    } else {
      setUserSettings(prev => ({ 
        ...prev, 
        [field]: event.target.type === 'checkbox' ? event.target.checked : value 
      }));
    }
  };

  const handleMovementThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Allow empty string, single decimal point, or valid decimal number
    if (value === '' || value === '.' || /^\d*\.?\d*$/.test(value)) {
      setMovementThresholdInput(value);
      if (value !== '' && value !== '.') {
        setUserSettings(prev => ({
          ...prev,
          significant_movement_threshold: parseFloat(value) / 100
        }));
      }
    }
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleNotificationDays = (day: number) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const days = userSettings.notification_days.split('');
    days[day] = event.target.checked ? '1' : '0';
    setUserSettings(prev => ({ 
      ...prev, 
      notification_days: days.join('') 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowRetrainAlert(false);
    setIsLoading(true);

    try {
      await settings.updateSettings(userSettings);
      const needsRetraining = checkIfRetrainingNeeded(userSettings);
      setOriginalSettings(userSettings);
      
      if (needsRetraining) {
        setShowRetrainAlert(true);
        setSuccess('Settings updated successfully. Please retrain your models for the changes to take effect.');
      } else {
        setSuccess('Settings updated successfully');
      }
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Trading Settings
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {showRetrainAlert && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have changed settings that affect model predictions. Please retrain your models for each stock to apply these changes.
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column - Trading Parameters */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              select
              label="Training Timeframe"
              value={userSettings.training_timeframe}
              onChange={handleChange('training_timeframe')}
              margin="normal"
              size="small"
              helperText="Data timeframe used for model training"
            >
              {timeframeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="text"
              label="Movement Threshold (%)"
              value={movementThresholdInput}
              onChange={handleMovementThresholdChange}
              margin="normal"
              size="small"
              inputProps={{ 
                inputMode: 'decimal',
              }}
              helperText="Minimum price movement to be considered significant"
            />
          </Grid>

          {/* Middle Column - Prediction Parameters */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              type="number"
              label="Prediction Threshold (%)"
              value={Math.round(userSettings.prediction_threshold * 100)}
              onChange={handleChange('prediction_threshold')}
              margin="normal"
              size="small"
              inputProps={{ 
                step: 1,
                min: 0, 
                max: 100
              }}
              helperText="Minimum confidence required for prediction notifications"
            />

            <TextField
              fullWidth
              type="number"
              label="Future Prediction Window (hours)"
              value={userSettings.prediction_window}
              onChange={handleChange('prediction_window')}
              margin="normal"
              size="small"
              inputProps={{ min: 1 }}
              helperText="Hours to look ahead for predictions"
            />
          </Grid>

          {/* Right Column - Market Time Notifications */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" gutterBottom>
              Notification Times
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1,
              mt: 1
            }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={userSettings.notify_market_open}
                    onChange={handleChange('notify_market_open')}
                  />
                }
                label="Market Open"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={userSettings.notify_midday}
                    onChange={handleChange('notify_midday')}
                  />
                }
                label="Midday"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={userSettings.notify_market_close}
                    onChange={handleChange('notify_market_close')}
                  />
                }
                label="Market Close"
              />
            </Box>
          </Grid>
        </Grid>

        {/* Notification Days - Below the grid */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Notification Days
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 600 }}>
            {daysOfWeek.map((day, index) => (
              <FormControlLabel
                key={day}
                control={
                  <Switch
                    size="small"
                    checked={userSettings.notification_days[index] === '1'}
                    onChange={handleNotificationDays(index)}
                  />
                }
                label={day}
              />
            ))}
          </Box>
        </Box>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            size="small"
          >
            {isLoading ? <CircularProgress size={20} /> : 'Save Settings'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SettingsPanel;

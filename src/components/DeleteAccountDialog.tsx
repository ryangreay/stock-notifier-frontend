import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ open, onClose }) => {
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const expectedConfirmation = `delete ${user?.email}`;

  const handleDelete = async () => {
    if (confirmation.toLowerCase() !== expectedConfirmation.toLowerCase()) {
      setError('Please type the confirmation text exactly as shown');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await auth.deleteAccount();
      navigate('/goodbye');
      setTimeout(() => {
        logout();
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete account');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Account</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="error" gutterBottom>
            Warning: This action cannot be undone
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deleting your account will:
          </Typography>
          <ul>
          <Typography component="li" variant="body2" color="text.secondary">
              Cancel your subscription
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Remove all your watchlists and settings
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Delete your trained models
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Disconnect Telegram notifications
            </Typography>
          </ul>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" gutterBottom>
          To confirm deletion, please type:
          <br />
          <strong>{expectedConfirmation}</strong>
        </Typography>

        <TextField
          fullWidth
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={expectedConfirmation}
          margin="normal"
          error={!!error}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={isLoading || !confirmation}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Delete Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog; 
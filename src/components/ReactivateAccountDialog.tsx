import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import { DeletedAccountResponse } from '../services/api';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface Props {
  open: boolean;
  onClose: () => void;
  accountInfo: DeletedAccountResponse | null;
  onReactivate: () => void;
  onGoogleSuccess?: (token: string) => void;
}

export default function ReactivateAccountDialog({ 
  open, 
  onClose, 
  accountInfo, 
  onReactivate,
  onGoogleSuccess 
}: Props) {
  if (!accountInfo) return null;

  const deletionDate = format(new Date(accountInfo.deletion_date), 'MMMM d, yyyy');
  const deadline = format(new Date(accountInfo.reactivation_deadline), 'MMMM d, yyyy');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reactivate Your Account</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Your account was deleted on {deletionDate}. You can reactivate it until {deadline}.
        </Typography>
        <Typography gutterBottom>
          {accountInfo.deletion_type === 'google' ? 'Sign in with Google to restore your account using your Google account.' : 'Click "Reactivate" to restore your account using your password.'}
        </Typography>

        {accountInfo.deletion_type === 'google' && onGoogleSuccess && GOOGLE_CLIENT_ID && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <GoogleOAuthProvider 
              clientId={GOOGLE_CLIENT_ID}
              onScriptLoadError={() => console.error('Failed to load Google Sign-In')}
              onScriptLoadSuccess={() => console.log('Google Sign-In loaded successfully')}
            >
              <GoogleLogin
                onSuccess={(response) => {
                  if (response.credential) {
                    onGoogleSuccess(response.credential);
                  }
                }}
                onError={() => {
                  console.error('Google Sign-In Failed');
                }}
                useOneTap={false}
                auto_select={false}
                type="standard"
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                locale="en"
                context="signin"
              />
            </GoogleOAuthProvider>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {accountInfo.deletion_type !== 'google' && (
          <Button onClick={onReactivate} variant="contained" color="primary">
            Reactivate
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 
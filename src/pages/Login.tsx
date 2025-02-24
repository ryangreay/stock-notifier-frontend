import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton, { GoogleLoginRef } from '../components/GoogleLoginButton';
import { auth, DeletedAccountResponse } from '../services/api';
import ReactivateAccountDialog from '../components/ReactivateAccountDialog';
import { jwtDecode } from 'jwt-decode';

interface GoogleJwtPayload {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
  sub: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletedAccountInfo, setDeletedAccountInfo] = useState<DeletedAccountResponse | null>(null);
  const googleLoginRef = useRef<GoogleLoginRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check for deleted account first
      const deletedAccount = await auth.checkDeletedAccount(email);
      if (deletedAccount.data.can_reactivate) {
        setDeletedAccountInfo(deletedAccount.data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // If not found or error, proceed with normal login
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (token: string) => {
    setError('');
    setIsLoading(true);

    try {
      const userInfo = jwtDecode<GoogleJwtPayload>(token);
      
      // If we already have deletedAccountInfo, this is a reactivation attempt
      if (deletedAccountInfo && deletedAccountInfo.deletion_type === 'google') {
        console.log('Attempting to reactivate Google account...');
        const response = await auth.reactivateAccount({
          email: userInfo.email,
          google_token: token
        });
        const { access_token, refresh_token } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        setDeletedAccountInfo(null);
        navigate('/dashboard');
        return;
      }

      // Otherwise, check if account was deleted first
      try {
        const deletedAccount = await auth.checkDeletedAccount(userInfo.email);
        if (deletedAccount.data.can_reactivate) {
          setDeletedAccountInfo(deletedAccount.data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // If not found or error, proceed with normal login
      }

      // Normal Google login
      await googleLogin(token);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google login/reactivation error:', err);
      //setError(err.response?.data?.detail || 'Failed to log in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  const handleReactivate = async () => {
    if (!deletedAccountInfo) return;

    setError('');
    setIsLoading(true);

    try {
      if (deletedAccountInfo.deletion_type === 'google') {
        // For Google accounts, do nothing - the dialog will handle it
        setIsLoading(false);
        return;
      }
      
      // For password-based accounts
      const response = await auth.reactivateAccount({
        email,
        password,
      });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setDeletedAccountInfo(null);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Reactivation error:', err);
      //setError(err.response?.data?.detail || 'Failed to reactivate account');
      setIsLoading(false);
    }
  };

  const handleGoogleReactivation = async (token: string) => {
    if (!deletedAccountInfo) return;
    
    setError('');
    setIsLoading(true);

    try {
      //console.log('Attempting to reactivate Google account...');
      const userInfo = jwtDecode<GoogleJwtPayload>(token);
      //console.log('Google token info:', {
      //  email: userInfo.email,
      //  sub: userInfo.sub,
      //  reactivatingEmail: deletedAccountInfo.email
      //});
      
      // Make sure we're using the same Google account
      if (userInfo.email.toLowerCase() !== deletedAccountInfo.email.toLowerCase()) {
        throw new Error('Please use the same Google account that was originally associated with this account');
      }

      // For Google accounts, only send email and google_token
      const reactivationData = {
        email: deletedAccountInfo.email,
        google_token: token,
        password: 'dummy-password-for-google-reactivation'  // Add dummy password to satisfy API validation
      };

      //console.log('Sending reactivation request:', reactivationData);
      const response = await auth.reactivateAccount(reactivationData);
      //console.log('Reactivation response:', response.data);
      
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // After setting tokens, use googleLogin to properly set up auth state
      await googleLogin(token);
      setDeletedAccountInfo(null);
      // navigate is not needed here as googleLogin will trigger the navigation
    } catch (err: any) {
      console.error('Google reactivation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto', // Center horizontally
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            mt: 3, 
            width: '100%', 
            maxWidth: '600px',
            mx: 'auto', // Center horizontally
          }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {GOOGLE_CLIENT_ID && (
            <GoogleOAuthProvider 
              clientId={GOOGLE_CLIENT_ID}
              onScriptLoadError={() => setError('Failed to load Google Sign-In')}
              onScriptLoadSuccess={() => console.log('Google Sign-In loaded successfully')}
            >
              <GoogleLoginButton
                ref={googleLoginRef}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </GoogleOAuthProvider>
          )}

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/register')}
            sx={{ mt: 2 }}
          >
            Don't have an account? Sign Up
          </Button>
        </Box>
      </Paper>

      <ReactivateAccountDialog
        open={!!deletedAccountInfo}
        onClose={() => setDeletedAccountInfo(null)}
        accountInfo={deletedAccountInfo}
        onReactivate={handleReactivate}
        onGoogleSuccess={handleGoogleReactivation}
      />
    </Box>
  );
};

export default Login; 
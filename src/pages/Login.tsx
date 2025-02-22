import React, { useState } from 'react';
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
import GoogleLoginButton from '../components/GoogleLoginButton';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (token: string) => {
    setError('');
    setIsLoading(true);
    try {
      await googleLogin(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Google login failed');
      console.error('Google login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
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
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLoginButton
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
    </Box>
  );
};

export default Login; 
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Box, Typography, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

interface GoogleLoginButtonProps {
  onSuccess: (token: string) => void;
  onError: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>
      
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            onSuccess(credentialResponse.credential);
          }
        }}
        onError={() => {
          console.error('Google Login Failed');
          onError();
        }}
        useOneTap
        auto_select
      />
    </Box>
  );
};

export default GoogleLoginButton; 
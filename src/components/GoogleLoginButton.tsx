import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Box, Typography, Divider } from '@mui/material';

interface GoogleLoginButtonProps {
  onSuccess: (token: string) => void;
  onError: () => void;
}

export interface GoogleLoginRef {
  triggerLogin: () => void;
}

const GoogleLoginButton = forwardRef<GoogleLoginRef, GoogleLoginButtonProps>(({ onSuccess, onError }, ref) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    triggerLogin: () => {
      if (buttonRef.current) {
        const button = buttonRef.current.querySelector('button');
        if (button) {
          button.click();
        }
      }
    }
  }));

  const handleSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      console.error('No credential received from Google');
      onError();
    }
  };

  const handleError = () => {
    console.error('Google Sign-In Failed');
    onError();
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>
      
      <div ref={buttonRef}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
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
      </div>
    </Box>
  );
});

GoogleLoginButton.displayName = 'GoogleLoginButton';

export default GoogleLoginButton; 
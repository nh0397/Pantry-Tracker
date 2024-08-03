"use client";

import React from 'react';
import { Button, TextField, Container, Typography, Box, Divider } from '@mui/material';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');
  };

  const handleGoogleSignIn = () => {
    console.log("Google Sign-In clicked");
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bgcolor="black"
        color="white"
        px={2}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          margin="normal"
          fullWidth
          InputLabelProps={{
            style: { color: 'lightblue' }, // Change label color
          }}
          InputProps={{
            sx: {
              '& input': {
                color: 'white', // Text color
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'lightblue', // Border color
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'lightblue', // Border color on hover
              },
            },
          }}
          placeholder="Enter your username"
          sx={{
            '& input::placeholder': {
              color: 'lightblue', // Placeholder color
              opacity: 1,
            },
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          fullWidth
          InputLabelProps={{
            style: { color: 'lightblue' },
          }}
          InputProps={{
            sx: {
              '& input': {
                color: 'white',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'lightblue',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'lightblue',
              },
            },
          }}
          placeholder="Enter your password"
          sx={{
            '& input::placeholder': {
              color: 'lightblue',
              opacity: 1,
            },
          }}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>
          Login
        </Button>
        <Divider sx={{ width: '100%', my: 2, borderColor: 'lightblue' }} />
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={handleGoogleSignIn}
          sx={{ mt: 2, borderColor: 'lightblue', color: 'lightblue' }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;

"use client";

import { Button, Container, Typography, Box } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Pantry Tracker App
        </Typography>
        <Typography variant="body1" component="p" gutterBottom>
          Manage your pantry items with ease.
        </Typography>
        <Link href="/login" passHref>
          <Button variant="contained" color="primary">
            Go to Login
          </Button>
        </Link>
      </Box>
    </Container>
  );
}

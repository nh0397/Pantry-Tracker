"use client";

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, TextField, MenuItem, Select, FormControl, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, CardMedia, LinearProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './Dashboard.module.css';

const pantryItems = [
  { id: 1, name: "Milk Can", image: "/milk-can.jpg", filledPercentage: 75 },
  { id: 2, name: "Vegetable Oil", image: "/vegetable-oil.jpg", filledPercentage: 40 },
  { id: 3, name: "Pasta Sauce", image: "/pasta-sauce.jpg", filledPercentage: 60 },
  { id: 4, name: "Coffee Powder Jar", image: "/coffee-powder-jar.jpg", filledPercentage: 90 }
];

const Dashboard = () => {
  const router = useRouter();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [items, setItems] = useState([
    { name: '', quantity: '', variant: 'solid', measure: '', unit: 'g' }
  ]);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleNavigation = (screen) => {
    setActiveScreen(screen);
  };

  const handleAddRow = () => {
    setItems([...items, { name: '', quantity: '', variant: 'solid', measure: '', unit: 'g' }]);
  };

  const handleInputChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log("Items added:", items);
    setItems([{ name: '', quantity: '', variant: 'solid', measure: '', unit: 'g' }]); // Reset to one empty row
  };

  return (
    <>
      <AppBar position="sticky" className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Box display="flex" alignItems="center" className={styles.title}>
            <img src="/StockBot.webp" alt="App Logo" className={styles.logo} />
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
              StockBot AI
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton color="inherit" onClick={() => handleNavigation('dashboard')}>
              <HomeIcon />
              <Typography variant="body1" sx={{ ml: 1, fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' } }}>
                Dashboard
              </Typography>
            </IconButton>
            <IconButton color="inherit" onClick={() => handleNavigation('add-item')}>
              <AddCircleOutlineIcon />
              <Typography variant="body1" sx={{ ml: 1, fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' } }}>
                Add Item
              </Typography>
            </IconButton>
            <IconButton color="inherit" onClick={() => handleNavigation('manage-inventory')}>
              <EditIcon />
              <Typography variant="body1" sx={{ ml: 1, fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' } }}>
                Manage Inventory
              </Typography>
            </IconButton>
            <Button color="inherit" onClick={handleLogout} sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' } }}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ padding: '16px 8px' }}>
        <Box mt={2} mb={2}>
          {activeScreen === 'dashboard' && (
            <>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                Inventory Dashboard
              </Typography>
              <Grid container spacing={2}>
                {pantryItems.map(item => (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <Card className={styles.card}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={item.image}
                        alt={item.name}
                      />
                      <CardContent>
                        <Typography variant="h6" component="div" sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' } }}>
                          {item.name}
                        </Typography>
                        <Box mt={1}>
                          <LinearProgress
                            variant="determinate"
                            value={item.filledPercentage}
                            sx={{ height: '10px', borderRadius: '5px' }}
                          />
                          <Typography variant="body2" color="text.secondary" mt={1} sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' } }}>
                            {item.filledPercentage}% filled
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          {activeScreen === 'add-item' && (
            <>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                Add Item
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Weight/Volume</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            value={item.name}
                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                            fullWidth
                            sx={{ backgroundColor: 'white' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.quantity}
                            onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                            fullWidth
                            sx={{ backgroundColor: 'white' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.variant}
                            onChange={(e) => handleInputChange(index, 'variant', e.target.value)}
                            fullWidth
                            sx={{ backgroundColor: 'white' }}
                          >
                            <MenuItem value="solid">Solid (Weight)</MenuItem>
                            <MenuItem value="liquid">Liquid (Volume)</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.measure}
                            label={item.variant === 'solid' ? 'Weight' : 'Volume'}
                            onChange={(e) => handleInputChange(index, 'measure', e.target.value)}
                            fullWidth
                            sx={{ backgroundColor: 'white' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.unit}
                            onChange={(e) => handleInputChange(index, 'unit', e.target.value)}
                            fullWidth
                            sx={{ backgroundColor: 'white' }}
                          >
                            {item.variant === 'solid' ? (
                              <>
                                <MenuItem value="g">g</MenuItem>
                                <MenuItem value="kg">kg</MenuItem>
                              </>
                            ) : (
                              <>
                                <MenuItem value="ml">ml</MenuItem>
                                <MenuItem value="l">l</MenuItem>
                              </>
                            )}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleRemoveRow(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button variant="contained" color="primary" onClick={handleAddRow} sx={{ mt: 2 }}>
                Add New Row
              </Button>
              {items.length > 0 && (
                <Button variant="contained" color="secondary" onClick={handleSubmit} sx={{ mt: 2, ml: 2 }}>
                  Submit All Items
                </Button>
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;

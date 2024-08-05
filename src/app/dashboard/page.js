"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Card, CardContent, CardMedia, LinearProgress, IconButton, CircularProgress, Dialog, DialogContent, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, RadioGroup, FormControlLabel, Radio, InputBase } from '@mui/material';
import { useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Webcam from 'react-webcam';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const router = useRouter();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [pantryItems, setPantryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([{ name: '', quantity: '', maxQuantity: '', variant: 'solid', measure: '', unit: 'g', image: '' }]);
  const [inputMethod, setInputMethod] = useState('manual');
  const [openCamera, setOpenCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const webcamRef = useRef(null);

  const fetchPantryItems = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch('/api/fetchPantryItems');
      const items = await response.json();
      setPantryItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error("Error fetching pantry items: ", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchPantryItems(); // Initial fetch when component mounts
  }, []);

  useEffect(() => {
    if (activeScreen === 'dashboard') {
      fetchPantryItems(); // Fetch data again when navigating to the dashboard
    }
  }, [activeScreen]);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleNavigation = (screen) => {
    setActiveScreen(screen);
  };

  const handleAddRow = () => {
    setItems([...items, { name: '', quantity: '', maxQuantity: '', variant: 'solid', measure: '', unit: 'g', image: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'variant') {
      newItems[index].unit = value === 'solid' ? 'g' : 'ml';
    }

    setItems(newItems);
  };

  const handleRemoveRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      for (const item of items) {
        if (item.name && item.quantity && item.maxQuantity && item.measure) {
          await fetch('/api/addPantryItem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          });
          console.log(`Item ${item.name} added successfully`);
        }
      }
      setItems([{ name: '', quantity: '', maxQuantity: '', variant: 'solid', measure: '', unit: 'g', image: '' }]);
      fetchPantryItems(); // Refresh pantry items
    } catch (error) {
      console.error("Error adding items to Firestore:", error);
    }
  };

  const handlePhotoCapture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setLoadingImage(true);
    setOpenCamera(false);

    try {
      const response = await fetch('/api/vertexPrediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc.split(',')[1] }), // Send base64 image without prefix
      });

      const result = await response.json();
      console.log("Predictions:", result.predictions);

      // Process and use the predictions as needed
      // Example: auto-populate form fields

    } catch (error) {
      console.error('Error during image recognition:', error);
    } finally {
      setLoadingImage(false);
    }
  }, []);

  const isFormValid = () => {
    return items.some(item => item.name && item.quantity && item.maxQuantity && item.measure);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value === '') {
      setFilteredItems(pantryItems);
    } else {
      setFilteredItems(pantryItems.filter(item => item.name.toLowerCase().includes(event.target.value.toLowerCase())));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredItems(pantryItems);
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
      <Box className={styles.searchBarContainer}>
        <SearchIcon />
        <InputBase
          placeholder="Search…"
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
        <Button onClick={handleClearSearch} className={styles.clearButton}>
          Clear Search
        </Button>
      </Box>
      <Container sx={{ padding: { xs: '8px', md: '16px 24px' } }}>
        <Box mt={2} mb={2}>
          {activeScreen === 'dashboard' && (
            <>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                Inventory Dashboard
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading inventory...
                  </Typography>
                </Box>
              ) : filteredItems.length === 0 ? (
                <Box className={styles.noItemsMessage}>
                  <Typography variant="h6">
                    No such item in the inventory.
                  </Typography>
                  <Button variant="contained" color="primary" onClick={() => handleNavigation('add-item')}>
                    Add New Item
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredItems.map(item => (
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
                              value={(item.quantity / item.maxQuantity) * 100}
                              sx={{ height: '10px', borderRadius: '5px' }}
                            />
                            <Typography variant="body2" color="text.secondary" mt={1} sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' } }}>
                              {((item.quantity / item.maxQuantity) * 100).toFixed(2)}% filled
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
          {activeScreen === 'add-item' && (
            <>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                Add Item
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup row value={inputMethod} onChange={(e) => setInputMethod(e.target.value)}>
                  <FormControlLabel
                    value="manual"
                    control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
                    label="Add Manually"
                    sx={{ color: 'white' }}
                  />
                  <FormControlLabel
                    value="photo"
                    control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />}
                    label="Take Photo"
                    sx={{ color: 'white' }}
                  />
                </RadioGroup>
              </FormControl>

              {inputMethod === 'manual' && (
                <>
                  <TableContainer component={Paper} sx={{ bgcolor: 'black', width: '100%' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: 'white' }}>Name</TableCell>
                          <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
                          <TableCell sx={{ color: 'white' }}>Max Quantity</TableCell>
                          <TableCell sx={{ color: 'white' }}>Variant</TableCell>
                          <TableCell sx={{ color: 'white' }}>Weight/Volume</TableCell>
                          <TableCell sx={{ color: 'white', width: '150px' }}>Unit</TableCell>
                          <TableCell sx={{ color: 'white' }}>Action</TableCell>
                          <TableCell sx={{ color: 'white' }}>Image</TableCell>
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
                              <TextField
                                value={item.maxQuantity}
                                onChange={(e) => handleInputChange(index, 'maxQuantity', e.target.value)}
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
                            <TableCell sx={{ width: '150px' }}>
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
                              <IconButton onClick={() => handleRemoveRow(index)} sx={{ color: 'white' }}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleInputChange(index, 'image', reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button variant="contained" color="primary" onClick={handleAddRow} sx={{ mt: 2 }}>
                    Add New Row
                  </Button>
                  {isFormValid() && (
                    <Button variant="contained" color="secondary" onClick={handleSubmit} sx={{ mt: 2, ml: 2 }}>
                      Submit All Items
                    </Button>
                  )}
                </>
              )}

              {inputMethod === 'photo' && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CameraAltIcon />}
                    onClick={() => setOpenCamera(true)}
                    sx={{ mt: 2 }}
                  >
                    Capture Photo
                  </Button>

                  <Dialog open={openCamera} onClose={() => setOpenCamera(false)}>
                    <DialogTitle>Take a Photo</DialogTitle>
                    <DialogContent>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        style={{ width: '100%' }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button onClick={handlePhotoCapture} variant="contained" color="primary">
                          Capture
                        </Button>
                      </Box>
                    </DialogContent>
                  </Dialog>

                  {capturedImage && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2 }}>Captured Photo:</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <img src={capturedImage} alt="Captured" style={{ width: '100%', maxWidth: '300px' }} />
                      </Box>
                    </>
                  )}

                  {loadingImage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress color="secondary" />
                      <Typography variant="body1" sx={{ ml: 2 }}>Processing image...</Typography>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import Webcam from "react-webcam";
import styles from "./Dashboard.module.css";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

const Dashboard = () => {
  const router = useRouter();
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [pantryItems, setPantryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([
    {
      name: "",
      quantity: "",
      maxQuantity: "",
      variant: "solid",
      measure: "",
      unit: "g",
      image: "",
    },
  ]);
  const [inputMethod, setInputMethod] = useState(null); 
  const [openCamera, setOpenCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const webcamRef = useRef(null);

  const fetchPantryItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fetchPantryItems");
      const items = await response.json();
      setPantryItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error("Error fetching pantry items: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPantryItems();
  }, []);

  useEffect(() => {
    if (activeScreen === "dashboard") {
      fetchPantryItems();
    }
  }, [activeScreen]);

  const handleLogout = () => {
    router.push("/login");
  };

  const handleNavigation = (screen) => {
    setActiveScreen(screen);
  };

  const handleCapturePhotoOption = (choice) => {
    setInputMethod(choice);
    if (choice === "photo") {
      setOpenCamera(true);
    } else {
      setOpenCamera(false);
    }
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        name: "",
        quantity: "",
        maxQuantity: "",
        variant: "solid",
        measure: "",
        unit: "g",
        image: "",
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "variant") {
      newItems[index].unit = value === "solid" ? "g" : "ml";
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
          await fetch("/api/addPantryItem", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });
          console.log(`Item ${item.name} added successfully`);
        }
      }
      setItems([
        {
          name: "",
          quantity: "",
          maxQuantity: "",
          variant: "solid",
          measure: "",
          unit: "g",
          image: "",
        },
      ]);
      fetchPantryItems();
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
      const response = await fetch("/api/proxyPrediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              mimeType: "image/jpeg",
              content: imageSrc.split(",")[1],
            },
          ],
          parameters: {
            confidenceThreshold: 0.5,
            maxPredictions: 5,
          },
        }),
      });

      const result = await response.json();
      console.log("Predictions:", result.predictions);

      if (result && result.predictions && result.predictions[0]) {
        const predictedItems = result.predictions[0].displayNames;

        const newItems = predictedItems.map((item) => ({
          name: item.replace(/_/g, " "),
          quantity: 1,
          variant: "solid",
          measure: "",
          unit: "g",
          image: imageSrc, 
        }));

        setItems(newItems);
      } else {
        alert("Failed to recognize items. Please try again.");
      }
    } catch (error) {
      console.error("Error during image recognition:", error);
      alert("Error during image recognition. Please try again.");
    } finally {
      setLoadingImage(false);
    }
  }, []);

  const isFormValid = () => {
    return items.some(
      (item) =>
        item.name && item.quantity && item.maxQuantity && item.measure
    );
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value === "") {
      setFilteredItems(pantryItems);
    } else {
      setFilteredItems(
        pantryItems.filter((item) =>
          item.name.toLowerCase().includes(event.target.value.toLowerCase())
        )
      );
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredItems(pantryItems);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/updatePantryItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      setEditingItem(null);
      fetchPantryItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "inventory", id));
      fetchPantryItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditingItem((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <AppBar position="sticky" className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Box display="flex" alignItems="center" className={styles.title}>
            <img src="/StockBot.webp" alt="App Logo" className={styles.logo} />
            <Typography
              variant="h6"
              sx={{
                display: { xs: "none", sm: "block" },
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              }}
            >
              StockBot AI
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              onClick={() => handleNavigation("dashboard")}
            >
              <HomeIcon />
              <Typography
                variant="body1"
                sx={{
                  ml: 1,
                  display: { xs: "none", sm: "block" },
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "1.1rem" },
                }}
              >
                Dashboard
              </Typography>
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => handleNavigation("add-item")}
            >
              <AddCircleOutlineIcon />
              <Typography
                variant="body1"
                sx={{
                  ml: 1,
                  display: { xs: "none", sm: "block" },
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "1.1rem" },
                }}
              >
                Add Item
              </Typography>
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => handleNavigation("manage-inventory")}
            >
              <EditIcon />
              <Typography
                variant="body1"
                sx={{
                  ml: 1,
                  display: { xs: "none", sm: "block" },
                  fontSize: { xs: "0.8rem", sm: "1rem", md: "1.1rem" },
                }}
              >
                Manage Inventory
              </Typography>
            </IconButton>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ fontSize: { xs: "0.8rem", sm: "1rem", md: "1.1rem" } }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box className={styles.searchBarContainer}>
        <SearchIcon />
        <TextField
          placeholder="Search…"
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
        <Button onClick={handleClearSearch} className={styles.clearButton}>
          Clear Search
        </Button>
      </Box>
      <Container sx={{ padding: { xs: "8px", md: "16px 24px" } }}>
        <Box mt={2} mb={2}>
          {activeScreen === "dashboard" && (
            <>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
              >
                Inventory Dashboard
              </Typography>
              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mt={4}
                >
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleNavigation("add-item")}
                  >
                    Add New Item
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredItems.map((item) => {
                    const filledPercentage =
                      (item.quantity / item.maxQuantity) * 100;

                    let progressColor = "primary"; 
                    if (filledPercentage < 15) {
                      progressColor = "error"; 
                    } else if (filledPercentage > 70) {
                      progressColor = "success"; 
                    }

                    return (
                      <Grid item xs={12} sm={6} md={3} key={item.id}>
                        <Card className={styles.card}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={item.image}
                            alt={item.name}
                          />
                          <CardContent>
                            <Typography
                              variant="h6"
                              component="div"
                              sx={{
                                fontSize: {
                                  xs: "1rem",
                                  sm: "1.2rem",
                                  md: "1.5rem",
                                },
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Box mt={1}>
                              <LinearProgress
                                variant="determinate"
                                value={filledPercentage}
                                sx={{
                                  height: "10px",
                                  borderRadius: "5px",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor:
                                      progressColor === "error"
                                        ? "red"
                                        : progressColor === "success"
                                        ? "green"
                                        : "orange",
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={1}
                                sx={{
                                  fontSize: {
                                    xs: "0.75rem",
                                    sm: "0.9rem",
                                    md: "1rem",
                                  },
                                }}
                              >
                                {filledPercentage.toFixed(2)}% filled
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
          )}
          {activeScreen === "add-item" && (
            <>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
              >
                Add Items
              </Typography>
              <Typography variant="body1" component="p" gutterBottom>
                How would you like to add items?
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCapturePhotoOption("photo")}
                >
                  Capture a Photo
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleCapturePhotoOption("manual")}
                  sx={{ ml: 2 }}
                >
                  Add Manually
                </Button>
              </Box>

              {/* Capture Photo and Populate Table */}
              {inputMethod === "photo" && (
                <Box>
                  <Dialog
                    open={openCamera}
                    onClose={() => setOpenCamera(false)}
                  >
                    <DialogTitle>Take a Photo</DialogTitle>
                    <DialogContent>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        style={{ width: "100%" }}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          onClick={handlePhotoCapture}
                          variant="contained"
                          color="primary"
                        >
                          Capture
                        </Button>
                      </Box>
                    </DialogContent>
                  </Dialog>

                  {capturedImage && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        Recognized items from your photo:
                      </Typography>
                      <TableContainer
                        component={Paper}
                        sx={{
                          bgcolor: "black",
                          width: "100%",
                          mt: 2,
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: "white" }}>Name</TableCell>
                              <TableCell sx={{ color: "white" }}>Quantity</TableCell>
                              <TableCell sx={{ color: "white" }}>Variant</TableCell>
                              <TableCell sx={{ color: "white" }}>Weight/Volume</TableCell>
                              <TableCell sx={{ color: "white" }}>Unit</TableCell>
                              <TableCell sx={{ color: "white" }}>Image</TableCell>
                              <TableCell sx={{ color: "white" }}>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <TextField
                                    value={item.name}
                                    onChange={(e) =>
                                      handleInputChange(index, "name", e.target.value)
                                    }
                                    fullWidth
                                    sx={{ backgroundColor: "white" }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleInputChange(index, "quantity", e.target.value)
                                    }
                                    fullWidth
                                    sx={{ backgroundColor: "white" }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormControl component="fieldset">
                                    <RadioGroup
                                      row
                                      aria-label="variant"
                                      name={`variant-${index}`}
                                      value={item.variant}
                                      onChange={(e) =>
                                        handleInputChange(index, "variant", e.target.value)
                                      }
                                    >
                                      <FormControlLabel
                                        value="solid"
                                        control={<Radio sx={{ color: "white" }} />}
                                        label="Solid"
                                        sx={{ color: "white" }}
                                      />
                                      <FormControlLabel
                                        value="liquid"
                                        control={<Radio sx={{ color: "white" }} />}
                                        label="Liquid"
                                        sx={{ color: "white" }}
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    value={item.measure}
                                    label={
                                      item.variant === "solid"
                                        ? "Weight"
                                        : "Volume"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(index, "measure", e.target.value)
                                    }
                                    fullWidth
                                    sx={{ backgroundColor: "white" }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormControl component="fieldset">
                                    <RadioGroup
                                      row
                                      aria-label="unit"
                                      name={`unit-${index}`}
                                      value={item.unit}
                                      onChange={(e) =>
                                        handleInputChange(index, "unit", e.target.value)
                                      }
                                    >
                                      {item.variant === "solid" ? (
                                        <>
                                          <FormControlLabel
                                            value="g"
                                            control={<Radio sx={{ color: "white" }} />}
                                            label="g"
                                            sx={{ color: "white" }}
                                          />
                                          <FormControlLabel
                                            value="kg"
                                            control={<Radio sx={{ color: "white" }} />}
                                            label="kg"
                                            sx={{ color: "white" }}
                                          />
                                        </>
                                      ) : (
                                        <>
                                          <FormControlLabel
                                            value="ml"
                                            control={<Radio sx={{ color: "white" }} />}
                                            label="ml"
                                            sx={{ color: "white" }}
                                          />
                                          <FormControlLabel
                                            value="l"
                                            control={<Radio sx={{ color: "white" }} />}
                                            label="l"
                                            sx={{ color: "white" }}
                                          />
                                        </>
                                      )}
                                    </RadioGroup>
                                  </FormControl>
                                </TableCell>
                                <TableCell>
                                  <img
                                    src={item.image || capturedImage}
                                    alt="Item"
                                    style={{ width: "50px", height: "50px" }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    onClick={() => handleRemoveRow(index)}
                                    sx={{ color: "white" }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              )}

              {/* Manual Form */}
              {inputMethod === "manual" && (
                <Box mt={2}>
                  <TableContainer
                    component={Paper}
                    sx={{ bgcolor: "black", width: "100%" }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "white" }}>Name</TableCell>
                          <TableCell sx={{ color: "white" }}>Quantity</TableCell>
                          <TableCell sx={{ color: "white" }}>Max Quantity</TableCell>
                          <TableCell sx={{ color: "white" }}>Variant</TableCell>
                          <TableCell sx={{ color: "white" }}>Weight/Volume</TableCell>
                          <TableCell sx={{ color: "white" }}>Units</TableCell>
                          <TableCell sx={{ color: "white" }}>Image</TableCell>
                          <TableCell sx={{ color: "white" }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                value={item.name}
                                onChange={(e) =>
                                  handleInputChange(index, "name", e.target.value)
                                }
                                fullWidth
                                sx={{ backgroundColor: "white" }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={item.quantity}
                                onChange={(e) =>
                                  handleInputChange(index, "quantity", e.target.value)
                                }
                                fullWidth
                                sx={{ backgroundColor: "white" }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={item.maxQuantity}
                                onChange={(e) =>
                                  handleInputChange(index, "maxQuantity", e.target.value)
                                }
                                fullWidth
                                sx={{ backgroundColor: "white" }}
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl component="fieldset">
                                <RadioGroup
                                  row
                                  aria-label="variant"
                                  name={`variant-${index}`}
                                  value={item.variant}
                                  onChange={(e) =>
                                    handleInputChange(index, "variant", e.target.value)
                                  }
                                >
                                  <FormControlLabel
                                    value="solid"
                                    control={<Radio sx={{ color: "white" }} />}
                                    label="Solid"
                                    sx={{ color: "white" }}
                                  />
                                  <FormControlLabel
                                    value="liquid"
                                    control={<Radio sx={{ color: "white" }} />}
                                    label="Liquid"
                                    sx={{ color: "white" }}
                                  />
                                </RadioGroup>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={item.measure}
                                label={
                                  item.variant === "solid"
                                    ? "Weight"
                                    : "Volume"
                                }
                                onChange={(e) =>
                                  handleInputChange(index, "measure", e.target.value)
                                }
                                fullWidth
                                sx={{ backgroundColor: "white" }}
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl component="fieldset">
                                <RadioGroup
                                  row
                                  aria-label="unit"
                                  name={`unit-${index}`}
                                  value={item.unit}
                                  onChange={(e) =>
                                    handleInputChange(index, "unit", e.target.value)
                                  }
                                >
                                  {item.variant === "solid" ? (
                                    <>
                                      <FormControlLabel
                                        value="g"
                                        control={<Radio sx={{ color: "white" }} />}
                                        label="g"
                                        sx={{ color: "white" }}
                                      />
                                      <FormControlLabel
                                        value="kg"
                                        control={<Radio sx={{ color: "white" }} />}
                                        label="kg"
                                        sx={{ color: "white" }}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <FormControlLabel
                                        value="ml"
                                        control={<Radio sx={{ color: "white" }} />}
                                        label="ml"
                                        sx={{ color: "white" }}
                                      />
                                      <FormControlLabel
                                        value="l"
                                        control={<Radio sx={{ color: "white" }} />}
                                        label="l"
                                        sx={{ color: "white" }}
                                      />
                                    </>
                                  )}
                                </RadioGroup>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleInputChange(
                                      index,
                                      "image",
                                      reader.result
                                    );
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt="Item"
                                  style={{ width: "50px", height: "50px", marginTop: "10px" }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleRemoveRow(index)}
                                sx={{ color: "white" }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddRow}
                    >
                      Add New Row
                    </Button>
                    {isFormValid() && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSubmit}
                        sx={{ ml: 2 }}
                      >
                        Submit All Items
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </>
          )}
          {activeScreen === "manage-inventory" && (
            <>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
              >
                Manage Inventory
              </Typography>
              <TableContainer
                component={Paper}
                sx={{ bgcolor: "#222", width: "100%" }}
              >
                <Table className={styles.manageInventoryTable}>
                  <TableHead>
                    <TableRow>
                      <TableCell className={styles.tableCell}>Name</TableCell>
                      <TableCell className={styles.tableCell}>
                        Quantity
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        Max Quantity
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        Variant
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        Weight/Volume
                      </TableCell>
                      <TableCell className={styles.tableCell}>Unit</TableCell>
                      <TableCell className={styles.tableCell}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className={styles.tableCell}>
                          {editingItem?.id === item.id ? (
                            <TextField
                              value={editingItem.name}
                              onChange={(e) =>
                                handleEditInputChange("name", e.target.value)
                              }
                              sx={{ backgroundColor: "white" }}
                            />
                          ) : (
                            item.name
                          )}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {editingItem?.id === item.id ? (
                            <TextField
                              value={editingItem.quantity}
                              onChange={(e) =>
                                handleEditInputChange(
                                  "quantity",
                                  e.target.value
                                )
                              }
                              sx={{ backgroundColor: "white" }}
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {editingItem?.id === item.id ? (
                            <TextField
                              value={editingItem.maxQuantity}
                              onChange={(e) =>
                                handleEditInputChange(
                                  "maxQuantity",
                                  e.target.value
                                )
                              }
                              sx={{ backgroundColor: "white" }}
                            />
                          ) : (
                            item.maxQuantity
                          )}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {editingItem?.id === item.id ? (
                            <FormControl component="fieldset">
                              <RadioGroup
                                row
                                aria-label="variant"
                                name={`variant-${item.id}`}
                                value={editingItem.variant}
                                onChange={(e) =>
                                  handleEditInputChange(
                                    "variant",
                                    e.target.value
                                  )
                                }
                              >
                                <FormControlLabel
                                  value="solid"
                                  control={<Radio sx={{ color: "white" }} />}
                                  label="Solid"
                                  sx={{ color: "white" }}
                                />
                                <FormControlLabel
                                  value="liquid"
                                  control={<Radio sx={{ color: "white" }} />}
                                  label="Liquid"
                                  sx={{ color: "white" }}
                                />
                              </RadioGroup>
                            </FormControl>
                          ) : (
                            item.variant
                          )}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {editingItem?.id === item.id ? (
                            <TextField
                              value={editingItem.measure}
                              label={
                                editingItem.variant === "solid"
                                  ? "Weight"
                                  : "Volume"
                              }
                              onChange={(e) =>
                                handleEditInputChange(
                                  "measure",
                                  e.target.value
                                )
                              }
                              sx={{ backgroundColor: "white" }}
                            />
                          ) : (
                            item.measure
                          )}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {editingItem?.id === item.id ? (
                            <FormControl component="fieldset">
                              <RadioGroup
                                row
                                aria-label="unit"
                                name={`unit-${item.id}`}
                                value={editingItem.unit}
                                onChange={(e) =>
                                  handleEditInputChange("unit", e.target.value)
                                }
                              >
                                {editingItem.variant === "solid" ? (
                                  <>
                                    <FormControlLabel
                                      value="g"
                                      control={<Radio sx={{ color: "white" }} />}
                                      label="g"
                                      sx={{ color: "white" }}
                                    />
                                    <FormControlLabel
                                      value="kg"
                                      control={<Radio sx={{ color: "white" }} />}
                                      label="kg"
                                      sx={{ color: "white" }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <FormControlLabel
                                      value="ml"
                                      control={<Radio sx={{ color: "white" }} />}
                                      label="ml"
                                      sx={{ color: "white" }}
                                    />
                                    <FormControlLabel
                                      value="l"
                                      control={<Radio sx={{ color: "white" }} />}
                                      label="l"
                                      sx={{ color: "white" }}
                                    />
                                  </>
                                )}
                              </RadioGroup>
                            </FormControl>
                          ) : (
                            item.unit
                          )}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {editingItem?.id === item.id ? (
                            <>
                              <IconButton
                                onClick={handleSave}
                                className={styles.saveButton}
                              >
                                <SaveIcon style={{ color: "green" }} />
                              </IconButton>
                              <IconButton
                                onClick={() => setEditingItem(null)}
                                className={styles.cancelButton}
                              >
                                <DeleteIcon style={{ color: "red" }} />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              onClick={() => handleEdit(item)}
                              className={styles.editButton}
                            >
                              <EditIcon style={{ color: "blue" }} />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => handleDelete(item.id)}
                            className={styles.deleteButton}
                          >
                            <DeleteIcon style={{ color: "red" }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;

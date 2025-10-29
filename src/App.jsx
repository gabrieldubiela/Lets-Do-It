
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Container,
  CssBaseline, 
  Box, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar, 
  Paper, 
  Grid,
  TextField,
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import TaskList from './TaskList';
import ProjectManager from './ProjectManager';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C63FF', // A vibrant purple
    },
    secondary: {
      main: '#FF6584', // A complementary pink
    },
    background: {
      default: '#1a1a2e', // Dark blue-purple
      paper: '#2c2c54',   // Slightly lighter blue-purple
    },
    text: {
      primary: '#ffffff',
      secondary: '#a9a9d4',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '0.1rem',
      color: '#ffffff',
    },
    h5: {
      fontWeight: 600,
      color: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
        },
        containedPrimary: {
          boxShadow: '0 3px 5px 2px rgba(108, 99, 255, .3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: '#2c2c54',
            }
        }
    }
  },
});

/**
 * The main component for the application. It handles user authentication,
 * project selection, and renders the main layout.
 */
function App() {
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Sets up an observer on the Firebase Auth object to listen for
   * changes in the user's sign-in state.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Handles the user authentication process, which can be either
   * signing in or signing up a new user.
   * @param {Event} e - The form submission event.
   */
  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName });
        
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          displayName: displayName,
          email: email,
        });

        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...user, ...userDoc.data() });
        } else {
          setError("Failed to create user profile.");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Handles the user logout process.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  /**
   * Updates the state with the ID of the currently selected project.
   * @param {string} projectId - The ID of the selected project.
   */
  const handleSelectProject = (projectId) => {
    setSelectedProject(projectId);
  };

  /**
   * Toggles between the login and sign-up forms.
   */
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
          <CircularProgress color="primary" />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Let's Do It
            </Typography>
            {user && (
              <Button color="primary" variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
          {user ? (
            <Paper 
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 4,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
                Welcome, {user.displayName || user.email}
              </Typography>
              <Grid container spacing={{ xs: 2, md: 4 }}>
                <Grid item xs={12} md={4}>
                  <ProjectManager 
                    user={user} 
                    selectedProject={selectedProject}
                    onSelectProject={handleSelectProject} 
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TaskList user={user} selectedProject={selectedProject} />
                </Grid>
              </Grid>
            </Paper>
          ) : (
            <Paper 
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '450px',
                mx: 'auto',
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {isLogin ? 'Welcome Back!' : 'Create an Account'}
              </Typography>
              <Box component="form" onSubmit={handleAuthAction} sx={{ mt: 1, width: '100%' }}>
                {!isLogin && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="displayName"
                    label="Display Name"
                    name="displayName"
                    autoComplete="name"
                    autoFocus
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
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
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                  <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
                <Grid container justifyContent="center">
                  <Grid item>
                    <MuiLink component="button" variant="body2" onClick={toggleAuthMode} sx={{ color: 'text.secondary' }}>
                      {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </MuiLink>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

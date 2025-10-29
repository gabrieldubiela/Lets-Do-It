
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  IconButton, 
  Typography 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * A component for managing projects, including creating, deleting,
 * and listing them.
 * @param {{ user: object, onSelectProject: Function, selectedProject: string }} props
 */
function ProjectManager({ user, onSelectProject, selectedProject }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  /**
   * Sets up a real-time listener to fetch the user's projects from Firestore.
   */
  useEffect(() => {
    if (user) {
      const q = query(collection(db, `users/${user.uid}/projects`));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const projectsArray = [];
        querySnapshot.forEach((doc) => {
          projectsArray.push({ ...doc.data(), id: doc.id });
        });
        setProjects(projectsArray);
      });
      return () => unsubscribe();
    }
  }, [user]);

  /**
   * Adds a new project to the user's collection in Firestore.
   * @param {Event} e - The form submission event.
   */
  const addProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim() === '') return;
    await addDoc(collection(db, `users/${user.uid}/projects`), {
      name: newProjectName,
    });
    setNewProjectName('');
  };

  /**
   * Deletes a project from the user's collection in Firestore.
   * @param {string} projectId - The ID of the project to delete.
   */
  const deleteProject = async (projectId) => {
    await deleteDoc(doc(db, `users/${user.uid}/projects`, projectId));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Projects</Typography>
      <form onSubmit={addProject}>
        <Box sx={{ display: 'flex', alignItems: 'stretch', mb: 3 }}>
          <TextField
            label="New Project"
            variant="outlined"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button 
            type="submit" 
            variant="contained"
            color="primary"
            size="large"
            endIcon={<AddIcon />}
            sx={{ py: 0 }}
          >
            Add
          </Button>
        </Box>
      </form>
      <List component="nav">
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            onClick={() => onSelectProject(null)} 
            selected={selectedProject === null}
            sx={{ borderRadius: 2 }}
          >
            <ListItemText primary="All Tasks" />
          </ListItemButton>
        </ListItem>
        {projects.map((project) => (
          <ListItem 
            key={project.id} 
            disablePadding
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => deleteProject(project.id)} color="secondary">
                <DeleteIcon />
              </IconButton>
            }
            sx={{ mb: 0.5 }}
          >
            <ListItemButton 
              onClick={() => onSelectProject(project.id)}
              selected={selectedProject === project.id}
              sx={{ borderRadius: 2 }}
            >
              <ListItemText primary={project.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ProjectManager;

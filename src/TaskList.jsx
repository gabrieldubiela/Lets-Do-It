
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Checkbox,
  Chip,
  Typography,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * A component for managing and displaying tasks for a selected project.
 * @param {{ user: object, selectedProject: string }} props
 */
function TaskList({ user, selectedProject }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState({});
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  /**
   * Sets up a real-time listener to fetch the user's projects and tasks
   * from Firestore based on the selected project.
   */
  useEffect(() => {
    if (user) {
      const projectsQuery = query(collection(db, `users/${user.uid}/projects`));
      const unsubscribeProjects = onSnapshot(projectsQuery, (querySnapshot) => {
        const projectsMap = {};
        querySnapshot.forEach((doc) => {
          projectsMap[doc.id] = doc.data();
        });
        setProjects(projectsMap);
      });

      let tasksQuery;
      if (selectedProject) {
        tasksQuery = query(
          collection(db, `users/${user.uid}/tasks`),
          where('projectId', '==', selectedProject)
        );
      } else {
        tasksQuery = query(collection(db, `users/${user.uid}/tasks`));
      }
      const unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
        const tasksArray = [];
        querySnapshot.forEach((doc) => {
          tasksArray.push({ ...doc.data(), id: doc.id });
        });
        // Sort tasks: completed tasks go to the bottom
        tasksArray.sort((a, b) => a.completed - b.completed);
        setTasks(tasksArray);
      });

      return () => {
        unsubscribeProjects();
        unsubscribeTasks();
      };
    }
  }, [user, selectedProject]);

  /**
   * Adds a new task to the user's collection in Firestore.
   * @param {Event} e - The form submission event.
   */
  const addTask = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || !selectedProject) {
      alert("Please select a project before adding a task.");
      return;
    }
    await addDoc(collection(db, `users/${user.uid}/tasks`), {
      text: input,
      completed: false,
      projectId: selectedProject,
    });
    setInput('');
  };

  /**
   * Toggles the completion status of a task in Firestore.
   * @param {object} task - The task to update.
   */
  const toggleComplete = async (task) => {
    await updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), {
      completed: !task.completed,
    });
  };

  /**
   * Deletes a task from the user's collection in Firestore.
   * @param {string} id - The ID of the task to delete.
   */
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
  };

  /**
   * Enters editing mode for a specific task.
   * @param {object} task - The task to edit.
   */
  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  /**
   * Exits editing mode without saving changes.
   */
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  /**
   * Saves the edited task text to Firestore.
   * @param {string} taskId - The ID of the task to save.
   */
  const saveEdit = async (taskId) => {
    if (editingText.trim() === '') return;
    await updateDoc(doc(db, `users/${user.uid}/tasks`, taskId), {
      text: editingText,
    });
    cancelEditing();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Tasks {selectedProject ? `for "${projects[selectedProject]?.name}"` : '(All Projects)'}
      </Typography>
      <form onSubmit={addTask}>
        <Box sx={{ display: 'flex', alignItems: 'stretch', mb: 3 }}>
          <TextField
            label="New Task"
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{ mr: 1 }}
            disabled={!selectedProject}
          />
          <Button 
            type="submit" 
            variant="contained"
            color="primary"
            size="large"
            endIcon={<AddIcon />} 
            disabled={!selectedProject}
            sx={{ py: 0 }}
          >
            Add
          </Button>
        </Box>
      </form>
      <List>
        {tasks.map((task) => (
          <Paper 
            elevation={1} 
            key={task.id} 
            sx={{
              mb: 1.5,
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <ListItem 
              sx={{ 
                borderRadius: 2,
                opacity: task.completed ? 0.6 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              {editingId === task.id ? (
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    sx={{ mr: 1 }}
                    autoFocus
                  />
                  <IconButton onClick={() => saveEdit(task.id)} color="primary"><SaveIcon /></IconButton>
                  <IconButton onClick={cancelEditing}><CancelIcon /></IconButton>
                </Box>
              ) : (
                <>
                  <Checkbox 
                    edge="start"
                    checked={task.completed}
                    tabIndex={-1}
                    disableRipple
                    onClick={() => toggleComplete(task)}
                    color="primary"
                  />
                  <ListItemText 
                    primary={task.text} 
                    sx={{ 
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary'
                    }}
                  />
                  {task.projectId && projects[task.projectId] && !selectedProject && (
                    <Chip label={projects[task.projectId].name} size="small" sx={{ mr: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }} />
                  )}
                  <IconButton edge="end" aria-label="edit" onClick={() => startEditing(task)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => deleteTask(task.id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
}

export default TaskList;

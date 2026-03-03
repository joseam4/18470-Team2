import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material'
import { getProjects, createProject, joinProject, leaveProject } from '../services/api'

function ProjectsPage() {
  const navigate = useNavigate()
  const userId = sessionStorage.getItem('userId')

  // Project list state
  const [projects, setProjects] = useState([])

  // Create project form state
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newProjectId, setNewProjectId] = useState('')

  // Join project form state
  const [joinProjectId, setJoinProjectId] = useState('')

  // Messages
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load projects when the page opens
  useEffect(() => {
    if (!userId) {
      navigate('/login')
      return
    }
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await getProjects(userId)
      setProjects(data.projects || [])
    } catch (err) {
      // Backend not connected yet - that's okay
      console.log('Could not load projects (backend not connected)')
    }
  }

  const handleCreateProject = async () => {
    if (!newName || !newProjectId) {
      setError('Project name and ID are required')
      return
    }

    try {
      await createProject(newName, newDescription, newProjectId, userId)
      setSuccess('Project created!')
      setError('')
      setNewName('')
      setNewDescription('')
      setNewProjectId('')
      loadProjects()
    } catch (err) {
      setError('Failed to create project. Please try again.')
      setSuccess('')
    }
  }

  const handleJoinProject = async () => {
    if (!joinProjectId) {
      setError('Please enter a Project ID')
      return
    }

    try {
      await joinProject(joinProjectId, userId)
      setSuccess('Joined project!')
      setError('')
      setJoinProjectId('')
      loadProjects()
    } catch (err) {
      setError('Failed to join project. Please try again.')
      setSuccess('')
    }
  }

  const handleLeaveProject = async (projectId) => {
    try {
      await leaveProject(projectId, userId)
      setSuccess('Left project!')
      setError('')
      loadProjects()
    } catch (err) {
      setError('Failed to leave project.')
      setSuccess('')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('userId')
    navigate('/login')
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HaaS System
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {userId}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* My Projects */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          My Projects
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Project ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No projects yet. Create or join one below.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow
                    key={project.projectId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                  >
                    <TableCell>{project.projectId}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.description}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLeaveProject(project.projectId)
                        }}
                      >
                        Leave
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ mb: 4 }} />

        {/* Create New Project + Join Existing Project side by side */}
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Create New Project */}
          <Paper sx={{ p: 3, flex: 1, minWidth: 280 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create New Project
            </Typography>
            <TextField
              label="Project Name"
              fullWidth
              margin="normal"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <TextField
              label="Project ID"
              fullWidth
              margin="normal"
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleCreateProject}
            >
              Create Project
            </Button>
          </Paper>

          {/* Join Existing Project */}
          <Paper sx={{ p: 3, flex: 1, minWidth: 280 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Join Existing Project
            </Typography>
            <TextField
              label="Project ID"
              fullWidth
              margin="normal"
              value={joinProjectId}
              onChange={(e) => setJoinProjectId(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleJoinProject}
            >
              Join Project
            </Button>
          </Paper>
        </Box>
      </Container>
    </>
  )
}

export default ProjectsPage

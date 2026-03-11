import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HardwareSet from '../components/HardwareSet'
import { getHardware, checkoutHardware, checkinHardware } from '../services/api'

function HardwarePage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const userId = sessionStorage.getItem('userId')

  const [hwSets, setHwSets] = useState([
    { name: 'HWSet1', capacity: 100, available: 100, checkedOut: 0 },
    { name: 'HWSet2', capacity: 100, available: 100, checkedOut: 0 },
  ])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!userId) {
      navigate('/login')
      return
    }
    loadHardware()
  }, [])

  const loadHardware = async () => {
    try {
      const data = await getHardware(projectId)
      if (data.hwSets) {
        setHwSets(data.hwSets)
      }
    } catch (err) {
      console.log('Could not load hardware (backend not connected)')
    }
  }

  const handleCheckout = async (hwSetName, quantity) => {
    try {
      await checkoutHardware(projectId, hwSetName, quantity)
      setSuccess(`Checked out ${quantity} units from ${hwSetName}`)
      setError('')
      loadHardware()
    } catch (err) {
      setError(err.message || `Failed to check out from ${hwSetName}`)
      setSuccess('')
    }
  }

  const handleCheckin = async (hwSetName, quantity) => {
    try {
      await checkinHardware(projectId, hwSetName, quantity)
      setSuccess(`Checked in ${quantity} units to ${hwSetName}`)
      setError('')
      loadHardware()
    } catch (err) {
      setError(err.message || `Failed to check in to ${hwSetName}`)
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>

        <Typography variant="h5" sx={{ mb: 1 }}>
          Project: {projectId}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage hardware resources for this project
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {hwSets.map((hw) => (
          <HardwareSet
            key={hw.name}
            name={hw.name}
            capacity={hw.capacity}
            available={hw.available}
            checkedOut={hw.checkedOut}
            onCheckout={(qty) => handleCheckout(hw.name, qty)}
            onCheckin={(qty) => handleCheckin(hw.name, qty)}
          />
        ))}
      </Container>
    </>
  )
}

export default HardwarePage

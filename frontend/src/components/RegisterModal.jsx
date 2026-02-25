import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material'
import { registerUser } from '../services/api'

function RegisterModal({ open, onClose }) {
  const [userid, setUserid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async () => {
    // Simple validation
    if (!userid || !password) {
      setError('Please fill in both fields')
      return
    }

    try {
      await registerUser(userid, password)
      setSuccess('Account created! You can now sign in.')
      setError('')
      setUserid('')
      setPassword('')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setSuccess('')
    }
  }

  const handleClose = () => {
    setUserid('')
    setPassword('')
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create New Account</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <TextField
          label="User ID"
          fullWidth
          margin="normal"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleRegister} variant="contained">
          Register
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RegisterModal

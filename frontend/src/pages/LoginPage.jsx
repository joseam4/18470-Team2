import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
} from '@mui/material'
import RegisterModal from '../components/RegisterModal'
import { loginUser } from '../services/api'

function LoginPage() {
  const navigate = useNavigate()
  const [userid, setUserid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [registerOpen, setRegisterOpen] = useState(false)

  const handleLogin = async () => {
    // Simple validation
    if (!userid || !password) {
      setError('Please enter both User ID and Password')
      return
    }

    try {
      await loginUser(userid, password)
      // Store the userId so other pages can use it
      sessionStorage.setItem('userId', userid)
      navigate('/projects')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          HaaS System
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Hardware as a Service
        </Typography>

        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2, mb: 2 }}
            onClick={handleLogin}
          >
            Sign In
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setRegisterOpen(true)}
            >
              New User? Create an account
            </Link>
          </Box>
        </Paper>
      </Box>

      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </Container>
  )
}

export default LoginPage

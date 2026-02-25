import { useState } from 'react'
import { Box, Typography, TextField, Button, Paper } from '@mui/material'

function HardwareSet({ name, capacity, available, checkedOut, onCheckout, onCheckin }) {
  const [quantity, setQuantity] = useState(0)

  const handleCheckout = () => {
    if (quantity > 0) {
      onCheckout(quantity)
      setQuantity(0)
    }
  }

  const handleCheckin = () => {
    if (quantity > 0) {
      onCheckin(quantity)
      setQuantity(0)
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {name}
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">Capacity</Typography>
          <Typography variant="h5">{capacity}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">Available</Typography>
          <Typography variant="h5">{available}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">Checked Out (this project)</Typography>
          <Typography variant="h5">{checkedOut}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Quantity"
          type="number"
          size="small"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
          sx={{ width: 120 }}
          inputProps={{ min: 0 }}
        />
        <Button variant="contained" onClick={handleCheckout}>
          Check Out
        </Button>
        <Button variant="outlined" onClick={handleCheckin}>
          Check In
        </Button>
      </Box>
    </Paper>
  )
}

export default HardwareSet


const API_BASE = 'http://localhost:5001/api'

// Helper: parse response and throw on errors
async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }
  return data
}

// --- User Authentication ---

export async function loginUser(userid, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userid, password }),
  })
  return handleResponse(response)
}

export async function registerUser(userid, password) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userid, password }),
  })
  return handleResponse(response)
}

// --- Projects ---

export async function getProjects(userId) {
  const response = await fetch(`${API_BASE}/projects?userId=${userId}`)
  return handleResponse(response)
}

export async function createProject(name, description, projectId, userId) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, projectId, userId }),
  })
  return handleResponse(response)
}

export async function joinProject(projectId, userId) {
  const response = await fetch(`${API_BASE}/projects/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, userId }),
  })
  return handleResponse(response)
}

// --- Hardware ---

export async function getHardware(projectId) {
  const response = await fetch(`${API_BASE}/hardware?projectId=${projectId}`)
  return handleResponse(response)
}

export async function checkoutHardware(projectId, hwSet, quantity) {
  const response = await fetch(`${API_BASE}/hardware/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, hwSet, quantity }),
  })
  return handleResponse(response)
}

export async function checkinHardware(projectId, hwSet, quantity) {
  const response = await fetch(`${API_BASE}/hardware/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, hwSet, quantity }),
  })
  return handleResponse(response)
}

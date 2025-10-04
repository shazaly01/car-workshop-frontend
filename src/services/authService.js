import apiClient from './apiClient'

export default {
  login(credentials) {
    // credentials will be { username: '...', password: '...' }
    return apiClient.post('/login', credentials)
  },
}

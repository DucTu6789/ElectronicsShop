import axiosClient from './axiosClient.js'

const authApi = {
  // POST /api/auth/login    body: { email, password }
  login: (data) => axiosClient.post('/auth/login', data),

  // POST /api/auth/register body: { email, password, fullName? }
  register: (data) => axiosClient.post('/auth/register', data),

  // GET /api/auth/me -> user hiện tại, đọc từ DB (cần token)
  me: () => axiosClient.get('/auth/me'),
}

export default authApi

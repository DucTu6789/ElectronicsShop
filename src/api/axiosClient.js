import axios from 'axios'
import { getToken } from '../utils/authStorage.js'

// Axios instance dùng chung cho toàn bộ project
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Interceptor request: tự gắn JWT (nếu đã đăng nhập) vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ASP.NET trả lỗi validate dạng { errors: { Email: ['...'], Password: ['...'] } }
// -> chuyển thành { email: '...', password: '...' } để hiện đúng dưới từng ô nhập
const toFieldErrors = (errors) =>
  Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [
      key.charAt(0).toLowerCase() + key.slice(1),
      [].concat(messages)[0],
    ]),
  )

// Interceptor response: trả thẳng data, và chuyển lỗi về Error có message dễ đọc
//   error.status      -> mã HTTP (400, 401, 409, ...)
//   error.fieldErrors -> lỗi theo từng ô nhập (nếu server trả về)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Có lỗi xảy ra, vui lòng thử lại.'
    let fieldErrors
    const status = error.response?.status

    if (error.response) {
      const data = error.response.data
      const url = error.config?.url || ''
      if (status === 401 && !url.includes('/auth/login')) {
        // Token hết hạn hoặc không hợp lệ -> đăng xuất
        window.dispatchEvent(new Event('auth:logout'))
        message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
      } else if (data?.message) message = data.message
      else if (data?.errors) {
        fieldErrors = toFieldErrors(data.errors)
        message = Object.values(fieldErrors).join(' ')
      } else message = `Lỗi ${status}`
    } else if (error.request) {
      message = 'Không kết nối được tới server. Hãy kiểm tra backend đã chạy chưa.'
    }

    const err = new Error(message)
    err.status = status
    err.fieldErrors = fieldErrors
    return Promise.reject(err)
  },
)

export default axiosClient

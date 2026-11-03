// Đọc / ghi thông tin đăng nhập trong localStorage của trình duyệt.
// Gom toàn bộ vào MỘT key duy nhất:  { token, expiresAt, user: { id, email, fullName, role } }
// AuthContext và axiosClient cùng dùng file này nên luôn thống nhất với nhau.

export const AUTH_STORAGE_KEY = 'techstore.auth'

// Trả về dữ liệu đăng nhập còn hợp lệ, hoặc null (chưa đăng nhập / token đã hết hạn / dữ liệu hỏng)
export function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (!data?.token || !data?.user?.email) return null

    if (data.expiresAt && new Date(data.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY) // token đã hết hạn
      return null
    }
    return data
  } catch {
    return null // JSON hỏng hoặc trình duyệt chặn localStorage
  }
}

export function saveAuth(data) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* bỏ qua nếu trình duyệt chặn localStorage */
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    /* bỏ qua */
  }
}

export const getToken = () => loadAuth()?.token ?? null

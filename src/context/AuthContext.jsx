import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import authApi from '../api/authApi.js'
import { AUTH_STORAGE_KEY, clearAuth, getToken, loadAuth, saveAuth } from '../utils/authStorage.js'

const AuthContext = createContext(null)

// Thời gian tối đa của setTimeout (~24,8 ngày) - vượt quá sẽ bị chạy ngay
const MAX_TIMEOUT = 2 ** 31 - 1

// AuthProvider giữ thông tin đăng nhập cho cả ứng dụng:
//   - state `auth` = { token, expiresAt, user } (hoặc null nếu chưa đăng nhập)
//   - mỗi lần thay đổi đều được ghi vào localStorage -> F5 / đóng mở lại trình duyệt vẫn còn đăng nhập
export function AuthProvider({ children }) {
  // Khởi tạo từ localStorage (loadAuth tự bỏ qua token đã hết hạn)
  const [auth, setAuth] = useState(() => loadAuth())

  // Lưu vào cả state (để giao diện cập nhật) lẫn localStorage (để nhớ sau khi tải lại trang)
  const persist = useCallback((data) => {
    saveAuth(data)
    setAuth(data)
    return data.user
  }, [])

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password })
      return persist({ token: res.token, expiresAt: res.expiresAt, user: res.user })
    },
    [persist],
  )

  const register = useCallback(
    async ({ email, password, fullName }) => {
      const res = await authApi.register({ email, password, fullName })
      return persist({ token: res.token, expiresAt: res.expiresAt, user: res.user })
    },
    [persist],
  )

  const logout = useCallback(() => {
    clearAuth()
    setAuth(null)
  }, [])

  // axiosClient phát sự kiện này khi server trả 401 (token hết hạn / không hợp lệ / user bị xóa)
  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  // Tự đăng xuất đúng lúc token hết hạn (kể cả khi người dùng cứ để nguyên trang)
  const expiresAt = auth?.expiresAt
  useEffect(() => {
    if (!expiresAt) return undefined
    const remaining = new Date(expiresAt).getTime() - Date.now()
    if (remaining <= 0) {
      logout()
      return undefined
    }
    const timer = setTimeout(logout, Math.min(remaining, MAX_TIMEOUT))
    return () => clearTimeout(timer)
  }, [expiresAt, logout])

  // Đồng bộ giữa các tab: đăng xuất / đăng nhập ở tab này thì tab kia cũng cập nhật
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === AUTH_STORAGE_KEY || e.key === null) setAuth(loadAuth())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Khi mở lại trang: hỏi server (GET /auth/me -> query DB) để chắc chắn token còn hiệu lực,
  // đồng thời làm mới thông tin user (đổi tên, đổi quyền...). Lỗi 401 sẽ tự đăng xuất qua axiosClient.
  useEffect(() => {
    const token = getToken()
    if (!token) return undefined

    let cancelled = false
    authApi
      .me()
      .then((user) => {
        if (cancelled) return
        setAuth((prev) => {
          // Bỏ qua nếu trong lúc chờ người dùng đã đăng xuất / đăng nhập tài khoản khác
          if (!prev || prev.token !== token) return prev
          const next = { ...prev, user }
          saveAuth(next)
          return next
        })
      })
      .catch(() => {
        /* mất mạng... -> giữ nguyên thông tin đã lưu */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user: auth?.user ?? null, // { id, email, fullName, role }
      token: auth?.token ?? null,
      expiresAt: auth?.expiresAt ?? null,
      isAuthenticated: Boolean(auth?.token),
      isAdmin: auth?.user?.role === 'Admin',
      login,
      register,
      logout,
    }),
    [auth, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}

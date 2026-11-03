import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useForm from '../hooks/useForm.js'
import { validateLoginForm } from '../utils/validators.js'

const initialValues = { email: '', password: '' }

export default function Login() {
  const { isAuthenticated, isAdmin, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(initialValues, validateLoginForm)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  // Đã đăng nhập rồi thì không cần vào trang này nữa
  if (isAuthenticated) return <Navigate to={from || (isAdmin ? '/admin/products' : '/')} replace />

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true)
    setFormError('')
    try {
      const user = await login(email, password) // gọi API -> lưu vào Context + localStorage
      navigate(from || (user.role === 'Admin' ? '/admin/products' : '/'), { replace: true })
    } catch (err) {
      setFormError(err.message) // ví dụ: "Sai email hoặc mật khẩu"
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="container page">
      <form className="contact-form login-form" onSubmit={onSubmit} noValidate>
        <h1 className="page-title">Đăng nhập</h1>
        {formError && <div className="alert alert-error">{formError}</div>}
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
        />
        <FormField
          label="Mật khẩu"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <p className="form-note">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useForm from '../hooks/useForm.js'
import { validateRegisterForm } from '../utils/validators.js'

const initialValues = { fullName: '', email: '', password: '', confirm: '' }

export default function Register() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()

  const { values, errors, handleChange, handleBlur, handleSubmit, setServerErrors } = useForm(
    initialValues,
    validateRegisterForm,
  )
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const onSubmit = handleSubmit(async ({ fullName, email, password }) => {
    setLoading(true)
    setFormError('')
    try {
      // Gọi API -> server validate lại, lưu user vào DB -> lưu phiên đăng nhập vào Context + localStorage
      await register({ fullName: fullName.trim(), email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (err) {
      if (err.status === 409) setServerErrors({ email: err.message }) // email đã tồn tại
      else if (err.fieldErrors) setServerErrors(err.fieldErrors) // server báo lỗi từng ô
      else setFormError(err.message)
    } finally {
      setLoading(false)
    }
  })

  return (
    <div className="container page">
      <form className="contact-form login-form" onSubmit={onSubmit} noValidate>
        <h1 className="page-title">Đăng ký tài khoản</h1>
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
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          hint="Tối thiểu 8 ký tự, gồm cả chữ và số"
        />
        <FormField
          label="Nhập lại mật khẩu"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirm}
        />
        <FormField
          label="Họ và tên (không bắt buộc)"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <p className="form-note">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}

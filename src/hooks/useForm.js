import { useMemo, useState } from 'react'

// Hook quản lý form + hiển thị lỗi theo từng ô.
//   initialValues : { email: '', password: '' }
//   validate      : (values) => ({ email: 'lỗi...' })  - hàm thuần, khai báo NGOÀI component
//
// Quy tắc hiển thị lỗi:
//   - Lỗi validate chỉ hiện sau khi người dùng rời khỏi ô đó (blur) hoặc bấm gửi form
//   - Lỗi do server trả về (setServerErrors) hiện ngay và tự mất khi người dùng sửa ô đó
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})

  const clientErrors = useMemo(() => validate(values), [validate, values])

  const errors = {}
  for (const name of Object.keys(initialValues)) {
    if (touched[name] && clientErrors[name]) errors[name] = clientErrors[name]
    else if (serverErrors[name]) errors[name] = serverErrors[name]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }))
  }

  // Dùng: <form onSubmit={handleSubmit(async (values) => {...})}>
  // onValid chỉ chạy khi toàn bộ dữ liệu hợp lệ
  const handleSubmit = (onValid) => (e) => {
    e.preventDefault()
    setTouched(Object.fromEntries(Object.keys(initialValues).map((name) => [name, true])))
    if (Object.keys(clientErrors).length > 0) return undefined
    return onValid(values)
  }

  return { values, errors, handleChange, handleBlur, handleSubmit, setServerErrors }
}

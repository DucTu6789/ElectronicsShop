// Kiểm tra dữ liệu ở phía trình duyệt (cho người dùng thấy lỗi ngay).
// Quy tắc giống hệt backend (Dtos/AuthDtos.cs) - backend vẫn kiểm tra lại lần nữa vì client có thể bị bỏ qua.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 100

export function validateEmail(value = '') {
  const email = value.trim()
  if (!email) return 'Vui lòng nhập email'
  if (email.length > 254) return 'Email tối đa 254 ký tự'
  if (!EMAIL_REGEX.test(email)) return 'Email không hợp lệ'
  return ''
}

// Mật khẩu khi ĐĂNG KÝ: 8-100 ký tự, có ít nhất 1 chữ cái và 1 chữ số
export function validateNewPassword(value = '') {
  if (!value) return 'Vui lòng nhập mật khẩu'
  if (value.length < PASSWORD_MIN) return `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự`
  if (value.length > PASSWORD_MAX) return `Mật khẩu tối đa ${PASSWORD_MAX} ký tự`
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Mật khẩu phải có ít nhất 1 chữ cái và 1 chữ số'
  return ''
}

// Các hàm dưới trả về object lỗi theo từng ô, ví dụ { email: '...', password: '...' } ({} nếu hợp lệ)
const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message))

export function validateLoginForm({ email, password }) {
  return compact({
    email: validateEmail(email),
    // Đăng nhập chỉ cần có mật khẩu, không kiểm tra độ mạnh
    password: password ? '' : 'Vui lòng nhập mật khẩu',
  })
}

export function validateRegisterForm({ fullName, email, password, confirm }) {
  return compact({
    fullName: fullName.trim().length > 100 ? 'Họ tên tối đa 100 ký tự' : '',
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirm: !confirm ? 'Vui lòng nhập lại mật khẩu' : confirm !== password ? 'Mật khẩu nhập lại không khớp' : '',
  })
}

import { useAuth } from '../context/AuthContext.jsx'

// Trang tài khoản: hiển thị thông tin user lấy từ AuthContext (đã được lưu trong localStorage)
export default function Profile() {
  const { user, expiresAt } = useAuth()

  return (
    <div className="container page">
      <div className="contact-info profile-card">
        <h1 className="page-title">Tài khoản của tôi</h1>
        <dl className="profile-list">
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Họ và tên</dt>
          <dd>{user.fullName || <span className="muted">Chưa cập nhật</span>}</dd>
          <dt>Vai trò</dt>
          <dd>{user.role === 'Admin' ? 'Quản trị viên' : 'Khách hàng'}</dd>
          {expiresAt && (
            <>
              <dt>Phiên đăng nhập hết hạn lúc</dt>
              <dd>{new Date(expiresAt).toLocaleString('vi-VN')}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  )
}

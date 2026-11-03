import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const menu = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/products', label: 'Sản phẩm' },
  { to: '/about-us', label: 'Giới thiệu' },
  { to: '/contact', label: 'Liên hệ' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  // Menu "Quản trị" chỉ hiện với tài khoản Admin
  const items = isAdmin ? [...menu, { to: '/admin/products', label: 'Quản trị' }] : menu

  const onLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="header">
      <div className="topbar">
        <div className="container topbar-inner">
          <span>🚚 Miễn phí giao hàng toàn quốc cho đơn từ 500.000₫</span>
          <span>☎ Hotline: 1900 1234</span>
        </div>
      </div>

      <div className="container header-main">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark">T</span>
          Tech<span>Store</span>
        </Link>

        <nav className={`nav ${open ? 'nav-open' : ''}`}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hello" title={user.email} onClick={() => setOpen(false)}>
                Xin chào, {user.fullName || user.email}
              </Link>
              <button className="logout-btn" type="button" onClick={onLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link">Đăng nhập</Link>
              <Link to="/register" className="auth-link auth-link-primary">Đăng ký</Link>
            </>
          )}
          <button className="cart-btn" type="button" aria-label="Giỏ hàng">
            🛒 <span className="cart-count">0</span>
          </button>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Mở menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}

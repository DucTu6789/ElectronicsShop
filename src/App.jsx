import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import AboutUs from './pages/AboutUs.jsx'
import Contact from './pages/Contact.jsx'
import AdminProducts from './pages/AdminProducts.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NotFound from './pages/NotFound.jsx'

// Cấu hình route: mỗi URL tương ứng một page
//   /                  -> Trang chủ
//   /products          -> Danh sách sản phẩm
//   /products/:id      -> Chi tiết sản phẩm
//   /about-us          -> Giới thiệu
//   /contact           -> Liên hệ
//   /login, /register  -> Đăng nhập / Đăng ký
//   /profile           -> Thông tin tài khoản (cần đăng nhập)
//   /admin/products    -> Quản lý sản phẩm (chỉ tài khoản Admin)
//   *                  -> 404
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin/products" element={<AdminProducts />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

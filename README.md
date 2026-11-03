# TechStore – Website bán hàng điện tử

Đồ án cuối môn: website bán thiết bị điện tử.

- **Front-end:** ReactJS (Vite), React Router, Axios
- **Back-end:** ASP.NET Core 8 Web API, Entity Framework Core 8
- **Database:** SQLite (file `techstore.db`, không cần cài server). Có thể đổi sang SQL Server, xem cuối file.

## Cài đặt (làm 1 lần)

Cần cài sẵn: [Node.js 18+](https://nodejs.org) và [.NET SDK 8](https://dotnet.microsoft.com/download).
Sau khi cài .NET, đóng và mở lại terminal / VS Code.

```bash
npm install
dotnet tool install --global dotnet-ef     # chỉ cần khi muốn tạo migration
```

## Chạy project

**Cách 1 – chạy cả hai bằng 1 lệnh (thư mục gốc):**

```bash
npm run dev:all
```

**Cách 2 – chạy riêng hai terminal:**

```bash
npm run api      # terminal 1: backend  -> http://localhost:5000/swagger
npm run dev      # terminal 2: frontend -> http://localhost:3000
```

Lần chạy đầu tiên, backend tự tạo file `techstore.db` với 6 danh mục và 12 sản phẩm mẫu.

## Các route (React Router)

| URL | Trang |
| --- | --- |
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm (lọc theo `?categoryId=1`) |
| `/products/:id` | Chi tiết sản phẩm |
| `/about-us` | Giới thiệu |
| `/contact` | Liên hệ |
| `/login`, `/register` | Đăng nhập, Đăng ký |
| `/profile` | Thông tin tài khoản – **cần đăng nhập** |
| `/admin/products` | Quản lý sản phẩm (thêm / sửa / xóa) – **chỉ tài khoản Admin** |
| `*` | Trang 404 |

Route khai báo ở `src/App.jsx`, `BrowserRouter` ở `src/main.jsx`, menu dùng `NavLink` ở `src/components/Header.jsx`.
Click menu hoặc gõ thẳng URL (ví dụ `http://localhost:3000/about-us`) đều ra đúng trang.

## API (ASP.NET Core)

Thư mục `backend/TechStore.Api`.

| Method | URL | Chức năng |
| --- | --- | --- |
| POST | `/api/auth/register` | Đăng ký bằng email + mật khẩu, nhận JWT |
| POST | `/api/auth/login` | Đăng nhập bằng email + mật khẩu, nhận JWT |
| GET 🔒 | `/api/auth/me` | Thông tin người đang đăng nhập (đọc từ DB) |
| GET | `/api/products?categoryId=&search=` | Danh sách sản phẩm |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| POST 🔒 | `/api/products` | Thêm sản phẩm |
| PUT 🔒 | `/api/products/{id}` | Cập nhật sản phẩm |
| DELETE 🔒 | `/api/products/{id}` | Xóa sản phẩm |
| GET / POST 🔒 / PUT 🔒 / DELETE 🔒 | `/api/categories`, `/api/categories/{id}` | Quản lý danh mục |

🔒 = cần đăng nhập (header `Authorization: Bearer <token>`); riêng `products` / `categories` thì cần vai trò Admin.

Body mẫu cho POST / PUT `/api/products`:

```json
{
  "name": "Chuột không dây M1",
  "icon": "🖱️",
  "price": 350000,
  "oldPrice": 450000,
  "rating": 4.5,
  "badge": "Mới",
  "description": "Chuột không dây yên tĩnh",
  "specs": ["Bluetooth 5.0", "Pin 12 tháng"],
  "categoryId": 6
}
```

Các file chính:

- `Controllers/` – `AuthController`, `ProductsController`, `CategoriesController`
- `Models/` – `Product`, `Category`, `User`
- `Dtos/` – dữ liệu request / response và kiểm tra hợp lệ
- `Data/AppDbContext.cs` – DbContext của EF Core; `Data/SeedData.cs` – dữ liệu mẫu
- `Program.cs` – đăng ký DbContext, CORS cho `localhost:3000`, Swagger

## Tài khoản, đăng ký, đăng nhập (JWT)

Đăng ký / đăng nhập bằng **email + mật khẩu**. Luồng hoạt động:

1. **Nhập thông tin** – form `/register` (email, mật khẩu, nhập lại mật khẩu, họ tên không bắt buộc) và `/login` (email, mật khẩu).
2. **Validate** – 2 lớp, cùng quy tắc:
   - Front-end (`src/utils/validators.js`, hook `src/hooks/useForm.js`): báo lỗi ngay dưới từng ô khi rời khỏi ô hoặc bấm gửi; có lỗi thì **không gọi API**.
   - Back-end (`Dtos/AuthDtos.cs`, DataAnnotations): server luôn kiểm tra lại, sai thì trả `400` kèm lỗi theo từng ô.
   - Quy tắc: email đúng định dạng (tối đa 254 ký tự); mật khẩu 8–100 ký tự, có ít nhất 1 chữ cái và 1 chữ số; họ tên tối đa 100 ký tự. (Đăng nhập chỉ yêu cầu có nhập mật khẩu.)
3. **Lưu user vào DB** – `POST /api/auth/register` kiểm tra email chưa tồn tại (trùng → `409`), băm mật khẩu PBKDF2 (không lưu mật khẩu thật), `INSERT` vào bảng `Users` (cột `Email` có unique index), rồi đăng nhập luôn.
4. **Query DB khi đăng nhập** – `POST /api/auth/login` `SELECT` user theo email (email được chuẩn hoá: bỏ khoảng trắng, chữ thường), so khớp mật khẩu với bản băm; đúng thì trả JWT + thông tin user, sai thì `401` "Sai email hoặc mật khẩu" (không tiết lộ email có tồn tại hay không).
5. **Context + localStorage** (`src/context/AuthContext.jsx`, `src/utils/authStorage.js`):
   - Sau khi đăng nhập / đăng ký thành công, `{ token, expiresAt, user }` được lưu vào **state của AuthContext** và vào **localStorage** (key `techstore.auth`).
   - Mọi component lấy dữ liệu bằng `const { user, isAuthenticated, isAdmin, login, register, logout } = useAuth()`.
   - Tải lại trang (F5) vẫn còn đăng nhập; token hết hạn thì bỏ qua và tự đăng xuất đúng giờ.
   - Khi mở lại trang, front-end gọi `GET /api/auth/me` để server kiểm tra token và làm mới thông tin user từ DB; `401` (token sai / user bị xóa) → tự đăng xuất.
   - Đăng xuất / đăng nhập ở một tab thì các tab khác tự cập nhật (sự kiện `storage`).
   - `axiosClient` tự gắn `Authorization: Bearer <token>` vào mọi request.
   - `ProtectedRoute` chặn route: chưa đăng nhập → `/login` (đăng nhập xong quay lại trang đang muốn vào); không phải Admin → về trang chủ.

**Tài khoản Admin mặc định:** `admin@techstore.vn` / `Admin@123` (đổi trong `appsettings.json`, mục `AdminAccount`; được tạo tự động khi backend khởi động nếu chưa có). Đăng ký ở `/register` luôn tạo tài khoản vai trò `User`.

**Thử nhanh:** chạy `npm run dev:all`, vào `http://localhost:3000/register` đăng ký một email → header hiện "Xin chào, <email>" → F5 vẫn còn đăng nhập → bấm tên để xem `/profile` → "Đăng xuất". Có thể xem bản ghi trong bảng `Users` của file `techstore.db` bằng DB Browser for SQLite.

**Thử bằng Swagger:** gọi `/api/auth/login`, copy `token`, bấm nút **Authorize** rồi dán token.

> **Lưu ý khi cập nhật từ bản cũ (đăng nhập bằng tên đăng nhập):** bảng `Users` đổi cột `Username` → `Email`. Khi chạy, backend tự phát hiện database cũ và tạo lại database mẫu (chỉ ở môi trường Development, **dữ liệu cũ sẽ mất**). Nếu bạn đã chạy `dotnet ef migrations`, hãy xóa `techstore.db` và thư mục `Migrations/` rồi tạo lại migration `InitialCreate`.
>
> Token JWT được lưu ở `localStorage` theo yêu cầu bài tập; cách này đơn giản nhưng dễ bị đánh cắp nếu trang bị lỗi XSS. Ứng dụng thật thường dùng cookie `HttpOnly`.

## Front-end gọi API bằng Axios

- `src/api/axiosClient.js` – instance Axios (baseURL lấy từ `.env`, biến `VITE_API_URL`, mặc định `http://localhost:5000/api`)
- `src/api/authApi.js` – gọi `login`, `register`, `me`
- `src/api/productApi.js`, `src/api/categoryApi.js` – các hàm GET / POST / PUT / DELETE
- `src/hooks/useFetch.js` – hook gọi API (loading, error, reload)
- `src/pages/AdminProducts.jsx` – form thêm (POST), sửa (PUT), xóa (DELETE) sản phẩm

## Cấu hình database và EF Core migration

**Kết nối database:** chuỗi kết nối ở `backend/TechStore.Api/appsettings.json`:

```json
"ConnectionStrings": { "DefaultConnection": "Data Source=techstore.db" }
```

`Program.cs` đăng ký: `AddDbContext<AppDbContext>(o => o.UseSqlite(...))`.

**Mặc định** project tự tạo database khi chạy (không cần migration). Để thực hành **migration** của EF Core:

```bash
cd backend/TechStore.Api
# xóa database cũ nếu đã chạy trước đó
del techstore.db            # Windows (PowerShell: Remove-Item techstore.db)
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Từ khi có thư mục `Migrations/`, `Program.cs` tự dùng `Migrate()` thay cho tạo trực tiếp.
Khi sửa model: `dotnet ef migrations add TenThayDoi` rồi `dotnet ef database update`.

### Đổi sang SQL Server (nếu giảng viên yêu cầu)

1. Trong `TechStore.Api.csproj` đổi package `Microsoft.EntityFrameworkCore.Sqlite` thành `Microsoft.EntityFrameworkCore.SqlServer` (cùng phiên bản).
2. `Program.cs`: `UseSqlite` → `UseSqlServer`.
3. `appsettings.json`:
   `"Server=localhost\\SQLEXPRESS;Database=TechStoreDb;Trusted_Connection=True;TrustServerCertificate=True"`
4. Xóa thư mục `Migrations/` (nếu có), rồi chạy `dotnet ef migrations add InitialCreate` và `dotnet ef database update`.

## Cấu trúc thư mục

```
techstore/
├── index.html, vite.config.js, package.json
├── public/favicon.svg
├── backend/TechStore.Api/        # ASP.NET Core Web API
└── src/
    ├── main.jsx                  # điểm vào, bọc BrowserRouter
    ├── App.jsx                   # khai báo routes
    ├── index.css                 # CSS toàn bộ giao diện
    ├── api/                      # axiosClient, authApi, productApi, categoryApi
    ├── context/AuthContext.jsx   # trạng thái đăng nhập (Context + localStorage)
    ├── hooks/                    # useFetch, useForm
    ├── utils/                    # format, validators, authStorage
    ├── layouts/MainLayout.jsx
    ├── components/               # Header, Footer, ProductCard, Status, FormField, ProtectedRoute
    └── pages/                    # Home, Products, ProductDetail, AboutUs, Contact, Login, Register, Profile, AdminProducts, NotFound
```

## Đưa code lên GitHub

1. Đăng ký tài khoản tại https://github.com, tạo repository mới (ví dụ `techstore`), **không** tick thêm README.
2. Chạy ở thư mục gốc project:

```bash
git init
git add .
git commit -m "Khởi tạo project TechStore"
git branch -M main
git remote add origin https://github.com/<ten-tai-khoan>/techstore.git
git push -u origin main
```

`.gitignore` đã loại `node_modules`, `bin`, `obj`, `*.db` và `.env`.

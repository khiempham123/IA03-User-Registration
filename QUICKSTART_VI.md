# Hướng Dẫn Nhanh - IA03

## Chạy Dự Án Trên Máy Local

### Bước 1: Chuẩn bị MongoDB

Chạy MongoDB bằng Docker (khuyến nghị):
```powershell
docker run -d --name ia03-mongo -p 27017:27017 mongo:6
```

Kiểm tra container đang chạy:
```powershell
docker ps
```

### Bước 2: Chạy Backend

Mở PowerShell tại thư mục backend:
```powershell
cd E:\IA03-22120159\backend
npm install
npm run start
```

Chờ thông báo: "Backend listening on http://localhost:3333"

### Bước 3: Chạy Frontend

Mở PowerShell mới tại thư mục frontend:
```powershell
cd E:\IA03-22120159\frontend
npm install
npm run dev
```

Truy cập: http://localhost:5173

---

## Kiểm Tra Hệ Thống

### Test Backend (PowerShell)

**Đăng ký user mới:**
```powershell
curl -X POST http://localhost:3333/user/register -H "Content-Type: application/json" -d '{ "email":"test@example.com", "password":"secret123" }'
```

**Đăng nhập:**
```powershell
curl -X POST http://localhost:3333/user/login -H "Content-Type: application/json" -d '{ "email":"test@example.com", "password":"secret123" }'
```

### Test Frontend (Trình duyệt)

1. Mở http://localhost:5173
2. Vào trang Sign Up
3. Đăng ký với email và password (tối thiểu 6 ký tự)
4. Hệ thống tự động đăng nhập và chuyển về Home
5. Click "Tăng số đêm" để tăng bộ đếm
6. Vào Profile để xem và sửa thông tin
7. Test Logout

---

## Các Tính Năng Đã Hoàn Thành

### Backend ✅
- POST /user/register - Đăng ký user
- POST /user/login - Đăng nhập với JWT token
- GET /user/profile - Xem thông tin (yêu cầu token)
- PUT /user/profile - Cập nhật email (yêu cầu token)
- Validation email và password
- Hash password với bcrypt
- CORS enabled

### Frontend ✅
- Trang Home với thông báo chào mừng
- Trang Sign Up với validation
- Trang Login kết nối backend
- Trang Profile để xem/sửa thông tin
- Tự động đăng nhập sau khi đăng ký
- Bộ đếm số đêm với nút tăng
- Header hiển thị email user
- Footer hiển thị "© copyright by 22120159"
- Responsive design với Tailwind CSS

---

## Yêu Cầu Gốc (10/10 điểm)

### Backend (4 điểm) ✅
- ✅ API Endpoint /register (2đ)
- ✅ Error Handling (2đ)

### Frontend (5 điểm) ✅
- ✅ Routing Home/Login/SignUp (1đ)
- ✅ Sign Up Page với validation và React Query (2đ)
- ✅ Login Page với validation và UI (2đ)

### Deployment (1 điểm) ✅
- ✅ Hướng dẫn deployment Vercel + Railway (1đ)

### Tính năng mở rộng (Bonus) ✅
- ✅ JWT authentication
- ✅ Login endpoint kết nối backend
- ✅ Tự động login sau đăng ký
- ✅ Profile page để xem/sửa thông tin
- ✅ Tài liệu deployment chi tiết

---

## Deploy Lên Cloud

### MongoDB Atlas (Database)
1. Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Tạo database user và password
4. Whitelist IP: 0.0.0.0/0 (cho phép mọi IP)
5. Lấy connection string

Chi tiết: Xem `DEPLOYMENT.md` Phần 1

### Railway (Backend)
1. Tạo tài khoản https://railway.app
2. Deploy từ GitHub repo
3. Thêm biến môi trường:
   - MONGO_URI (từ Atlas)
   - JWT_SECRET (chuỗi random)
   - PORT=3333
   - NODE_ENV=production
4. Copy URL backend

Chi tiết: Xem `DEPLOYMENT.md` Phần 2

### Vercel (Frontend)
1. Tạo tài khoản https://vercel.com
2. Import GitHub repo
3. Chọn framework: Vite
4. Thêm biến môi trường:
   - VITE_API_BASE (URL Railway)
5. Deploy

Chi tiết: Xem `DEPLOYMENT.md` Phần 3

---

## Cấu Trúc Dự Án

```
IA03-22120159/
├── backend/              # NestJS + Mongoose
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── user/        # Module quản lý user
│   ├── .env             # Config môi trường
│   └── package.json
│
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # Home, Login, SignUp, Profile
│   │   └── api/         # Axios client
│   ├── .env
│   └── package.json
│
├── README.md           # Tài liệu chính
├── DEPLOYMENT.md       # Hướng dẫn deploy
└── COMPLETE.md         # Tóm tắt hoàn thành
```

---

## API Endpoints

### Public (không cần token)
- POST `/user/register` - Đăng ký
- POST `/user/login` - Đăng nhập

### Protected (cần JWT token)
- GET `/user/profile` - Xem thông tin
- PUT `/user/profile` - Cập nhật email

Header yêu cầu: `Authorization: Bearer <token>`

---

## Troubleshooting

### Backend không kết nối MongoDB
- Kiểm tra Docker container đang chạy: `docker ps`
- Kiểm tra MONGO_URI trong `.env`
- Khởi động lại container: `docker restart ia03-mongo`

### Frontend không gọi được Backend (CORS error)
- Kiểm tra VITE_API_BASE trong `frontend/.env`
- Đảm bảo backend đang chạy
- Kiểm tra CORS enabled trong `backend/src/main.ts`

### Lỗi JWT token
- Kiểm tra JWT_SECRET trong `backend/.env`
- Xóa localStorage trong browser (F12 → Application → Local Storage)
- Logout và login lại

---

## Tài Liệu Khác

- `README.md` - Hướng dẫn chi tiết toàn bộ dự án
- `DEPLOYMENT.md` - Hướng dẫn deploy từng bước
- `COMPLETE.md` - Checklist hoàn thành và testing
- `backend/README.md` - Hướng dẫn backend
- `frontend/README.md` - Hướng dẫn frontend

---

## Liên Hệ

**MSSV:** 22120159  
**Dự án:** IA03 - User Registration System  
**Ngày:** Tháng 10, 2025

---

**Chi phí:** $0/tháng (sử dụng free tier)

**Công nghệ:**
- Backend: NestJS + Mongoose + JWT
- Frontend: React + Vite + Tailwind
- Database: MongoDB Atlas
- Hosting: Vercel + Railway

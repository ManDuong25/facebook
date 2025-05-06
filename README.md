# Facebook Clone Project

## English

### Overview

This is a Facebook clone project built with Spring Boot (Backend) and React (Frontend). The application includes features like user authentication, post creation, sharing, and friend management.

### Prerequisites

- Java JDK 17 or higher
- Node.js 16.x or higher
- Maven 3.6.x or higher
- MySQL 8.0 or higher

### Installation

#### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Configure the database:

   - Open `src/main/resources/application.properties`
   - Update the database configuration with your MySQL credentials:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/facebook_clone
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. Build and run the backend:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

#### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Features

- User Authentication (Register/Login)
- Create, Edit, and Delete Posts
- Share Posts
- Friend Management
- Real-time Chat
- Profile Management
- Post Interactions (Like, Comment, Share)

### Important Notes

- Make sure both backend and frontend servers are running simultaneously
- Backend runs on port 8080 by default
- Frontend runs on port 5173 by default
- Keep your database credentials secure
- The application requires an active internet connection for image uploads

## Tiếng Việt

### Tổng quan

Đây là dự án clone Facebook được xây dựng bằng Spring Boot (Backend) và React (Frontend). Ứng dụng bao gồm các tính năng như xác thực người dùng, tạo bài viết, chia sẻ và quản lý bạn bè.

### Yêu cầu hệ thống

- Java JDK 17 trở lên
- Node.js 16.x trở lên
- Maven 3.6.x trở lên
- MySQL 8.0 trở lên

### Cài đặt

#### Cài đặt Backend

1. Di chuyển vào thư mục backend:

   ```bash
   cd backend
   ```

2. Cấu hình cơ sở dữ liệu:

   - Mở file `src/main/resources/application.properties`
   - Cập nhật thông tin cấu hình database với thông tin MySQL của bạn:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/facebook_clone
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. Build và chạy backend:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

#### Cài đặt Frontend

1. Di chuyển vào thư mục frontend:

   ```bash
   cd frontend
   ```

2. Cài đặt các dependencies:

   ```bash
   npm install
   ```

3. Khởi động server phát triển:
   ```bash
   npm run dev
   ```

### Tính năng

- Xác thực người dùng (Đăng ký/Đăng nhập)
- Tạo, Chỉnh sửa và Xóa bài viết
- Chia sẻ bài viết
- Quản lý bạn bè
- Nhắn tin thời gian thực
- Quản lý hồ sơ
- Tương tác với bài viết (Thích, Bình luận, Chia sẻ)

### Lưu ý quan trọng

- Đảm bảo cả server backend và frontend đều đang chạy đồng thời
- Backend chạy trên cổng 8080 mặc định
- Frontend chạy trên cổng 5173 mặc định
- Giữ thông tin đăng nhập database an toàn
- Ứng dụng yêu cầu kết nối internet để tải lên hình ảnh

### Hỗ trợ

Nếu bạn gặp bất kỳ vấn đề nào trong quá trình cài đặt hoặc sử dụng, vui lòng tạo issue trong repository của dự án.
Hoặc liên hệ với tôi: manduongdev@gmail.com

### Contributors

- Duong Cong Man
- Trinh Van Manh
- Hoang Dinh Hoan
- Le The Minh

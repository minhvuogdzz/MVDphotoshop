# Tính năng Banners Quảng Cáo & Mobile Popup

Hệ thống sẽ thêm tính năng hiển thị poster quảng cáo động ở 2 bên lề màn hình (dành cho Desktop/Tablet lớn) và Popup thông báo (dành cho Mobile), có thể quản lý hoàn toàn qua trang Admin.

## User Review Required
> [!IMPORTANT]
> **Câu hỏi cần xác nhận:**
> 1. Ảnh tải lên sẽ dùng chung cho cả lề trái, lề phải và Mobile Popup đúng không? Hay bạn muốn tách riêng ảnh cho Desktop và ảnh cho Mobile? (Tạm thời tôi sẽ thiết kế dùng chung 1 danh sách ảnh, lề trái hiển thị một nửa, lề phải hiển thị nửa còn lại, Mobile sẽ lấy ảnh đầu tiên làm Popup).
> 2. Lề quảng cáo trên Desktop có cần nút "Tắt/Ẩn quảng cáo" không, hay lúc nào có ảnh thì nó sẽ luôn tự động chạy?

## Proposed Changes

---

### Backend (Server)

#### [NEW] `server/models/Promo.js`
- Tạo Schema mới lưu trữ cấu hình quảng cáo:
  - `images`: Mảng chứa các đường dẫn ảnh (tỉ lệ 4:6).
  - `mobileEnabled`: Boolean (Bật/tắt popup trên mobile).
  - `desktopEnabled`: Boolean (Bật/tắt banner 2 bên lề).

#### [MODIFY] `server/server.js`
- Cập nhật API `/api/upload` và `/api/upload-multiple`:
  - Thêm logic kiểm tra định dạng: Nếu `req.file.mimetype === 'image/gif'`, bỏ qua thư viện nén `sharp` và đưa thẳng lên Cloudinary để giữ nguyên hiệu ứng ảnh động.
  - Các định dạng khác (JPG, PNG) vẫn nén thành WebP chất lượng 80% (< 500kb).
- Thêm các endpoint CRUD cho `Promo`:
  - `GET /api/promo`
  - `POST /api/promo` (Yêu cầu xác thực Admin)

---

### Frontend Admin (Quản trị viên)

#### [MODIFY] `client/src/pages/Admin.jsx`
- Thêm Tab mới: **"Quảng cáo / Khuyến mại"**.
- Trong Tab này:
  - Nút tải lên nhiều ảnh (hỗ trợ GIF, JPG, PNG).
  - Giao diện kéo thả sắp xếp ảnh hoặc xóa ảnh.
  - Công tắc (Toggle) "Bật/tắt Popup trên Mobile".
  - Công tắc (Toggle) "Bật/tắt Banners trên Desktop".

---

### Frontend Client (Giao diện người dùng)

#### [NEW] `client/src/components/Promo/SideBanners.jsx`
- Hiển thị 2 cột (position fixed) ở 2 bên lề trái và phải của trang web.
- Chỉ hiển thị trên màn hình lớn (`lg`, `xl`) và khi `desktopEnabled` là true.
- Cột trái: Slide ảnh cuộn tự động siêu chậm từ dưới lên trên (animation CSS).
- Cột phải: Slide ảnh cuộn tự động siêu chậm từ trên xuống dưới (animation CSS).
- Căn chỉnh z-index nằm dưới Header và trên Background.

#### [NEW] `client/src/components/Promo/MobilePopup.jsx`
- Hiển thị dạng Popup Overlay che chính giữa màn hình.
- Chỉ hiển thị trên màn hình nhỏ (`xs`, `md`) và khi `mobileEnabled` là true.
- Có nút [X] ở góc để tắt.
- Sử dụng `sessionStorage` để ghi nhớ: Nếu người dùng đã bấm tắt, thì trong suốt phiên truy cập đó sẽ không hiện lại nữa để tránh làm phiền.

#### [MODIFY] `client/src/App.jsx`
- Tích hợp `<SideBanners />` và `<MobilePopup />` vào Layout chính.
- Kết nối với API `/api/promo` qua Context hoặc lấy dữ liệu trực tiếp khi App tải xong.

## Verification Plan

### Automated Tests
- Kiểm tra tính hợp lệ của API tải ảnh: Upload file GIF đảm bảo không bị đứng hình, upload file PNG/JPG nặng đảm bảo file trả về là WebP nhẹ < 500kb.

### Manual Verification
- Truy cập trang Admin, cấu hình ảnh và bật/tắt công tắc Mobile.
- Mở trang bằng Desktop: Lề 2 bên chạy slide cuộn mượt mà (chỉ hiển thị phần body, không đè lên Hero và Footer).
- Mở trang bằng Điện thoại: Popup hiện ra ngay khi vào trang, sau khi tắt đi chuyển trang khác không bị hiện lại.

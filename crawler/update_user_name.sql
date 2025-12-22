-- Update tên user "Người dùng nhập khẩu" thành tên có thật
-- Email: nhap.khau@import.local

-- Cập nhật fullName thành tên có thật (ví dụ: Nguyễn Văn Hồng, Trần Xuân Anh, etc.)
UPDATE users 
SET fullName = 'Nguyễn Văn Hồng', 
    updatedAt = NOW()
WHERE email = 'nhap.khau@import.local';

-- Kiểm tra kết quả
SELECT id, email, fullName, role, createdAt, updatedAt 
FROM users 
WHERE email = 'nhap.khau@import.local';


-- Lệnh xóa tất cả data trong bảng chat_sex_girls

-- Cách 1: DELETE (có thể rollback)
DELETE FROM `chat_sex_girls`;

-- Cách 2: TRUNCATE (nhanh hơn, không thể rollback, reset AUTO_INCREMENT)
-- TRUNCATE TABLE `chat_sex_girls`;

-- Sau khi xóa, reset AUTO_INCREMENT nếu cần
-- ALTER TABLE `chat_sex_girls` AUTO_INCREMENT = 1;


# Hướng Dẫn Export Data từ MySQL Workbench

## Cách 1: Export toàn bộ Database (SQL Dump)

### Bước 1: Mở MySQL Workbench và kết nối
- Mở MySQL Workbench
- Kết nối đến database server của bạn (localhost hoặc remote server)
- Database name: `girlpick` (theo file env.local.example)

### Bước 2: Export Database
1. Click vào menu **Server** → **Data Export**
2. Hoặc click vào biểu tượng **Data Export** ở sidebar bên trái

### Bước 3: Chọn Database và Tables
1. **Trong phần "Tables to Export"** (bên trái):
   - Tìm và **tick vào checkbox** của database bạn muốn export
   - Database có thể là: `girl_pick_db` hoặc `girlpick` (tùy theo tên database của bạn)
   - Sau khi tick, bên phải sẽ hiện danh sách tables trong database đó

2. **Chọn Tables** (bên phải - "Exp... Schema Objects"):
   - Có thể click **"Select Tables"** để chọn tất cả tables
   - Hoặc tick từng table cụ thể bạn muốn export
   - Nếu muốn bỏ chọn: click **"Unselect All"**

### Bước 4: Cấu hình Export Options

**⚠️ QUAN TRỌNG - Chọn đúng như sau:**

1. **Export Type** (chọn 1 trong 2):
   - ✅ **"Export to Self-Contained File"** ← **CHỌN CÁI NÀY** (đã được tick sẵn)
     - Tất cả sẽ export vào 1 file `.sql` duy nhất
     - Dễ import lại, đảm bảo tính nhất quán
     - File path: `C:\Users\LENOVO\Documents\dumps\Dump20251208.sql`
   - ❌ "Export to Dump Project Folder" - KHÔNG chọn (trừ khi cần export từng table riêng)

2. **Các Options quan trọng** (tick vào):
   - ✅ **"Create Dump in a Single Transaction"** ← **NÊN TICK**
     - Đảm bảo tính nhất quán, nếu lỗi sẽ rollback toàn bộ
   - ✅ **"Include Create Schema"** ← **NÊN TICK**
     - Sẽ tạo database nếu chưa có khi import

3. **Objects to Export** (nếu có):
   - ✅ Dump Stored Procedures and Functions (nếu có)
   - ✅ Dump Events (nếu có)
   - ✅ Dump Triggers (nếu có)

### Bước 5: Bắt đầu Export
- Click nút **"Start Export"** (góc dưới bên phải)
- Chờ quá trình export hoàn tất
- Kiểm tra tab **"Export Progress"** để xem tiến trình
- File sẽ được lưu tại đường dẫn đã hiển thị (ví dụ: `C:\Users\LENOVO\Documents\dumps\Dump20251208.sql`)

### 📁 File Data được lưu ở đâu?

**Sau khi export xong, file data sẽ ở:**

1. **Vị trí mặc định** (theo screenshot của bạn):
   ```
   C:\Users\LENOVO\Documents\dumps\Dump20251208.sql
   ```
   - Thư mục: `C:\Users\LENOVO\Documents\dumps\`
   - Tên file: `Dump20251208.sql` (ngày tháng tự động thêm vào)

2. **Cách tìm file:**
   - Mở **File Explorer** (Windows Explorer)
   - Điều hướng đến: `C:\Users\LENOVO\Documents\dumps\`
   - Hoặc copy đường dẫn từ MySQL Workbench và paste vào thanh địa chỉ File Explorer

3. **Thay đổi vị trí lưu file:**
   - Trong MySQL Workbench, click vào đường dẫn hiển thị
   - Chọn thư mục khác nếu muốn
   - Hoặc click nút **"..."** bên cạnh đường dẫn để chọn folder mới

4. **Kiểm tra file đã export:**
   - File có định dạng `.sql`
   - Kích thước file phụ thuộc vào số lượng data (có thể từ vài MB đến vài GB)
   - Có thể mở bằng Notepad/VS Code để xem nội dung (nhưng file có thể rất lớn)

5. **Lưu ý:**
   - File `.sql` này chứa **TOÀN BỘ** database của bạn:
     - Cấu trúc bảng (CREATE TABLE)
     - Dữ liệu (INSERT INTO)
     - Indexes, constraints, foreign keys
   - File này có thể dùng để **import lại** hoặc **restore** database

---

## Cách 2: Export Data dạng CSV/Excel (Chỉ dữ liệu, không có cấu trúc)

### Bước 1: Chọn Table
- Trong MySQL Workbench, mở database `girlpick`
- Click vào table bạn muốn export

### Bước 2: Export dữ liệu
1. Click chuột phải vào table → **Table Data Export Wizard**
2. Hoặc chọn table → menu **Table** → **Table Data Export Wizard**

### Bước 3: Chọn cột và định dạng
- Chọn các cột muốn export
- Chọn định dạng:
  - **CSV**: Dùng cho Excel, Google Sheets
  - **JSON**: Dùng cho API, ứng dụng
  - **Excel**: File .xlsx trực tiếp

### Bước 4: Chọn vị trí lưu và Export
- Chọn đường dẫn lưu file
- Click **Next** → **Next** → **Finish**

---

## Cách 3: Export bằng SQL Query (Linh hoạt nhất)

### Bước 1: Mở Query Tab
- Click vào biểu tượng **SQL** hoặc nhấn `Ctrl + Enter`
- Tạo tab query mới

### Bước 2: Viết Query SELECT
```sql
-- Export toàn bộ dữ liệu từ một table
SELECT * FROM your_table_name;

-- Export với điều kiện
SELECT * FROM your_table_name 
WHERE created_at >= '2024-01-01';

-- Export nhiều tables
SELECT * FROM table1;
SELECT * FROM table2;
```

### Bước 3: Export kết quả
1. Chạy query (nhấn `Ctrl + Shift + Enter` hoặc click Execute)
2. Click chuột phải vào kết quả → **Export Recordset to an External File**
3. Chọn định dạng: CSV, JSON, Excel, XML
4. Chọn đường dẫn và lưu

---

## Cách 4: Export bằng Command Line (mysqldump)

Nếu bạn muốn export từ terminal/command line:

```bash
# Export toàn bộ database
mysqldump -u girlpick -p girlpick > backup.sql

# Export chỉ cấu trúc (không có data)
mysqldump -u girlpick -p --no-data girlpick > schema.sql

# Export chỉ data (không có cấu trúc)
mysqldump -u girlpick -p --no-create-info girlpick > data.sql

# Export một table cụ thể
mysqldump -u girlpick -p girlpick table_name > table_backup.sql
```

**Lưu ý**: 
- `-u girlpick`: username (theo env.local.example)
- `girlpick`: tên database
- Sẽ hỏi password: `girlpick123` (theo env.local.example)

---

## Khuyến nghị

### Cho Backup toàn bộ:
- Dùng **Cách 1** (Data Export) → Export to Self-Contained File
- File `.sql` có thể import lại dễ dàng

### Cho Phân tích dữ liệu:
- Dùng **Cách 2** (Table Data Export) → Export CSV/Excel
- Mở bằng Excel, Google Sheets để phân tích

### Cho Export có điều kiện:
- Dùng **Cách 3** (SQL Query) → Linh hoạt nhất

### Cho Automation:
- Dùng **Cách 4** (mysqldump) → Có thể script tự động

---

## Import lại Data

### Từ MySQL Workbench:
1. **Server** → **Data Import**
2. Chọn file `.sql` đã export
3. Chọn database đích
4. Click **Start Import**

### Từ Command Line:
```bash
mysql -u girlpick -p girlpick < backup.sql
```

---

## Lưu ý quan trọng

⚠️ **Trước khi export:**
- Đảm bảo database đang chạy
- Kiểm tra kết nối thành công
- Xác nhận quyền truy cập database

⚠️ **Khi export:**
- File SQL có thể rất lớn nếu có nhiều dữ liệu
- Export có thể mất thời gian với database lớn
- Đảm bảo có đủ dung lượng ổ cứng

⚠️ **Sau khi export:**
- Kiểm tra file đã được tạo thành công
- Test import lại để đảm bảo file không bị lỗi
- Lưu backup ở nhiều nơi an toàn

---

## ✅ Kiểm tra Export/Import có đúng số Record không?

**CÓ! Export rồi Import lại sẽ giữ nguyên 100% số record và dữ liệu.**

### Cách kiểm tra số record trước khi Export:

Chạy query này trong MySQL Workbench để đếm số record của từng table:

```sql
-- Đếm số record của tất cả tables trong database
USE girl_pick_db;  -- hoặc tên database của bạn

SELECT 
    TABLE_NAME as 'Table Name',
    TABLE_ROWS as 'Number of Records'
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'girl_pick_db'  -- thay bằng tên database của bạn
ORDER BY 
    TABLE_NAME;
```

Hoặc đếm từng table cụ thể:
```sql
-- Đếm record của từng table
SELECT COUNT(*) as total_records FROM users;
SELECT COUNT(*) as total_records FROM posts;
SELECT COUNT(*) as total_records FROM girls;
-- ... các table khác
```

### Cách kiểm tra sau khi Import:

1. **Import lại vào database mới** (hoặc database test)
2. **Chạy lại query đếm record** như trên
3. **So sánh số record** - phải giống hệt nhau

### Script kiểm tra tự động:

```sql
-- So sánh số record giữa 2 database (nếu import vào database khác)
-- Database gốc
SELECT 
    'Source DB' as DB,
    TABLE_NAME,
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'girl_pick_db'

UNION ALL

-- Database sau khi import
SELECT 
    'Imported DB' as DB,
    TABLE_NAME,
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'girl_pick_db_imported'
ORDER BY TABLE_NAME, DB;
```

### ✅ Kết luận:

- **Export bằng "Export to Self-Contained File"** → Import lại sẽ **GIỮ NGUYÊN 100%**:
  - ✅ Số record
  - ✅ Dữ liệu trong từng record
  - ✅ Cấu trúc bảng
  - ✅ Indexes, constraints
  - ✅ Foreign keys
  - ✅ Auto-increment values (nếu có)

**Lưu ý**: Chỉ cần đảm bảo khi export có tick **"Include Data"** (mặc định đã có) và chọn **"Export to Self-Contained File"**.


# Checklist public lên GitHub

Dùng checklist này trước khi tạo repository public.

## Nội dung cần có

- `README.md` ở thư mục gốc mô tả toàn bộ chuỗi lab.
- `README.md` riêng cho từng lab trong `labs/`.
- Đề bài gốc được đặt tên thống nhất là `assignment.pdf`.
- Báo cáo được đặt tên thống nhất là `report.pdf` hoặc `report.docx`.
- `.gitignore` loại bỏ file tạm, thư mục render, dữ liệu lớn và model weights.

## Kiểm tra quyền riêng tư

- Mở lại báo cáo và kiểm tra tên, mã số sinh viên, lớp, email hoặc thông tin cá nhân.
- Không public API key, token, Firebase private key hoặc credential.
- Nếu public `nong-nghiep-dashboard/`, kiểm tra Firebase Realtime Database Rules để tránh quyền ghi/đọc mở ngoài ý muốn.
- Nếu dataset có bản quyền hoặc cần đăng nhập Kaggle, chỉ public hướng dẫn tải thay vì đẩy toàn bộ dữ liệu.
- Không đẩy model weights quá lớn nếu không cần thiết.

## Kiểm tra dung lượng

- GitHub giới hạn cảnh báo file lớn từ 50 MB và chặn file trên 100 MB.
- Nên dùng Git LFS nếu cần lưu model weight, video hoặc dataset lớn.
- Với repo này, chỉ nên public `README.md`, `docs/`, `labs/` và project phụ nếu cần.

## Lệnh Git gợi ý

```powershell
git init
git add README.md .gitignore docs labs nong-nghiep-dashboard
git commit -m "Prepare AI lab portfolio for GitHub"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

Nếu muốn chỉ public chuỗi lab AI, bỏ `nong-nghiep-dashboard` khỏi lệnh `git add`.

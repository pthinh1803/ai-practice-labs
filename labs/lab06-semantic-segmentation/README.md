# Lab 06 - Semantic Segmentation

## Tóm tắt

Lab này xây dựng pipeline **semantic segmentation** bằng U-Net. Mục tiêu là gán nhãn từng pixel trong ảnh để tách vùng đối tượng khỏi nền, thay vì chỉ phân loại toàn ảnh hoặc vẽ bounding box.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.pdf](report.pdf) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu bài toán semantic segmentation.
- Chuẩn bị ảnh và segmentation mask.
- Xây dựng U-Net bằng PyTorch.
- Huấn luyện với BCEWithLogitsLoss và Dice Loss.
- Đánh giá bằng IoU và Dice Score.
- Trực quan hóa predicted mask và phân tích mẫu lỗi.

## Dữ liệu

- Dataset: Oxford-IIIT Pet Dataset.
- Dữ liệu gồm ảnh RGB và trimap mask tương ứng.
- Tổng dữ liệu trong báo cáo: 7,390 ảnh và 7,390 mask.
- Chia train/validation theo tỉ lệ 80/20, tương ứng khoảng 5,912 ảnh train và 1,478 ảnh validation.
- Ảnh được resize về 256x256 trong pipeline huấn luyện.

## Mô hình và kỹ thuật

- U-Net tự xây dựng từ đầu.
- Encoder-decoder với skip connections.
- BCEWithLogitsLoss cho segmentation nhị phân.
- Dice Loss để tối ưu overlap.
- Metric: Intersection over Union và Dice Score.

## Quy trình thực hiện

1. Kiểm tra cấu trúc thư mục ảnh và mask.
2. Chuyển trimap thành mask nhị phân phù hợp với bài toán.
3. Resize ảnh/mask và chuẩn hóa tensor.
4. Xây dựng `PetSegmentationDataset` và `DataLoader`.
5. Xây dựng U-Net với encoder, bottleneck, decoder và skip connections.
6. Huấn luyện mô hình với BCE loss.
7. Thử nghiệm Dice Loss, learning rate và batch size.
8. Trực quan hóa ảnh gốc, ground truth mask và predicted mask.
9. Phân tích các mẫu có IoU thấp.

## Kết quả chính

- U-Net với BCEWithLogitsLoss đạt validation IoU tốt nhất khoảng **0.8484**.
- Validation Dice đạt khoảng **0.9120**.
- Dice Loss trong thử nghiệm nhanh đạt best validation IoU khoảng **0.7913**.
- Learning rate 0.001 và batch size 4 cho kết quả ổn định trong báo cáo.

## Nhận xét

U-Net giữ tốt thông tin không gian nhờ skip connections nên phù hợp với segmentation. BCEWithLogitsLoss ổn định hơn trong thử nghiệm chính, còn Dice Loss có tiềm năng nhưng cần huấn luyện lâu hơn và tuning kỹ hơn. Việc gộp vùng boundary của trimap vào foreground có thể làm khó mô hình tại biên đối tượng.

## Hướng cải thiện

- Dùng loss kết hợp BCE + Dice.
- Tối ưu threshold trên validation set thay vì dùng cố định 0.5.
- Thêm augmentation như flip, color jitter và random crop.
- Thử encoder pretrained ResNet hoặc EfficientNet.
- So sánh với U-Net++ hoặc DeepLabV3.

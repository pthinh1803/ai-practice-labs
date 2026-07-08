# Lab 04 - CNNs for Image Classification

## Tóm tắt

Lab này xây dựng mô hình **Convolutional Neural Network** để phân loại ảnh CIFAR-10. Khác với MLP, CNN khai thác cấu trúc không gian của ảnh thông qua convolution, pooling và các tầng fully connected.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.pdf](report.pdf) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu nguyên lý hoạt động của CNN.
- Xây dựng mô hình CNN bằng PyTorch.
- Huấn luyện mô hình cho bài toán phân loại ảnh.
- Phân tích vai trò của convolution, pooling, dropout và data augmentation.
- Cải thiện accuracy so với mô hình CNN cơ bản.

## Dữ liệu

- Dataset: CIFAR-10.
- Số ảnh: 60,000 ảnh màu RGB.
- Kích thước ảnh: 32x32.
- Số lớp: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck.

## Mô hình và kỹ thuật

- CNN cơ bản với convolution, ReLU, max pooling và fully connected layers.
- BetterCNN với nhiều filter/layer hơn.
- Dropout để giảm overfitting.
- Data augmentation bằng RandomHorizontalFlip và các biến đổi ảnh.
- So sánh learning rate, batch size và số epoch.

## Quy trình thực hiện

1. Tải CIFAR-10 bằng torchvision.
2. Normalize ảnh RGB và tạo `DataLoader`.
3. Xây dựng CNN cơ bản.
4. Huấn luyện và theo dõi loss/accuracy.
5. Thử nghiệm số filter, số lớp convolution và dropout.
6. Áp dụng data augmentation.
7. Xây dựng BetterCNN và huấn luyện với cấu hình tốt hơn.
8. Đánh giá bằng test accuracy và confusion matrix.

## Kết quả chính

- CNN cơ bản đạt accuracy khoảng **72.49%**.
- Bổ sung Dropout(0.5) tăng accuracy lên khoảng **74.71%**.
- Data augmentation giúp accuracy tăng lên khoảng **75.67%**.
- BetterCNN đạt test accuracy khoảng **81.84%**, vượt mục tiêu 75%.
- Batch size 128 và learning rate 0.001 cho kết quả ổn định trong báo cáo.

## Nhận xét

CNN cải thiện rõ rệt so với cách flatten ảnh vì giữ được thông tin không gian. Augmentation là yếu tố quan trọng giúp mô hình học đặc trưng tổng quát hơn. CIFAR-10 vẫn khó hơn MNIST vì ảnh màu, kích thước nhỏ và nhiều lớp có hình dạng gần nhau như cat/dog hoặc deer/horse.

## Hướng cải thiện

- Dùng transfer learning với ResNet, VGG hoặc EfficientNet pretrained trên ImageNet.
- Tăng số epoch kèm early stopping.
- Áp dụng learning-rate scheduler.
- Tối ưu augmentation và regularization.

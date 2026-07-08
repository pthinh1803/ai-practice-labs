# Lab 03 - Deep Learning: Multilayer Perceptron

## Tóm tắt

Lab này xây dựng mô hình **Multilayer Perceptron** bằng PyTorch để nhận dạng chữ số viết tay trên MNIST. Ảnh 28x28 được làm phẳng thành vector 784 chiều và phân loại vào 10 lớp chữ số từ 0 đến 9.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.pdf](report.pdf) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu kiến trúc mạng neural network nhiều lớp.
- Xây dựng MLP bằng PyTorch.
- Huấn luyện mô hình bằng forward propagation và backpropagation.
- Đánh giá mô hình classification trên tập test.
- Thử nghiệm activation function, batch size, learning rate, dropout và số epoch.

## Dữ liệu

- Dataset: MNIST Handwritten Digits.
- Số ảnh: 70,000 ảnh grayscale.
- Kích thước ảnh: 28x28 pixels.
- Số lớp: 10 chữ số từ 0 đến 9.

## Mô hình và kỹ thuật

- MLP với đầu vào 784 features.
- Kiến trúc cải tiến: `784 -> 512 -> 256 -> 128 -> 10`.
- Activation: ReLU, LeakyReLU, Tanh.
- Loss: Cross Entropy Loss.
- Optimizer: Adam hoặc SGD tùy thử nghiệm.
- Dropout để giảm overfitting.

## Quy trình thực hiện

1. Import PyTorch, torchvision và các thư viện trực quan hóa.
2. Tải MNIST và tạo `DataLoader` cho train/test.
3. Chuẩn hóa dữ liệu và flatten ảnh thành vector.
4. Xây dựng mô hình MLP cơ bản.
5. Huấn luyện theo nhiều cấu hình epoch, batch size và learning rate.
6. Đánh giá accuracy trên tập test.
7. Vẽ loss/accuracy theo epoch và confusion matrix.
8. So sánh mô hình cơ bản với mô hình cải tiến.

## Kết quả chính

- Mô hình cải tiến đạt test accuracy khoảng **98.48%** sau 20 epoch.
- Kết quả vượt mục tiêu accuracy trên 97%.
- Learning rate **0.001** cho quá trình hội tụ ổn định.
- ReLU và LeakyReLU hoạt động tốt hơn Tanh trong thử nghiệm.
- Dropout giúp mô hình tổng quát hơn dù accuracy có thể giảm nhẹ.

## Nhận xét

MLP có thể đạt hiệu quả cao trên MNIST vì dữ liệu tương đối đơn giản và ảnh đã được căn chỉnh tốt. Khi tăng số epoch, accuracy cải thiện nhưng tốc độ tăng giảm dần sau khoảng epoch 10. Confusion matrix giúp phát hiện các cặp chữ số dễ nhầm hơn so với chỉ nhìn accuracy tổng.

## Hướng cải thiện

- Thêm batch normalization để ổn định huấn luyện.
- So sánh với CNN để thấy lợi thế của đặc trưng không gian.
- Dùng scheduler cho learning rate.
- Lưu checkpoint tốt nhất theo validation accuracy.

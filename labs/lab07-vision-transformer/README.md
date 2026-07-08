# Lab 07 - Vision Transformer

## Tóm tắt

Lab này fine-tune **Vision Transformer** cho bài toán phân loại ảnh. ViT chia ảnh thành các patch, biến patch thành token embedding rồi xử lý bằng Transformer Encoder, tương tự cách Transformer xử lý chuỗi trong NLP.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.pdf](report.pdf) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu nguyên lý Vision Transformer và patch embedding.
- So sánh cách học đặc trưng của CNN và Transformer trong thị giác máy tính.
- Fine-tune ViT pretrained cho CIFAR-10.
- Thử nghiệm CIFAR-100, learning rate, batch size và patch size.
- Phân tích ảnh dự đoán sai và giới hạn của so sánh mô hình.

## Dữ liệu

- Dataset chính: CIFAR-10.
- Dataset mở rộng: CIFAR-100.
- CIFAR-10 gồm 50,000 ảnh train và 10,000 ảnh test, ảnh RGB 32x32 thuộc 10 lớp.
- Ảnh được resize lên 224x224 để phù hợp đầu vào ViT pretrained.
- Trọng số ViT-B/16 được dùng từ nguồn cục bộ trên Kaggle.

## Mô hình và kỹ thuật

- Vision Transformer ViT-B/16.
- Patch embedding, positional embedding và CLS token.
- Transformer Encoder và classification head.
- Transfer learning và fine-tuning.
- AdamW optimizer.
- So sánh với SimpleCNN train từ đầu.

## Quy trình thực hiện

1. Kiểm tra đường dẫn CIFAR-10, CIFAR-100 và pretrained weights.
2. Tạo transform resize, normalize và augmentation.
3. Tải dữ liệu bằng torchvision.
4. Thay classification head theo số lớp.
5. Fine-tune ViT-B/16 trên CIFAR-10.
6. Đánh giá accuracy và lưu checkpoint tốt nhất.
7. Thử learning rate, batch size và số epoch.
8. So sánh với CNN train từ đầu.
9. Thử CIFAR-100 và ViT-B/32.
10. Phân tích ảnh sai và đề xuất cải thiện.

## Kết quả chính

- ViT-B/16 pretrained trên CIFAR-10 đạt best accuracy khoảng **95.32%** trong 5 epoch.
- Cấu hình learning rate 1e-4 đạt kết quả tốt nhất trong thử nghiệm.
- CIFAR-100 đạt accuracy khoảng **84.01%**.
- SimpleCNN train từ đầu chỉ đạt khoảng **40.14%** trong điều kiện so sánh ngắn.
- ViT-B/32 đạt khoảng **56.38%** do thiếu pretrained weight phù hợp, nên không thể kết luận patch size 32 luôn kém hơn.

## Nhận xét

Kết quả cao của ViT-B/16 đến từ pretrained weights và fine-tuning hiệu quả. So sánh ViT với CNN cần thận trọng vì CNN trong báo cáo được train từ đầu, còn ViT dùng biểu diễn pretrained. Để so sánh công bằng hơn, nên dùng CNN pretrained như ResNet-18 hoặc ResNet-50.

## Hướng cải thiện

- Dùng validation set riêng và early stopping theo validation loss.
- So sánh với ResNet pretrained.
- Thêm learning-rate scheduler.
- Lập confusion matrix và accuracy theo từng lớp.
- Dùng pretrained weight cho ViT-B/32 để cô lập ảnh hưởng patch size.

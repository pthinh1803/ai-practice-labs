# Lab 05 - Object Detection with YOLOv11

## Tóm tắt

Lab này triển khai **YOLOv11** cho bài toán phát hiện đối tượng giao thông trên Self-Driving Cars Dataset. Mô hình cần dự đoán đồng thời lớp đối tượng và vị trí bounding box trong ảnh hoặc video.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.docx](report.docx) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu bài toán object detection và định dạng bounding box.
- Chuyển đổi nhãn từ CSV sang YOLO annotation format.
- Huấn luyện YOLOv11 bằng Ultralytics trên Kaggle GPU.
- Đánh giá mô hình bằng precision, recall, mAP50 và mAP50-95.
- Phân tích lỗi phát hiện đối tượng nhỏ, che khuất hoặc thiếu sáng.

## Dữ liệu

- Dataset: Self-Driving Cars Dataset trên Kaggle.
- Bối cảnh: ảnh giao thông thực tế từ camera xe tự hành.
- Lớp đối tượng sau chuẩn hóa: `Vehicle`, `Person`, `Traffic_Light`.
- Dữ liệu được tổ chức lại theo cấu trúc YOLO gồm `images/train`, `images/val`, `labels/train`, `labels/val` và `data.yaml`.

## Mô hình và kỹ thuật

- Ultralytics YOLOv11.
- Các biến thể được thử nghiệm: YOLO11n, YOLO11s, YOLO11m.
- Pretrained weights để tận dụng đặc trưng đã học từ dữ liệu lớn.
- Data augmentation: flipping, scaling, HSV augmentation, mosaic augmentation.
- Dự đoán trên ảnh và video.

## Quy trình thực hiện

1. Cài đặt Ultralytics và kiểm tra GPU trên Kaggle.
2. Khảo sát dataset, số lượng ảnh, nhãn và phân bố lớp.
3. Trực quan hóa ảnh cùng bounding box gốc.
4. Chuyển đổi tọa độ `xmin`, `ymin`, `xmax`, `ymax` sang YOLO format.
5. Tạo cấu trúc thư mục YOLO và file `data.yaml`.
6. Huấn luyện YOLO11n, YOLO11s và YOLO11m với nhiều cấu hình.
7. So sánh số epoch, image size, kiến trúc model và augmentation.
8. Đánh giá mAP, phân tích lỗi và chạy prediction trên video.

## Kết quả chính

- Mini Challenge dùng YOLO11m, image size 800x800 và Data Augmentation.
- Precision đạt **0.7035**.
- Recall đạt **0.5874**.
- mAP50 đạt **0.6220**.
- mAP50-95 đạt **0.3430**.
- Target mAP50 là 0.65 nên mô hình chưa đạt mục tiêu, nhưng cải thiện rõ so với các thử nghiệm ban đầu.
- Lớp Vehicle đạt mAP50 khoảng **0.762**, cao hơn Person và Traffic_Light.

## Nhận xét

YOLOv11 phù hợp với object detection thời gian thực, nhưng hiệu quả phụ thuộc mạnh vào chất lượng nhãn, cân bằng lớp và kích thước đối tượng. Các đối tượng nhỏ, ở xa camera, bị che khuất hoặc xuất hiện trong điều kiện ánh sáng phức tạp là nguồn lỗi chính. Mô hình lớn hơn như YOLO11m học đặc trưng tốt hơn nhưng tốn tài nguyên GPU hơn.

## Hướng cải thiện

- Tăng số epoch và dùng early stopping theo validation mAP.
- Cân bằng dữ liệu cho Person và Traffic_Light.
- Tối ưu augmentation cho đối tượng nhỏ.
- Thử image size lớn hơn hoặc crop chiến lược.
- Đánh giá tốc độ inference nếu hướng tới ứng dụng real-time.

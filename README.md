# AI Practice Labs

Kho lưu trữ này tổng hợp 8 bài thực hành của học phần **Thực hành Học máy và Trí tuệ nhân tạo**. Mỗi lab được trình bày lại theo cấu trúc phù hợp để public lên GitHub: có mục tiêu, dữ liệu, cơ sở lý thuyết, quy trình thực hiện, kết quả thực nghiệm và hướng cải thiện.

## Danh sách lab

| Lab | Chủ đề | Dataset | Kỹ thuật chính | Thư mục |
| --- | --- | --- | --- | --- |
| 01 | Machine Learning for Classification | Titanic | EDA, preprocessing, Logistic Regression, KNN, SVM, Decision Tree, Random Forest | [labs/lab01-classification-titanic](labs/lab01-classification-titanic) |
| 02 | Machine Learning for Regression | House Prices | Feature engineering, Linear/Ridge/Lasso, Decision Tree, Random Forest, Gradient Boosting | [labs/lab02-regression-house-prices](labs/lab02-regression-house-prices) |
| 03 | Deep Learning - Multilayer Perceptron | MNIST | PyTorch, MLP, backpropagation, dropout, hyperparameter tuning | [labs/lab03-mlp-mnist](labs/lab03-mlp-mnist) |
| 04 | CNNs for Image Classification | CIFAR-10 | CNN, convolution, pooling, augmentation, BetterCNN | [labs/lab04-cnn-cifar10](labs/lab04-cnn-cifar10) |
| 05 | Object Detection with YOLOv11 | Self-Driving Cars | YOLO annotation, Ultralytics YOLO, mAP, error analysis | [labs/lab05-yolov11-object-detection](labs/lab05-yolov11-object-detection) |
| 06 | Semantic Segmentation | Oxford-IIIT Pet | U-Net, BCE/Dice Loss, IoU, Dice Score | [labs/lab06-semantic-segmentation](labs/lab06-semantic-segmentation) |
| 07 | Vision Transformer | CIFAR-10, CIFAR-100 | ViT-B/16, transfer learning, fine-tuning, patch embedding | [labs/lab07-vision-transformer](labs/lab07-vision-transformer) |
| 08 | Large Language Models for NLP | IMDB | BERT fine-tuning, GPT-2 generation, prompt engineering, chatbot, RAG | [labs/lab08-llm-nlp](labs/lab08-llm-nlp) |

## Cấu trúc thư mục

```text
.
├── README.md
├── docs/
│   └── report-structure.md
├── labs/
│   ├── lab01-classification-titanic/
│   ├── lab02-regression-house-prices/
│   ├── lab03-mlp-mnist/
│   ├── lab04-cnn-cifar10/
│   ├── lab05-yolov11-object-detection/
│   ├── lab06-semantic-segmentation/
│   ├── lab07-vision-transformer/
│   └── lab08-llm-nlp/
```

Mỗi thư mục lab có:

| File | Nội dung |
| --- | --- |
| `README.md` | Tóm tắt chi tiết lab theo cấu trúc GitHub |
| `assignment.pdf` | Đề bài thực hành gốc |
| `report.pdf` hoặc `report.docx` | Báo cáo hoàn chỉnh của lab |

## Công nghệ sử dụng

- Python, NumPy, pandas, Matplotlib, Seaborn
- scikit-learn cho các mô hình Machine Learning truyền thống
- PyTorch và torchvision cho MLP, CNN, U-Net và Vision Transformer
- Ultralytics YOLO cho object detection
- HuggingFace Transformers, Datasets, FAISS và Sentence Transformers cho NLP/LLM
- Kaggle Notebook hoặc Google Colab cho các bài cần GPU

## Hướng dẫn đọc repo

1. Mở bảng danh sách lab ở trên và chọn đúng chủ đề cần xem.
2. Đọc `README.md` trong từng lab để nắm mục tiêu, quy trình và kết quả.
3. Mở `assignment.pdf` nếu muốn xem đề bài gốc.
4. Mở `report.pdf` hoặc `report.docx` nếu cần phần trình bày đầy đủ, hình ảnh, bảng kết quả và phân tích chi tiết.

## Ghi chú public

Các file gốc ở thư mục ngoài cùng được giữ lại để đối chiếu cục bộ, nhưng `.gitignore` đã được cấu hình để ưu tiên public cấu trúc sạch trong `labs/` và `docs/`. Trước khi đẩy lên GitHub, nên kiểm tra lại thông tin cá nhân trong báo cáo nếu muốn ẩn mã số sinh viên hoặc thông tin lớp.

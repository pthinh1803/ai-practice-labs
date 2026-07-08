# Lab 01 - Machine Learning for Classification

## Tóm tắt

Lab này xây dựng pipeline phân loại sống sót trên **Titanic Dataset**. Bài toán nhận các đặc trưng của hành khách như hạng vé, giới tính, tuổi, giá vé và thông tin gia đình để dự đoán biến mục tiêu `Survived`.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.pdf](report.pdf) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu bài toán classification và pipeline Machine Learning cơ bản.
- Thực hiện EDA để kiểm tra kích thước dữ liệu, phân bố biến và dữ liệu thiếu.
- Tiền xử lý dữ liệu, mã hóa biến phân loại và tạo đặc trưng mới.
- Huấn luyện, so sánh và đánh giá nhiều mô hình phân loại.
- Sử dụng cross-validation và feature importance để đánh giá độ ổn định.

## Dữ liệu

- Dataset: Titanic Dataset trên Kaggle.
- Biến mục tiêu: `Survived`.
- Đặc trưng quan trọng: `Pclass`, `Sex`, `Age`, `Fare`, `SibSp`, `Parch`, `Embarked`.
- Tập train có khoảng 891 mẫu, tập test có khoảng 418 mẫu.

## Mô hình và kỹ thuật

- Logistic Regression
- K-Nearest Neighbors
- Support Vector Machine
- Decision Tree
- Random Forest
- GridSearchCV và 5-fold Cross Validation

## Quy trình thực hiện

1. Tải dữ liệu Titanic và kiểm tra cấu trúc bảng.
2. Phân tích dữ liệu thiếu, phân bố biến mục tiêu và tương quan đặc trưng.
3. Xử lý giá trị thiếu cho `Age`, `Embarked`, `Fare`.
4. Mã hóa biến phân loại như `Sex` và `Embarked`.
5. Tạo đặc trưng bổ sung như quy mô gia đình hoặc trạng thái đi một mình.
6. Chia dữ liệu train/validation và huấn luyện các mô hình.
7. So sánh accuracy, confusion matrix và cross-validation score.
8. Phân tích feature importance của mô hình cây.

## Kết quả chính

- Các mô hình đạt accuracy khoảng 76-83% trên tập validation.
- SVM đạt kết quả tốt nhất trong báo cáo với accuracy khoảng **83.24%**.
- Random Forest và KNN đạt khoảng **80.45%**.
- Decision Tree thấp hơn do dễ overfitting nếu không giới hạn độ sâu.
- Random Forest sau GridSearchCV đạt cross-validation score khoảng **0.8274**.

## Nhận xét

Dataset Titanic có kích thước nhỏ nên mô hình quá phức tạp dễ học thuộc dữ liệu. Các mô hình tuyến tính hoặc kernel như Logistic Regression và SVM vẫn cạnh tranh tốt khi dữ liệu đã được xử lý đúng. Cross-validation đáng tin cậy hơn một lần chia train/validation vì đánh giá mô hình trên nhiều tập con khác nhau.

## Hướng cải thiện

- Chuẩn hóa pipeline bằng `ColumnTransformer` và `Pipeline`.
- Tạo thêm đặc trưng từ tên hành khách, danh xưng và nhóm tuổi.
- Thử ensemble nâng cao như Gradient Boosting, XGBoost hoặc LightGBM.
- Đánh giá thêm precision, recall và F1-score nếu quan tâm đến từng lớp.

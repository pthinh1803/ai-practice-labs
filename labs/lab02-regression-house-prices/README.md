# Lab 02 - Machine Learning for Regression

## Tóm tắt

Lab này giải quyết bài toán **dự đoán giá nhà** bằng các mô hình hồi quy. Dữ liệu đầu vào gồm nhiều đặc trưng về diện tích, chất lượng, năm xây dựng, số phòng và vị trí; đầu ra là biến `SalePrice`.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.pdf](report.pdf) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu bài toán regression và các metric đánh giá sai số.
- Thực hiện EDA, xử lý dữ liệu thiếu và feature engineering.
- Huấn luyện nhiều mô hình hồi quy truyền thống.
- Đánh giá bằng MAE, RMSE và R2.
- Cải thiện mô hình bằng cross-validation, hyperparameter tuning và đặc trưng mới.

## Dữ liệu

- Dataset: House Prices - Advanced Regression Techniques trên Kaggle.
- Biến mục tiêu: `SalePrice`.
- Nhóm đặc trưng: diện tích, số tầng, số phòng, garage, năm xây dựng, chất lượng vật liệu và thông tin vị trí.

## Mô hình và kỹ thuật

- Linear Regression
- Ridge Regression
- Lasso Regression
- Decision Tree Regressor
- Random Forest Regressor
- Gradient Boosting Regressor
- GridSearchCV, 5-fold Cross Validation và feature engineering

## Quy trình thực hiện

1. Tải dữ liệu và kiểm tra kích thước, kiểu dữ liệu, giá trị thiếu.
2. Phân tích phân phối `SalePrice` và tương quan với các đặc trưng số.
3. Xử lý dữ liệu thiếu và lựa chọn đặc trưng phù hợp.
4. Chia dữ liệu train/validation.
5. Huấn luyện nhiều mô hình hồi quy và so sánh metric.
6. Tuning Random Forest bằng GridSearchCV.
7. Tạo đặc trưng tổng hợp như diện tích sử dụng và diện tích hiên.
8. Đánh giá kết quả cuối cùng bằng R2, MAE và RMSE.

## Kết quả chính

- Random Forest Regressor đạt R2 khoảng **0.8872**, MAE khoảng **18,984 USD** và RMSE khoảng **29,410 USD**.
- Gradient Boosting cải thiện RMSE xuống khoảng **29,049 USD** và R2 khoảng **0.889**.
- Cross-validation 5-fold cho điểm trung bình khoảng **0.834**, phản ánh khả năng tổng quát thận trọng hơn so với một lần chia validation.
- Feature engineering cải thiện nhẹ nhưng rõ hơn hyperparameter tuning trong một số thử nghiệm.

## Nhận xét

Các mô hình cây và ensemble xử lý quan hệ phi tuyến tốt hơn Linear Regression cơ bản. Tuy nhiên, tuning tham số không luôn làm metric tốt hơn nếu không gian tìm kiếm nhỏ hoặc mô hình ban đầu đã gần tối ưu. Chất lượng đặc trưng và cách xử lý dữ liệu thiếu có ảnh hưởng lớn đến kết quả cuối.

## Hướng cải thiện

- Dùng one-hot encoding đầy đủ cho biến phân loại thay vì chỉ giữ đặc trưng số.
- Log-transform `SalePrice` để giảm lệch phân phối.
- Thử XGBoost, LightGBM hoặc CatBoost.
- Dùng nested cross-validation để đánh giá tuning khách quan hơn.

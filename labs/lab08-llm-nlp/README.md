# Lab 08 - Large Language Models for NLP

## Tóm tắt

Lab này thực hành các kỹ thuật NLP hiện đại với mô hình ngôn ngữ lớn: fine-tune BERT cho sentiment analysis, sinh văn bản bằng GPT-2, thử prompt engineering, xây chatbot đơn giản và minh họa Retrieval-Augmented Generation.

## Tài liệu

| File | Mô tả |
| --- | --- |
| [assignment.pdf](assignment.pdf) | Đề bài thực hành gốc |
| [report.pdf](report.pdf) | Báo cáo chi tiết, hình ảnh kết quả và phân tích |

## Mục tiêu

- Hiểu khái niệm Large Language Models và kiến trúc Transformer.
- Sử dụng pretrained language models thay vì huấn luyện từ đầu.
- Fine-tune BERT cho sentiment analysis.
- Dùng GPT-2 cho text generation.
- Thử prompt engineering, chatbot và RAG.
- Đánh giá kết quả bằng accuracy, precision, recall và F1-score.

## Dữ liệu

- Dataset: IMDB movie reviews.
- Nhiệm vụ: phân loại cảm xúc tích cực/tiêu cực.
- Báo cáo dùng tập rút gọn gồm 3,000 mẫu train và 1,000 mẫu test.
- Tokenizer chính: `bert-base-uncased`.
- Độ dài chuỗi được giới hạn ở 128 token trong thử nghiệm chính.

## Mô hình và kỹ thuật

- BERT cho sequence classification.
- HuggingFace `AutoTokenizer`, `AutoModelForSequenceClassification`, `Trainer`.
- GPT-2 pipeline cho text generation.
- Prompt engineering để điều khiển chủ đề và phong cách sinh văn bản.
- Sentence Transformers và FAISS cho truy xuất trong RAG.

## Quy trình thực hiện

1. Cài đặt transformers, datasets, sentence-transformers và faiss-cpu.
2. Tải IMDB từ Kaggle input và cân bằng hai lớp.
3. Tokenize văn bản bằng BERT tokenizer.
4. Đóng gói dữ liệu thành PyTorch Dataset.
5. Fine-tune BERT cho sentiment analysis.
6. Đánh giá accuracy, precision, recall và F1-score.
7. Sinh văn bản bằng GPT-2 với nhiều prompt.
8. Xây chatbot đơn giản bằng pipeline sinh văn bản.
9. Minh họa RAG bằng embedding, FAISS index và truy xuất context.
10. So sánh LLM thuần với RAG trong tình huống cần thông tin ngoài.

## Kết quả chính

- BERT đạt accuracy khoảng **84.20%** trên 1,000 mẫu test.
- Precision đạt **83.66%**.
- Recall đạt **85.00%**.
- F1-score đạt **84.33%**.
- Kết quả tốt trong phạm vi tập rút gọn, nhưng chưa đại diện cho toàn bộ IMDB.
- RAG cho thấy retrieval giúp câu trả lời có ngữ cảnh hơn, nhưng cần đánh giá nguồn và chất lượng truy xuất.

## Nhận xét

BERT học đặc trưng sentiment khá tốt chỉ sau một epoch, nhưng tập train nhỏ và giới hạn 128 token làm mất thông tin ở các review dài. GPT-2 phản ứng mạnh với prompt nhưng có thể lặp, lan man hoặc sinh thông tin không chắc chắn nếu thiếu ràng buộc. RAG giúp bổ sung ngữ cảnh ngoài mô hình, nhưng retrieval đúng mới là điều kiện quan trọng.

## Hướng cải thiện

- Fine-tune trên toàn bộ IMDB hoặc tăng lên 2-3 epoch.
- Dùng validation set để chọn checkpoint tốt nhất.
- Tăng `max_length` hoặc dùng mô hình xử lý văn bản dài.
- Đánh giá text generation theo coherence, relevance và factuality.
- RAG nên hiển thị nguồn, điểm truy xuất và cơ chế lọc context.

# PRODUCT MASTERPLAN: WATASHIWA (PROJECT CUBE)

**Version:** 1.0 (The CUBE Edition)
**Status:** Approved for Execution
**Target Market:** Global Learners (Priority: Vietnamese & Asian markets leveraging Sino-roots)

---

## PHẦN 1: TẦM NHÌN & TRIẾT LÝ (THE VISION)

### 1. The Core Problem (Nỗi đau thị trường)

Người học ngoại ngữ hiện tại đang bị mắc kẹt giữa hai thái cực:

* **Thái cực nhàm chán (Anki/Flashcard cũ):** Học vẹt, rời rạc, thiếu ngữ cảnh, dễ nản.
* **Thái cực ảo giác (Duolingo):** Quá nhiều game, cảm giác "chơi vui" nhưng kiến thức đọng lại (Retention) cực thấp.

### 2. The Solution: The CUBE Method™

WatashiWa không dạy từ vựng trên mặt phẳng 2D. Chúng ta xây dựng kiến thức theo khối 3D vững chắc.

**Công thức C.U.B.E:**

* **C - Context First (Ngữ cảnh đi đầu):** Không bao giờ học từ cô lập. Luôn bắt đầu bằng câu chuyện (Priming) và nuôi dưỡng bằng nhật ký (Immersion).
* **U - Understanding Deeply (Thấu hiểu gốc rễ):** Sử dụng tư duy Hán Việt (Etymology) để tạo ra những khoảnh khắc "Aha!", giúp user hiểu bản chất thay vì nhớ vẹt.
* **B - Block Interference (Chặn đứng can nhiễu):** Hệ thống chủ động phát hiện và triệt tiêu sự nhầm lẫn giữa các từ giống nhau (Confusion Pairs).
* **E - Encode Dynamically (Mã hóa động):** Một từ vựng có "N" biến thể hiển thị (Nghe, Nói, Điền từ). Buộc não bộ phải hoạt động liên tục (Active Recall) để khắc sâu ký ức.

---

## PHẦN 2: KIẾN TRÚC TÍNH NĂNG (FUNCTIONAL ARCHITECTURE)

### TRỤ CỘT 1: C - CONTEXT (HỆ THỐNG DẪN NHẬP & TẮM NGÔN NGỮ)

**1.1. Feature: Story Priming Engine (Thay thế Overview cũ)**

* **Logic:** Trước khi User học từ vựng bài mới (VD: Unit 5), hệ thống chặn lại bằng một "Cổng ngữ cảnh".
* **Trải nghiệm:** Hiển thị một Micro-Story (150 chữ) chứa 80% từ mới của bài đó.
* *Interactive:* Các từ mới được highlight. User chạm vào để xem nghĩa nhanh (Tooltip).
* *Requirement:* User phải nghe hết Audio hoặc trả lời 1 câu hỏi "Yes/No" về nội dung câu chuyện mới được mở khóa Flashcard.

* **Mục tiêu:** Tạo "móc treo" trong não. Khi vào học Flashcard, User sẽ nhớ: *"À, từ này mình vừa gặp trong câu chuyện lúc nãy"*.

**1.2. Feature: AI Immersion Diary (Nhật ký hồi tưởng)**

* **Logic:** Mỗi 3 ngày, AI quét toàn bộ từ vựng user *đã học* (từ quá khứ đến hiện tại) để viết ra một đoạn nhật ký ngắn.
* **Trải nghiệm:** "Sáng nay, tôi đi (Unit 5) siêu thị (Unit 3) mua táo (Unit 8) nhưng quên mang tiền (Unit 12)."
* **Giá trị:** Ôn tập thụ động nhưng cực thấm (Passive Review in Context).

### TRỤ CỘT 2: U - UNDERSTANDING (HỆ THỐNG THẤU HIỂU)

**2.1. Feature: Etymology Insight (Hán Việt Core)**

* **Dữ liệu:** Không chỉ hiện Hán Việt. Phải hiện **"Chuỗi liên kết"**.
* *Từ:* 食べます (Tabemasu).
* *Hán:* THỰC.
* *Giải nghĩa:* Thực phẩm, Lương thực -> Ăn.

* **Word Family (Gia đình từ):** Khi học từ "Đại học" (Daigaku), hệ thống list ngay các từ cũ có chữ "Đại" hoặc "Học" bên dưới để User kết nối kiến thức.

### TRỤ CỘT 3: B - BLOCK (HỆ THỐNG PHÒNG THỦ)

**3.1. Feature: Interference Shield (Khiên chống nhiễu - Killer Feature)**

* **Trigger (Kích hoạt):**
* *Chủ động:* User trả lời sai một từ nằm trong danh sách "Confusing Pairs" (được định nghĩa trong DB).
* *Phản ứng:* User sai một thẻ quá 3 lần (Leech threshold).

* **Intervention Mode (Chế độ can thiệp):**
* Ngưng session Flashcard hiện tại.
* Bật Popup: **"Wait! Don't guess." (Khoan! Đừng đoán mò)**.
* Hiển thị 2 từ cạnh nhau (Side-by-side): *Kashimasu (Cho mượn)* vs *Karimasu (Mượn)*.
* Highlight điểm khác biệt (Mẹo nhớ: K**a**rimasu = Take = Lấy về).
* Bắt buộc User chọn đúng nghĩa trắc nghiệm mới cho quay lại học tiếp.

### TRỤ CỘT 4: E - ENCODE (HỆ THỐNG MÃ HÓA & GHI NHỚ)

**4.1. Feature: Dynamic Variants (Biến thể thẻ)**

* **Cơ chế:** Database lưu 1 từ, nhưng App hiển thị ra N dạng thẻ khác nhau tùy vào độ thuộc bài của User.
* *Level 1 (New):* Mặt trước hiện Kanji -> Mặt sau hiện Nghĩa + Audio.
* *Level 2 (Review):* Mặt trước hiện Audio -> Mặt sau chọn Hình ảnh đúng.
* *Level 3 (Mastery):* Mặt trước hiện Câu đục lỗ "Ringo wo [____]" -> Mặt sau hiện Từ gốc.
* *Level 4 (Speaking - Future):* User phải giữ mic nói đúng từ đó.

**4.2. Feature: My Anchor & Community Wisdom**

* **My Anchor:** Cho phép User tự nhập ghi chú/câu chuyện cá nhân vào mặt sau thẻ.
* **Community:** Hiển thị "Top Mnemonic" do cộng đồng đóng góp. (VD: "Tabemasu -> Ta bẻ mía -> Ăn").

---

## PHẦN 3: DATABASE ARCHITECTURE (HYBRID SQL)

Đây là "xương sống" để chạy được mô hình CUBE. Chúng ta sử dụng **PostgreSQL** với sức mạnh của **JSONB**.

### 1. `vocabularies` (Core Data)

Bảng chứa dữ liệu gốc, bất biến.

```sql
CREATE TABLE vocabularies (
    id SERIAL PRIMARY KEY,
    unit_id INT REFERENCES units(id),
    word_surface VARCHAR(50) NOT NULL, -- Kanji: 食べます
    word_reading VARCHAR(50) NOT NULL, -- Hiragana: たべます
    word_romaji VARCHAR(50),           -- tabemasu
    
    -- TRỤ CỘT U (Understanding)
    han_viet_data JSONB, 
    -- Structure: {"kanji": "食", "sino": "THỰC", "desc": "Thực phẩm...", "related_words": [12, 45]}
    
    -- TRỤ CỘT B (Block) - Định nghĩa cặp từ gây nhầm lẫn
    confusing_ref_ids JSONB -- Array of IDs: [102, 305] (Trỏ tới các từ dễ nhầm với từ này)
);

```

### 2. `card_variants` (Dynamic Content)

Bảng chứa các "mặt" khác nhau của khối CUBE. Tách riêng để dễ scale.

```sql
CREATE TABLE card_variants (
    id SERIAL PRIMARY KEY,
    vocab_id INT REFERENCES vocabularies(id),
    variant_type VARCHAR(20), -- 'basic', 'context_gap_fill', 'audio_match', 'speaking'
    
    -- TRỤ CỘT C & E (Context & Encode)
    payload JSONB 
    -- Structure cho Gap Fill: 
    -- {"question": "Supa e [___] đi siêu thị", "answer": "ikimasu", "audio": "url"}
);

```

### 3. `user_reviews` (Learning Progress)

Bảng lưu trữ trí nhớ của người dùng.

```sql
CREATE TABLE user_reviews (
    user_id INT REFERENCES users(id),
    vocab_id INT REFERENCES vocabularies(id),
    
    -- SRS Metrics
    srs_stage INT DEFAULT 0, -- 0: New, 1-8: Review stages
    next_review_at TIMESTAMP,
    stability FLOAT,
    
    -- TRỤ CỘT E (Personal Anchor)
    my_anchor_note TEXT, -- Ghi chú cá nhân của user
    
    PRIMARY KEY (user_id, vocab_id)
);

```

---

## PHẦN 4: USER FLOW (KỊCH BẢN "THE DAILY LOOP")

1. **Trigger:** Notification lúc 8:00 PM: *"Nhật ký hôm nay của bạn đã được viết xong. Vào đọc đi!"*
2. **Step 1: Context Immersion (5 phút)**

* User mở app, đọc đoạn nhật ký ngắn do AI tạo từ các từ cũ. Cảm thấy tự tin vì hiểu hết.

3. **Step 2: Priming New Unit (5 phút)**

* User chọn bài mới. Đọc đoạn hội thoại chủ đề bài đó. Chạm vào các từ mới để "làm quen" mặt chữ.

4. **Step 3: CUBE Drilling (15 phút)**

* Học Flashcard.
* Thẻ 1: Hiện câu đục lỗ (Dynamic). User điền đúng.
* Thẻ 2: Hiện Kanji. User lật thẻ, đọc Hán Việt (Understanding).
* Thẻ 3: User trả lời sai từ *Kashimasu*.
* **Intervention:** App bật popup so sánh với *Karimasu* (Block). User sửa lỗi ngay lập tức.
* Thẻ 4: User tự gõ thêm mẹo nhớ "Ta bẻ mía" vào thẻ *Tabemasu* (Encoding).

5. **Step 4: Reward:**

* Cập nhật "Bản đồ chinh phục Kanji".

---

## PHẦN 5: EXECUTION ROADMAP (LỘ TRÌNH THỰC THI)

### Giai đoạn 1: The Core CUBE (Tháng 1 - Tháng 2)

* **Focus:** Xây dựng lại Database và logic Backend.
* **Actions:**
* Migrate toàn bộ data Minna cũ sang cấu trúc SQL mới.
* Dùng AI (GPT-4) chạy batch job để tạo dữ liệu cho cột `han_viet_data` và `card_variants` (mỗi từ tạo 3 câu ví dụ).
* Build tính năng **Story Priming** và **Interference Shield** (bằng tay, gắn tag thủ công cho các cặp từ phổ biến nhất).

### Giai đoạn 2: The Dynamic Layer (Tháng 3 - Tháng 4)

* **Focus:** Trải nghiệm Frontend & Active Recall.
* **Actions:**
* Cập nhật UI Flashcard để hỗ trợ render các loại thẻ khác nhau (Điền từ, Trắc nghiệm).
* Mở tính năng **"My Anchor"** cho user tự note.

### Giai đoạn 3: The AI & Growth (Tháng 5+)

* **Focus:** Cá nhân hóa tự động & Scale.
* **Actions:**
* Tích hợp AI API để generate **Nhật ký cá nhân (Immersion)** real-time.
* Marketing chiến dịch: "WatashiWa - The CUBE Method".

---

## LỜI KHUYÊN CHO FOUNDER

1. **Dữ liệu là Tài sản:** Code có thể viết lại, nhưng Data chất lượng (Câu ví dụ hay, Hán Việt chuẩn, Cặp từ gây nhiễu chính xác) là rào cản ngăn đối thủ copy bạn. Hãy dành 50% nguồn lực ban đầu để chải chuốt Data.
2. **Đừng phức tạp hóa AI:** Trong giai đoạn 1, đừng cố gắng gọi ChatGPT API mỗi khi user học (tốn tiền và chậm). Hãy dùng AI để **Generate sẵn (Pre-generate)** dữ liệu và lưu vào Database. Chỉ gọi AI real-time ở Giai đoạn 3.
3. **CUBE là câu chuyện Marketing:** Khi làm Landing Page, hãy vẽ một khối lập phương 3D xoay vòng. Nó trực quan và "sexy" hơn vạn lời nói.

Chúc bạn xây dựng WatashiWa thành công rực rỡ với phương pháp CUBE!

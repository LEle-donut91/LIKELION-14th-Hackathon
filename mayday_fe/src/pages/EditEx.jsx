import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditEx.module.css";
import Header from "../components/Header";
import Button from "../components/Button";

// 더미 데이터
const INITIAL_DATA = {
  merchant: "쿠팡",
  date: "2026-08-04",
  amount: 34900,
  item: "A4 용지 외 2건",
  proofType: "해당 없음",
  category: "소모품비",
  isValid: "부적격",
};

function EditEx() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_DATA);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 수정 저장하기 버튼 클릭 시 검증 및 처리
  const handleSave = () => {
    // input 태그에 값이 비어있는지 확인
    if (
      !formData.merchant.trim() ||
      !formData.date.trim() ||
      !formData.amount.trim() ||
      !formData.item.trim()
    ) {
      alert("값을 입력해주세요");
      return;
    }

    // 날짜 형식(YYYY-MM-DD) 및 금액 형식(숫자) 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const cleanAmount = formData.amount.replace(/,/g, "").replace("원", "").trim();
    const amountRegex = /^\d+$/;

    if (!dateRegex.test(formData.date) || !amountRegex.test(cleanAmount)) {
      alert("형식에 맞춰 내용을 입력해주세요");
      return;
    }

    // 사용자가 입력/선택한 값 log 출력 및 alert 표시
    console.log(formData);
    alert("수정되었습니다!");
    navigate(-1)
  };

  // 이 기록 삭제하기 버튼 클릭 시 처리
  const handleDelete = () => {
    alert("해당 기록이 삭제되었습니다");
    navigate(-1);
  };

  return (
    <div className={styles.container}>
    {/* 헤더 영역 */}
    <div className={styles.header}>
        <Header text="경비 기록 수정" />
    </div>

      {/* 메인 컨텐츠 */}
      <main className={styles.content}>
        <p className={styles.guideText}>
          <strong>모든 항목을 눌러 수정</strong>
          <span>할 수 있어요.</span>
        </p>

        <div className={styles.formCard}>
          {/* 상호명 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>상호명</label>
            <div className={styles.inputBox}>
              <input
                type="text"
                name="merchant"
                className={styles.input}
                value={formData.merchant}
                placeholder={INITIAL_DATA.merchant}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 날짜 & 금액 */}
          <div className={styles.rowGroup}>
            <div className={styles.halfInputGroup}>
              <label className={styles.label}>날짜</label>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  name="date"
                  className={styles.input}
                  value={formData.date}
                  placeholder={INITIAL_DATA.date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.halfInputGroup}>
              <label className={styles.label}>금액</label>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  name="amount"
                  className={`${styles.input} ${styles.boldText}`}
                  value={formData.amount}
                  placeholder={INITIAL_DATA.amount}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 품목 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>품목</label>
            <div className={styles.inputBox}>
              <input
                type="text"
                name="item"
                className={styles.input}
                value={formData.item}
                placeholder={INITIAL_DATA.item}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 증빙 유형 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>증빙 유형</label>
            <div className={styles.selectBox}>
              <select
                name="proofType"
                className={styles.select}
                value={formData.proofType}
                onChange={handleChange}
              >
                <option value="세금계산서">세금계산서</option>
                <option value="계산서">계산서</option>
                <option value="신용카드 매출전표">신용카드 매출전표</option>
                <option value="현금영수증">현금영수증</option>
                <option value="해당 없음">해당 없음</option>
              </select>
              <span className={styles.arrowIcon} />
            </div>
          </div>

          {/* 경비 항목 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>경비 항목</label>
            <div className={styles.selectBox}>
              <select
                name="category"
                className={styles.select}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="제세공과금">제세공과금</option>
                <option value="임차료">임차료</option>
                <option value="기업업무추진비">기업업무추진비</option>
                <option value="차량유지비">차량유지비</option>
                <option value="지급수수료">지급수수료</option>
                <option value="소모품비">소모품비</option>
                <option value="운반비">운반비</option>
                <option value="광고선전비">광고선전비</option>
                <option value="여비교통비">여비교통비</option>
                <option value="기타(비용)">기타(비용)</option>
              </select>
              <span className={styles.arrowIcon} />
            </div>
          </div>

          {/* 적격 여부 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>적격 여부</label>
            <div className={styles.radioGroup}>
              <label
                className={`${styles.radioBtn} ${
                  formData.isValid === "적격" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="isValid"
                  value="적격"
                  checked={formData.isValid === "적격"}
                  onChange={handleChange}
                  className={styles.hiddenRadio}
                />
                <span>적격</span>
              </label>

              <label
                className={`${styles.radioBtn} ${
                  formData.isValid === "부적격" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="isValid"
                  value="부적격"
                  checked={formData.isValid === "부적격"}
                  onChange={handleChange}
                  className={styles.hiddenRadio}
                />
                <span>부적격</span>
              </label>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className={styles.btnGroup}>
          <div onClick={handleSave}>
            <Button text="수정 저장하기" />
          </div>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            이 기록 삭제하기
          </button>
        </div>
      </main>
    </div>
  );
}

export default EditEx;

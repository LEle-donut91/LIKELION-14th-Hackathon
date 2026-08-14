import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditEx.module.css";
import Header from "../components/Header";
import Button from "../components/Button";
import EditDropdown from "../components/EditDropdown";

// 더미 데이터 불러오기
import { expenseEditData } from "../api/edit-mock-data";

// 증빙 유형 Enum <-> 한글 매핑
const EVIDENCE_TYPE_MAP = {
  TAX_INVOICE: "세금계산서",
  INVOICE: "계산서",
  CREDIT_CARD: "신용카드 매출전표",
  CASH_RECEIPT: "현금영수증",
  NON_QUALIFIED: "해당 없음",
};

// 지출 카테고리 Enum <-> 한글 매핑
const CATEGORY_MAP = {
  TAXES: "제세공과금",
  RENT: "임차료",
  ENTERTAINMENT: "기업업무추진비",
  VEHICLE: "차량유지비",
  COMMISSION: "지급수수료",
  SUPPLIES: "소모품비",
  TRANSPORT: "운반비",
  ADVERTISING: "광고선전비",
  TRAVEL: "여비교통비",
  OTHER_EXPENSE: "기타(비용)",
};

const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

// 경비 항목 드롭다운 메뉴 리스트
const categoryItems = [
    '제세공과금', '임차료', '기업업무추진비', '차량유지비',
    '지급수수료', '소모품비', '운반비', '광고선전비', '여비교통비', '기타(비용)'
  ];

// 증빙 유형 드롭다운 메뉴 리스트
const evidenceItems = [
    '세금계산서', '계산서', '신용카드 매출전표', '현금영수증', '해당 없음'
  ];

function EditEx() {
  const navigate = useNavigate();

  // 초기 상태 설정
  const [formData, setFormData] = useState(() => ({
    analysisId: expenseEditData.analysisId,
    merchant: expenseEditData.merchantName,
    date: expenseEditData.date,
    amount: expenseEditData.amount,
    item: expenseEditData.itemName,
    proofType: EVIDENCE_TYPE_MAP[expenseEditData.evidenceType],
    category: CATEGORY_MAP[expenseEditData.category],
    qualifiedEvidence: expenseEditData.qualifiedEvidence ?? false, // Boolean (true/false)
  }));

  // onFocus 직전의 필드별 값 보관용 ref
  const previousValuesRef = useRef({});

  // 클릭(포커스) 시 직전 값을 기록하고 입력창을 비움 (onFocus 이벤트)
  const handleFocus = (e) => {
    const { name, value } = e.target;
    previousValuesRef.current[name] = value; // 포커스 직전 값 저장

    setFormData((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // 포커스 해제(블러) 시 아무것도 입력 안 한 상태면 '직전 값'으로 복구 (onBlur 이벤트)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      const prevValue = previousValuesRef.current[name] || "";
      setFormData((prev) => ({
        ...prev,
        [name]: prevValue,
      }));
    }
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "amount") {
    // '원', 쉼표 등 숫자가 아닌 모든 문자 제거 후 저장
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      amount: onlyNumbers, // state에는 100000 형태의 숫자만 들어감
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  const handleKeyDown = (e) => {
    // Backspace 키를 눌렀을 때만 작동
    if (e.key === "Backspace") {
      const input = e.target;
      const { selectionStart, selectionEnd, value } = input;

      // 커서 위치가 맨 뒤(또는 "원" 뒤)에 있고, 텍스트가 존재하는 경우
      if (selectionStart === value.length && selectionEnd === value.length && value.length > 0) {
        e.preventDefault(); // 기본 Backspace 동작("원"을 지우거나 커서만 이동)을 막음

        // 숫자만 추출 후 맨 뒷자리 제거
        const numbersOnly = value.replace(/[^0-9]/g, "");
        const newNumbers = numbersOnly.slice(0, -1);

        // 상태 업데이트
        setFormData((prev) => ({
          ...prev,
          amount: newNumbers,
        }));
        }
      }
  };

  // Dropdown 전용 값 변경 함수
  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleQualifiedChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      qualifiedEvidence: value,
    }));
  };

  const handleSave = () => {
    // input 태그에 값이 비어있는지 확인
    if (
      !formData.merchant.trim() ||
      !formData.date.trim() ||
      !String(formData.amount).trim() ||
      !formData.item.trim()
    ) {
      alert("값을 입력해주세요");
      return;
    }

    const dateRegex = /^\d{4}[.-]\d{2}[.-]\d{2}$/;
    const cleanAmount = Number(
      String(formData.amount).replace(/[^0-9]/g, "").trim()
    );

    if (!dateRegex.test(formData.date) || isNaN(cleanAmount)) {
      alert("형식에 맞춰 내용을 입력해주세요");
      return;
    }

    // 서버 / 더미 데이터 규격에 맞춘 최종 객체
    const saveData = {
      analysisId: formData.analysisId,
      type: "EXPENSE",
      date: formData.date,
      merchantName: formData.merchant,
      itemName: formData.item,
      amount: cleanAmount,
      category: getKeyByValue(CATEGORY_MAP, formData.category),
      evidenceType: getKeyByValue(EVIDENCE_TYPE_MAP, formData.proofType),
      qualifiedEvidence: formData.qualifiedEvidence, // Boolean (true/false)
    };

    console.log("저장 데이터:", saveData);
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
                placeholder={expenseEditData.merchantName}
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
                  placeholder={expenseEditData.date}
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
                  value={
                    formData.amount 
                      ? `${Number(formData.amount).toLocaleString()}원` 
                      : ""
                  }
                  placeholder={`${expenseEditData.amount.toLocaleString()}원`}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
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
                placeholder={expenseEditData.itemName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 증빙 유형 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>증빙 유형</label>
            <div className={styles.selectBox}>
              <EditDropdown
                placeholder="증빙 유형 선택"
                items={evidenceItems}
                selectedValue={formData.proofType}
                onSelect={(val) => handleDropdownChange("proofType", val)}
            />
              <span className={styles.arrowIcon} />
            </div>
          </div>

          {/* 경비 항목 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>경비 항목</label>
            <div className={styles.selectBox}>
              <EditDropdown
                placeholder="경비 항목 선택"
                items={categoryItems}
                selectedValue={formData.category}
                onSelect={(val) => handleDropdownChange("category", val)}
            />
              <span className={styles.arrowIcon} />
            </div>
          </div>

          {/* 적격 여부 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>적격 여부</label>
            <div className={styles.radioGroup}>
              <label
                className={`${styles.radioBtn} ${
                  formData.qualifiedEvidence === true ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="qualifiedEvidence"
                  checked={formData.qualifiedEvidence === true}
                  onChange={() => handleQualifiedChange(true)}
                  className={styles.hiddenRadio}
                />
                <span>적격</span>
              </label>

              <label
                className={`${styles.radioBtn} ${
                  formData.qualifiedEvidence === false ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="qualifiedEvidence"
                  checked={formData.qualifiedEvidence === false}
                  onChange={() => handleQualifiedChange(false)}
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

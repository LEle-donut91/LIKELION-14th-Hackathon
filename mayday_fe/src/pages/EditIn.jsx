import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditIn.module.css";
import Header from "../components/Header";
import Button from "../components/Button";
import EditDropdown from "../components/EditDropdown";

// 더미 데이터 불러오기
import { incomeEditData } from "../api/edit-mock-data";

// 카테고리 Enum <-> 한글 매핑
const CATEGORY_MAP = {
  SALES: "매출",
  OTHER_INCOME: "기타(수입)",
};

const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

/**
 * 금액 자동 계산 함수 (유연한 상호 계산)
 * @param {string|number} valueStr - 입력된 금액 문자열 또는 숫자
 * @param {boolean} isWithholding - 3.3% 공제 여부
 * @param {'netAmount'|'grossAmount'|'taxAmount'} sourceField - 변경된 입력 필드 이름
 * 
 */
const calculateAmounts = (valueStr, isWithholding, sourceField = "netAmount") => {
  // 입력된 금액 -> Number 타입으로 변환
  const cleanVal = Number(valueStr.toString().replace(/[^0-9]/g, "")) || 0;

  // 초기값 설정
  let net = 0; // 받은 금액 (실수령액)
  let gross = 0; // 공제 전 금액
  let tax = 0; // 원천징수 세액

  if (sourceField === "netAmount") { // 실수령액 입력 시
    gross = Math.round(cleanVal / 0.967);
    tax = gross - cleanVal;

    // 실수령액에 사용자 입력값 최종 저장
    net = cleanVal; 
  } else if (sourceField === "grossAmount") { // 공제 전 금액 입력 시
    tax = Math.round(cleanVal * 0.033);
    net = cleanVal - tax;

    // 공제 전 금액에 사용자 입력값 최종 저장
    gross = cleanVal; 
  } else if (sourceField === "taxAmount") { // 원천징수 세액 입력 시
    gross = Math.round(cleanVal / 0.033);
    net = gross - cleanVal;

    // 원천징수 세액에 사용자 입력값 최종 저장
    tax = cleanVal;
  }

  return { netAmount: net, grossAmount: gross, taxAmount: tax };
};

// 수입 항목 드롭다운 메뉴 리스트
const categoryItems = ['매출', '기타(수입)'];

function EditIn() {
  const navigate = useNavigate();

  // 초기 상태 설정
  const [formData, setFormData] = useState(() => {
    const isWithholding = incomeEditData.withholding ?? true;
    const calculated = calculateAmounts(incomeEditData.amount, isWithholding, "netAmount");

    return {
      analysisId: incomeEditData.analysisId,
      merchant: incomeEditData.merchantName,
      date: incomeEditData.date,
      itemName: incomeEditData.itemName,
      isWithholding: isWithholding,
      netAmount: calculated.netAmount,
      grossAmount: calculated.grossAmount,
      taxAmount: calculated.taxAmount,
      category: CATEGORY_MAP[incomeEditData.category],
    };
  });


  // 일반 및 금액 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 금액 관련 3개 필드 변경 처리
    if (["netAmount", "grossAmount", "taxAmount"].includes(name)) {
      const calculated = calculateAmounts(value, formData.isWithholding, name);
      setFormData((prev) => ({
        ...prev,
        ...calculated,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Dropdown 전용 값 변경 함수
  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3.3% 공제 여부 변경 시 실수령액 기준으로 금액 자동 재계산
  const handleWithholdingChange = (value) => {
    const calculated = calculateAmounts(formData.netAmount, value, "netAmount");

    setFormData((prev) => ({
      ...prev,
      isWithholding: value,
      ...calculated,
    }));
  };

  // 금액 필드 백스페이스 처리 (단위 제거 시 숫자 한 자리 지우기)
  const handleKeyDown = (e, fieldName) => {
    if (e.key === "Backspace") {
      const input = e.target;
      const { selectionStart, selectionEnd, value } = input;

      // 커서 위치가 맨 뒤(또는 "원" 뒤)에 있고, 텍스트가 존재하는 경우
      if (selectionStart === value.length && selectionEnd === value.length && value.length > 0) {
        e.preventDefault(); // 기본 Backspace 동작("원"을 지우거나 커서만 이동)을 막음

        // 숫자만 추출 후 맨 뒷자리 제거
        const numbersOnly = value.replace(/[^0-9]/g, "");
        const newNumbers = numbersOnly.slice(0, -1);

        const calculated = calculateAmounts(newNumbers, formData.isWithholding, fieldName);
        setFormData((prev) => ({
          ...prev,
          ...calculated,
        }));
      }
    }
  };

  const handleSave = () => {
    if (
      !formData.merchant.trim() ||
      !formData.date.trim() ||
      !formData.netAmount.trim()
    ) {
      alert("값을 입력해주세요");
      return;
    }

    const dateRegex = /^\d{4}[.-]\d{2}[.-]\d{2}$/;
    const cleanNet = Number(formData.netAmount);

    if (!dateRegex.test(formData.date) || isNaN(cleanNet)) {
      alert("형식에 맞춰 내용을 입력해주세요");
      return;
    }

    // 서버 / 더미 데이터 규격에 맞춘 최종 객체
    const saveData = {
      analysisId: formData.analysisId,
      type: "INCOME",
      date: formData.date,
      merchantName: formData.merchant,
      itemName: formData.itemName,
      amount: cleanNet,
      grossAmount: formData.grossAmount,
      taxAmount: formData.taxAmount,
      category: getKeyByValue(CATEGORY_MAP, formData.category),
      withholding: formData.isWithholding,
    };

    console.log("저장 데이터:", saveData);
    alert("수정되었습니다!");
    navigate(-1);
  };

  const handleDelete = () => {
    alert("해당 기록이 삭제되었습니다");
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      {/* 헤더 영역 */}
      <header className={styles.headerWrapper}>
        <Header text="수입 기록 수정" />
      </header>

      {/* 메인 컨텐츠 */}
      <main className={styles.content}>
        <p className={styles.guideText}>
          <strong>모든 항목을 눌러 수정</strong>
          <span>할 수 있어요.</span>
        </p>

        <section className={styles.formCard}>
          {/* 거래처 & 날짜 */}
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>거래처</label>
              <input
                type="text"
                name="merchant"
                className={styles.input}
                value={formData.merchant}
                placeholder={incomeEditData.merchantName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.col}>
              <label className={styles.label}>날짜</label>
              <input
                type="text"
                name="date"
                className={styles.input}
                value={formData.date}
                placeholder={incomeEditData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 3.3% 원천징수 여부 */}
          <div className={styles.field}>
            <label className={styles.label}>3.3% 원천징수(공제) 여부</label>
            <div className={styles.radioGroup}>
              <label
                className={`${styles.radioBtn} ${
                  formData.isWithholding === true ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="isWithholding"
                  checked={formData.isWithholding === true}
                  onChange={() => handleWithholdingChange(true)}
                  className={styles.hiddenRadio}
                />
                <span>3.3% 공제</span>
              </label>

              <label
                className={`${styles.radioBtn} ${
                  formData.isWithholding === false ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="isWithholding"
                  checked={formData.isWithholding === false}
                  onChange={() => handleWithholdingChange(false)}
                  className={styles.hiddenRadio}
                />
                <span>공제 없음</span>
              </label>
            </div>
          </div>

          {/* 받은 금액 (실수령액) */}
          <div className={styles.field}>
            <label className={styles.label}>받은 금액 (실수령액)</label>
            <input
              type="text"
              name="netAmount"
              className={`${styles.input} ${styles.boldInput}`}
              value={
                formData.netAmount !== ""
                  ? `${Number(formData.netAmount).toLocaleString()}원`
                  : ""
              }
              placeholder={`${incomeEditData.amount.toLocaleString()}원`}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "netAmount")}
            />
          </div>

          {/* 공제 전 금액 & 원천징수 세액 (수정 가능 및 상호 자동 계산) */}
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>공제 전 금액</label>
              <input
                type="text"
                name="grossAmount"
                className={styles.input}
                value={
                  formData.grossAmount !== ""
                    ? `${Number(formData.grossAmount).toLocaleString()}원`
                    : ""
                }
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "grossAmount")}
              />
            </div>

            <div className={styles.col}>
              <label className={styles.label}>원천징수 세액</label>
              <input
                type="text"
                name="taxAmount"
                className={styles.input}
                value={
                  formData.taxAmount !== ""
                    ? `${Number(formData.taxAmount).toLocaleString()}원`
                    : ""
                }
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "taxAmount")}
              />
            </div>
          </div>

          {/* 안내 텍스트 */}
          <p className={styles.subGuideText}>
            받은 금액이나 공제 여부를 바꾸면 나머지 금액이 자동으로 다시
            계산돼요. 직접 수정도 가능해요.
          </p>

          {/* 항목 선택 */}
          <div className={styles.field}>
            <label className={styles.label}>항목</label>
            <div className={styles.selectWrapper}>
              <EditDropdown
                placeholder="수입 항목 선택"
                items={categoryItems}
                selectedValue={formData.category}
                onSelect={(val) => handleDropdownChange("category", val)}
            />
              {/* 커스텀 화살표 아이콘 추가 */}
              <span className={styles.arrowIcon} />
            </div>
            <span className={styles.helperText}>매출 · 기타(수입) 중 선택</span>
          </div>
        </section>

        {/* 하단 버튼 영역 */}
        <div className={styles.btnGroup}>
          <Button text="수입 저장하기" onClick={handleSave} />
          <button className={styles.deleteBtn} onClick={handleDelete}>
            이 기록 삭제하기
          </button>
        </div>
      </main>
    </div>
  );
}

export default EditIn;

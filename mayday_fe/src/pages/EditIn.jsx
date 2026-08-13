import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditIn.module.css";
import Header from "../components/Header";
import Button from "../components/Button";

const INITIAL_DATA = {
  merchant: "크몽",
  date: "2026-08-02",
  isWithholding: "3.3% 공제",
  netAmount: "967000",
  category: "매출",
};

// 금액 자동 계산 함수
const calculateAmounts = (netAmountStr, isWithholding) => {
  const cleanNet = Number(netAmountStr.toString().replace(/[^0-9]/g, "")) || 0;

  if (cleanNet === 0) {
    return {
      netFormatted: 0,
      grossAmount: 0,
      taxAmount: 0,
    };
  }

  if (isWithholding === "3.3% 공제") {
    const gross = Math.round(cleanNet / 0.967);
    const tax = gross - cleanNet;
    return {
      netFormatted: cleanNet.toLocaleString(),
      grossAmount: gross.toLocaleString(),
      taxAmount: tax.toLocaleString(),
    };
  } else {
    return {
      netFormatted: cleanNet.toLocaleString(),
      grossAmount: cleanNet.toLocaleString(),
      taxAmount: "0",
    };
  }
};

function EditIn() {
  const navigate = useNavigate();

  // 초기 상태 설정 시 초기 자동 계산 실행
  const [formData, setFormData] = useState(() => {
    const calculated = calculateAmounts(
      INITIAL_DATA.netAmount,
      INITIAL_DATA.isWithholding
    );
    return {
      ...INITIAL_DATA,
      netAmount: calculated.netFormatted, // 사용자에게는 쉼표 포맷으로 표시
      grossAmount: calculated.grossAmount,
      taxAmount: calculated.taxAmount,
    };
  });

  // 일반 입력 변경 (실수령액 입력 시 다른 금액 자동 계산)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "netAmount") {
      const calculated = calculateAmounts(value, formData.isWithholding);
      setFormData((prev) => ({
        ...prev,
        netAmount: calculated.netFormatted,
        grossAmount: calculated.grossAmount,
        taxAmount: calculated.taxAmount,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 3.3% 공제 여부 변경 시 금액 자동 재계산
  const handleWithholdingChange = (e) => {
    const value = e.target.value;
    const calculated = calculateAmounts(formData.netAmount, value);

    setFormData((prev) => ({
      ...prev,
      isWithholding: value,
      netAmount: calculated.netFormatted,
      grossAmount: calculated.grossAmount,
      taxAmount: calculated.taxAmount,
    }));
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
    const cleanNet = formData.netAmount.replace(/,/g, "").trim();
    const amountRegex = /^\d+$/;

    if (!dateRegex.test(formData.date) || !amountRegex.test(cleanNet)) {
      alert("형식에 맞춰 내용을 입력해주세요");
      return;
    }

    console.log({
      ...formData,
      netAmount: cleanNet,
    });
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
                placeholder={INITIAL_DATA.merchant}
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
                placeholder={INITIAL_DATA.date}
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
                  formData.isWithholding === "3.3% 공제" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="isWithholding"
                  value="3.3% 공제"
                  checked={formData.isWithholding === "3.3% 공제"}
                  onChange={handleWithholdingChange}
                  className={styles.hiddenRadio}
                />
                <span>3.3% 공제</span>
              </label>

              <label
                className={`${styles.radioBtn} ${
                  formData.isWithholding === "공제 없음" ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="isWithholding"
                  value="공제 없음"
                  checked={formData.isWithholding === "공제 없음"}
                  onChange={handleWithholdingChange}
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
              value={formData.netAmount}
              onChange={handleChange}
            />
          </div>

          {/* 공제 전 금액 & 원천징수 세액 (자동 계산되어 표시됨) */}
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>공제 전 금액</label>
              <input
                type="text"
                name="grossAmount"
                className={styles.input}
                value={formData.grossAmount}
                readOnly
              />
            </div>

            <div className={styles.col}>
              <label className={styles.label}>원천징수 세액</label>
              <input
                type="text"
                name="taxAmount"
                className={styles.input}
                value={formData.taxAmount}
                readOnly
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
            <div className={styles.selectBox}>
              <select
                name="category"
                className={styles.select}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="매출">매출</option>
                <option value="기타(수입)">기타(수입)</option>
              </select>
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

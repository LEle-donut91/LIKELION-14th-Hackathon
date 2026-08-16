import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditIn.module.css";
import Header from "../components/Header";
import Button from "../components/Button";
import EditDropdown from "../components/EditDropdown";
import EditDeleteIcon from "../assets/images/EditDeleteIcon.svg";
import EditInfoIcon from "../assets/images/EditInfoIcon.svg";
import {
  getIncomeDetail,
  updateIncomeDetail,
  deleteIncomeDetail,
} from "../api/editApi";

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
const calculateAmounts = (
  valueStr,
  isWithholding,
  sourceField = "netAmount",
) => {
  // 입력된 금액 -> Number 타입으로 변환
  const cleanVal = Number(valueStr.toString().replace(/[^0-9]/g, "")) || 0;

  // 초기값 설정
  let net = 0; // 받은 금액 (실수령액)
  let gross = 0; // 공제 전 금액
  let tax = 0; // 원천징수 세액

  // 공제 없음(false)일 때 금액 설정
  if (!isWithholding) {
    tax = 0; // 원천징수 세액은 무조건 0원
    net = cleanVal; // 실수령액 = 입력 금액
    gross = cleanVal; // 공제 전 금액 = 입력 금액

    return { netAmount: net, grossAmount: gross, taxAmount: tax };
  }

  // [조건] 3.3% 공제(true)일 때의 기존 로직
  if (sourceField === "netAmount") {
    // 실수령액 입력 시
    gross = Math.round(cleanVal / 0.967);
    tax = gross - cleanVal;

    // 실수령액에 사용자 입력값 최종 저장
    net = cleanVal;
  } else if (sourceField === "grossAmount") {
    // 공제 전 금액 입력 시
    tax = Math.round(cleanVal * 0.033);
    net = cleanVal - tax;

    // 공제 전 금액에 사용자 입력값 최종 저장
    gross = cleanVal;
  } else if (sourceField === "taxAmount") {
    // 원천징수 세액 입력 시
    gross = Math.round(cleanVal / 0.033);
    net = gross - cleanVal;

    // 원천징수 세액에 사용자 입력값 최종 저장
    tax = cleanVal;
  }

  return { netAmount: net, grossAmount: gross, taxAmount: tax };
};

// 수입 항목 드롭다운 메뉴 리스트
const categoryItems = ["매출", "기타(수입)"];

function EditIn() {
  const navigate = useNavigate();
  // URL Parameter에서 incomeId 추출
  const { incomeId } = useParams();

  const [isLoading, setIsLoading] = useState(true);

  // GET 요청으로 받아온 초기 원본 데이터를 보존할 상태
  const [initialData, setInitialData] = useState({
    merchant: "",
    date: "",
  });

  const [formData, setFormData] = useState({
    incomeId: "",
    merchant: "",
    date: "",
    isWithholding: true,
    netAmount: 0,
    grossAmount: 0,
    taxAmount: 0,
    category: "매출",
  });

  // 초기 API 서버 상세 데이터 로드
  useEffect(() => {
    const fetchIncomeDetail = async () => {
      setIsLoading(true);
      try {
        const response = await getIncomeDetail(incomeId);
        if (response.status === 200 && response.data) {
          const data = response.data;

          // GET으로 받아온 원본 거래처 / 날짜를 저장 (placeholder 용도)
          setInitialData({
            merchant: data.merchantName || "",
            date: data.date || "",
          });

          setFormData({
            incomeId: data.incomeId,
            merchant: data.merchantName || "",
            date: data.date || "",
            isWithholding: data.withholding ?? true,
            netAmount: data.amount || 0,
            grossAmount: data.grossAmount || 0,
            taxAmount: data.withholdingTax || 0,
            category: CATEGORY_MAP[data.category] || "매출",
          });
        }
      } catch (error) {
        console.error("수입 상세 조회 실패:", error);
        alert(error.message || "데이터를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncomeDetail();
  }, [incomeId]);

  // 일반 및 금액 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 공제 없음일 때는 taxAmount 변경 무시
    if (!formData.isWithholding && name === "taxAmount") return;

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
    // 공제 없음일 때 taxAmount 키입력 방지
    if (!formData.isWithholding && fieldName === "taxAmount") return;

    if (e.key === "Backspace") {
      const input = e.target;
      const { selectionStart, selectionEnd, value } = input;

      // 커서 위치가 맨 뒤(또는 "원" 뒤)에 있고, 텍스트가 존재하는 경우
      if (
        selectionStart === value.length &&
        selectionEnd === value.length &&
        value.length > 0
      ) {
        e.preventDefault(); // 기본 Backspace 동작("원"을 지우거나 커서만 이동)을 막음

        // 숫자만 추출 후 맨 뒷자리 제거
        const numbersOnly = value.replace(/[^0-9]/g, "");
        const newNumbers = numbersOnly.slice(0, -1);

        const calculated = calculateAmounts(
          newNumbers,
          formData.isWithholding,
          fieldName,
        );
        setFormData((prev) => ({
          ...prev,
          ...calculated,
        }));
      }
    }
  };

  const handleSave = async () => {
    if (
      !formData.merchant.trim() ||
      !formData.date.trim() ||
      formData.netAmount === "" ||
      formData.netAmount === null
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

    // API 요청 규격에 맞춘 Payload 생성
    const patchPayload = {
      date: formData.date.replace(/\./g, "-"), // yyyy-mm-dd 서식 맞춤
      merchantName: formData.merchant,
      amount: formData.grossAmount, // 공제 전 금액
      receivedAmount: cleanNet, // 실수령액
      withholdingTax: formData.taxAmount, // 원천징수 세액
      withholdingTaxApplied: formData.isWithholding,
      category: getKeyByValue(CATEGORY_MAP, formData.category),
      remark: null,
    };

    try {
      const response = await updateIncomeDetail(incomeId, patchPayload);
      if (response.status === 200) {
        alert("수정되었습니다!");
        navigate(-1);
      }
    } catch (error) {
      console.error("수입 수정 실패:", error);
      alert(error.message || "수정 처리 중 오류가 발생했습니다.");
    }
  };

  // 삭제 (DELETE) 핸들러
  const handleDelete = async () => {
    try {
      const response = await deleteIncomeDetail(incomeId);
      if (response.status === 200) {
        alert("해당 기록이 삭제되었습니다.");
        navigate(-1);
      }
    } catch (error) {
      console.error("수입 삭제 실패:", error);
      alert(error.message || "삭제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 영역 */}
      <header className={styles.headerWrapper}>
        <Header text="수입 기록 수정" />
        <img
          className={styles.deleteIconBtn}
          alt="삭제하기"
          src={EditDeleteIcon}
          onClick={handleDelete}
        />
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
              <div className={styles.inputBox}>
                <input
                  type="text"
                  name="merchant"
                  className={styles.input}
                  value={isLoading ? "로딩중..." : formData.merchant}
                  placeholder={isLoading ? "로딩중..." : initialData.merchant}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.col}>
              <label className={styles.label}>날짜</label>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  name="date"
                  className={styles.input}
                  value={isLoading ? "로딩중..." : formData.date}
                  placeholder={isLoading ? "로딩중..." : initialData.date}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <span>공제 없음</span>
              </label>
            </div>
          </div>

          {/* 받은 금액 (실수령액) */}
          <div className={styles.field}>
            <div className={styles.labelWithBadge}>
              <label className={styles.label}>받은 금액 (실수령액)</label>
              <span className={styles.badgePrimary}>주 입력</span>
            </div>
            <div className={`${styles.inputBox} ${styles.highlightBox}`}>
              <input
                type="text"
                name="netAmount"
                className={`${styles.input} ${styles.boldInput}`}
                value={
                  isLoading
                    ? "로딩중..."
                    : formData.netAmount !== ""
                      ? `${Number(formData.netAmount).toLocaleString()}원`
                      : ""
                }
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, "netAmount")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 공제 전 금액 & 원천징수 세액 */}
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.labelWithBadge}>
                <label className={styles.label}>공제 전 금액</label>
                <span className={styles.badgeAuto}>자동</span>
              </div>
              <div className={`${styles.inputBox} ${styles.disabledBox}`}>
                <input
                  type="text"
                  name="grossAmount"
                  className={styles.input}
                  value={
                    isLoading
                      ? "로딩중..."
                      : formData.grossAmount !== ""
                        ? `${Number(formData.grossAmount).toLocaleString()}원`
                        : ""
                  }
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, "grossAmount")}
                  disabled={isLoading}
                  readOnly
                />
              </div>
            </div>

            <div className={styles.col}>
              <div className={styles.labelWithBadge}>
                <label className={styles.label}>원천징수 세액</label>
                <span className={styles.badgeAuto}>자동</span>
              </div>
              <div className={`${styles.inputBox} ${styles.disabledBox}`}>
                <input
                  type="text"
                  name="taxAmount"
                  className={styles.input}
                  value={
                    isLoading
                      ? "로딩중..."
                      : formData.taxAmount !== ""
                        ? `${Number(formData.taxAmount).toLocaleString()}원`
                        : ""
                  }
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, "taxAmount")}
                  disabled={isLoading}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className={styles.infoNoticeCard}>
            <img className={styles.infoIcon} src={EditInfoIcon} />
            <p className={styles.subGuideText}>
              {formData.isWithholding
                ? "받은 금액을 입력하면 3.3% 원천징수 기준으로 나머지 금액이 자동 계산돼요."
                : "원천징수가 없어 세액은 0원이에요."}
            </p>
          </div>

          {/* 항목 선택 */}
          <div className={styles.field}>
            <label className={styles.label}>항목</label>
            <div className={styles.selectWrapper}>
              <EditDropdown
                placeholder="수입 항목 선택"
                items={categoryItems}
                selectedValue={isLoading ? "로딩중..." : formData.category}
                onSelect={(val) => handleDropdownChange("category", val)}
              />
              {/* 커스텀 화살표 아이콘 추가 */}
              <span className={styles.arrowIcon} />
            </div>
            <span className={styles.helperText}>매출 · 기타(수입) 중 선택</span>
          </div>
        </section>
      </main>
      {/* 하단 버튼 영역 */}
      <div className={styles.btnGroup}>
        <Button text="수입 저장하기" onClick={handleSave} />
      </div>
    </div>
  );
}

export default EditIn;

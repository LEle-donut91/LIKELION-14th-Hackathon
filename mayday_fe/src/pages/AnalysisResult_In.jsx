import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./AnalysisResult_In.module.css";
import Header from "../components/Header";
import EditDropdown from "../components/EditDropdown";
//import AnalysisDropdown from "../components/AnalysisDropdown";

import AnalysisReason from "../assets/images/AnalysisReason.svg";
import AnalysisWarning2 from "../assets/images/AnalysisWarning2.svg";

import axiosInstance from '../api/axiosInstance';

const CATEGORY_MAP = {
  SALES: "매출",
  OTHER_INCOME: "기타(수입)",
};
const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};
const categoryItems = Object.values(CATEGORY_MAP);

const calculateAmounts = (valueStr, isWithholding, sourceField = "netAmount") => {
  const cleanVal = Number(valueStr.toString().replace(/[^0-9]/g, "")) || 0;
  let net = 0;   // 실수령액
  let gross = 0; // 공제 전 금액
  let tax = 0;   // 원천징수 세액

  if (!isWithholding) {
    return { netAmount: cleanVal, grossAmount: cleanVal, taxAmount: 0 };
  }
  if (sourceField === "netAmount") {
    gross = Math.round(cleanVal / 0.967);
    tax = gross - cleanVal;
    net = cleanVal;
  } else if (sourceField === "grossAmount") {
    tax = Math.round(cleanVal * 0.033);
    net = cleanVal - tax;
    gross = cleanVal;
  } else if (sourceField === "taxAmount") {
    gross = Math.round(cleanVal / 0.033);
    net = gross - cleanVal;
    tax = cleanVal;
  }
  return { netAmount: net, grossAmount: gross, taxAmount: tax };
};

function AnalysisResult_In() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawAnalyzedData = location.state?.rawAnalyzedData || [];

  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const previousValuesRef = useRef({});

  useEffect(() => {
    if (rawAnalyzedData.length === 0) {
      alert("분석된 항목이 없습니다.");
      navigate('/record');
      return;
    }
    const formattedData = rawAnalyzedData.map(data => {
      const baseAmount = data.amount || 0;
      const isWithholding = !!data.isWithholding;
      const calculated = calculateAmounts(baseAmount, isWithholding, "netAmount");
      return {
        analysisId: data.analysisId,
        date: data.date.replace(/-/g, "."),
        merchant: data.merchantName,
        item: data.itemName || "수입",
        isWithholding,
        ...calculated,
        category: CATEGORY_MAP[data.category] || "매출",
        reason: data.reason
      };
    });
    setResults(formattedData);
  }, [rawAnalyzedData, navigate]);

  const handleFocus = (e) => {
    const { name, value } = e.target;
    previousValuesRef.current[name] = value;
    const updated = [...results];
    updated[currentIndex][name] = "";
    setResults(updated);
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      const updated = [...results];
      updated[currentIndex][name] = previousValuesRef.current[name] || "";
      setResults(updated);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = [...results];
    const current = updated[currentIndex];
    if (["netAmount", "grossAmount", "taxAmount"].includes(name)) {
      if (!current.isWithholding && name === "taxAmount") return; 
      const calculated = calculateAmounts(value, current.isWithholding, name);
      updated[currentIndex] = { ...current, ...calculated };
    } 
    else if (name === "date") {
      let onlyNumbers = value.replace(/[^0-9]/g, "");
      if (onlyNumbers.length > 8) onlyNumbers = onlyNumbers.slice(0, 8);
      let formattedDate = "";
      if (onlyNumbers.length < 5) {
        formattedDate = onlyNumbers;
      } else if (onlyNumbers.length < 7) {
        formattedDate = `${onlyNumbers.slice(0, 4)}.${onlyNumbers.slice(4)}`;
      } else {
        formattedDate = `${onlyNumbers.slice(0, 4)}.${onlyNumbers.slice(4, 6)}.${onlyNumbers.slice(6)}`;
      }
      updated[currentIndex].date = formattedDate;
    } 
    else {
      updated[currentIndex][name] = value;
    }
    setResults(updated);
  };

  const handleWithholdingChange = (value) => {
    const updated = [...results];
    const current = updated[currentIndex];
    const calculated = calculateAmounts(current.netAmount, value, "netAmount");
    updated[currentIndex] = {
      ...current,
      isWithholding: value,
      ...calculated,
    };
    setResults(updated);
  };

  const handleDropdownChange = (name, value) => {
    const updated = [...results];
    updated[currentIndex][name] = value;
    setResults(updated);
  };

  const handleKeyDown = (e, fieldName) => {
    const current = results[currentIndex];
    if (!current.isWithholding && fieldName === "taxAmount") return;
    if (e.key === "Backspace") {
      const input = e.target;
      const { selectionStart, selectionEnd, value } = input;
      if (selectionStart === value.length && selectionEnd === value.length && value.length > 0) {
        e.preventDefault();
        const numbersOnly = value.replace(/[^0-9]/g, "");
        const newNumbers = numbersOnly.slice(0, -1);
        const calculated = calculateAmounts(newNumbers, current.isWithholding, fieldName);
        const updated = [...results];
        updated[currentIndex] = { ...current, ...calculated };
        setResults(updated);
      }
    }
  };

  const handleSaveAll = async () => {
    let successCount = 0;
    for (const current of results) {
      if (!current.merchant.trim() || !current.date.trim() || current.netAmount === "" || current.netAmount === null) {
        alert(`${successCount + 1}번째 항목의 필수 값을 모두 입력해주세요.`);
        setCurrentIndex(successCount);
        return;
      }
      const dateRegex = /^\d{4}\.\d{2}\.\d{2}$/;
      if (!dateRegex.test(current.date)) {
        alert(`${successCount + 1}번째 항목의 날짜를 올바른 형식(YYYY.MM.DD)으로 입력해주세요.`);
        setCurrentIndex(successCount);
        return;
      }
      const postPayload = {
        analysisId: current.analysisId,
        date: current.date.replace(/\./g, "-"),
        merchantName: current.merchant,
        itemName: current.item || "수입", 
        amount: current.grossAmount, 
        receivedAmount: current.netAmount,
        withholdingTaxApplied: current.isWithholding,
        category: getKeyByValue(CATEGORY_MAP, current.category),
        remark: null,
      };
      try {
        const res = await axiosInstance.post('/incomes', postPayload);
        if (res.status === 200 || res.status === 201) {
          successCount++;
        } else {
          alert("저장에 실패한 항목이 있습니다.");
        }
      } catch (error) {
        console.error("저장 실패", error);
        const errMsg = error.response?.data?.message || "서버와 통신 중 오류가 발생했습니다.";
        alert(errMsg);
      }
    }
  
    const totalSavedAmount = successCount > 0 ? results.reduce((sum, item) => sum + Number(item.grossAmount), 0) : 0;
    navigate('/analysis-record', { 
      state: { 
        type: 'income', 
        savedCount: successCount, 
        savedAmount: totalSavedAmount 
      }
    });
  };

  if (!results.length) return null;
  const current = results[currentIndex];

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <Header text="분석 결과 확인" onClick={() => navigate('/record')} />
        <span className={styles.counter}>{currentIndex + 1} / {results.length}</span>
      </div>

      <main className={styles.scrollContent}>
        <p className={styles.guideText}>
          AI가 읽어낸 결과예요. <strong>모든 항목을 눌러 수정</strong>할 수 있어요.
        </p>
        <div className={styles.formCard}>
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>거래처</label>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  name="merchant"
                  className={`${styles.input} ${styles.boldText}`}
                  value={current.merchant}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>
            <div className={styles.col}>
              <label className={styles.label}>날짜</label>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  name="date"
                  className={`${styles.input} ${styles.boldText}`}
                  value={current.date}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>3.3% 원천징수(공제) 여부</label>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioBtn} ${current.isWithholding === true ? styles.selected : ""}`}>
                <input
                  type="radio"
                  name="isWithholding"
                  checked={current.isWithholding === true}
                  onChange={() => handleWithholdingChange(true)}
                  className={styles.hiddenRadio}
                />
                <span>3.3% 공제</span>
              </label>
              <label className={`${styles.radioBtn} ${current.isWithholding === false ? styles.selected : ""}`}>
                <input
                  type="radio"
                  name="isWithholding"
                  checked={current.isWithholding === false}
                  onChange={() => handleWithholdingChange(false)}
                  className={styles.hiddenRadio}
                />
                <span>공제 없음</span>
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>받은 금액 (실수령액)</label>
            <div className={`${styles.inputBox} ${styles.highlightBox}`}>
              <input
                type="text"
                name="netAmount"
                className={`${styles.input} ${styles.boldInput}`}
                value={current.netAmount ? `${Number(current.netAmount).toLocaleString()}원` : "0원"}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={(e) => handleKeyDown(e, "netAmount")}
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>공제 전 금액</label>
              <div className={`${styles.inputBox} ${styles.highlightBox} ${styles.subCalcBox}`}>
                <input
                  type="text"
                  name="grossAmount"
                  className={`${styles.input} ${styles.boldInput}`}
                  value={current.grossAmount ? `${Number(current.grossAmount).toLocaleString()}원` : "0원"}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "grossAmount")}
                />
              </div>
            </div>
            <div className={styles.col}>
              <label className={styles.label}>원천징수 세액</label>
              <div className={`${styles.inputBox} ${styles.highlightBox} ${styles.subCalcBox}`}>
                <input
                  type="text"
                  name="taxAmount"
                  className={`${styles.input} ${styles.boldInput}`}
                  value={current.taxAmount ? `${Number(current.taxAmount).toLocaleString()}원` : "0원"}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "taxAmount")}
                  readOnly={!current.isWithholding}
                />
              </div>
            </div>
          </div>
          <p className={styles.calcNotice}>
            받은 금액이나 공제 여부를 바꾸면 나머지 금액이 자동으로 다시 계산돼요. 직접 수정도 가능해요.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>수입 항목</label>
            <div className={styles.selectWrapper}>
              <EditDropdown
                placeholder="수입 항목 선택"
                items={categoryItems}
                selectedValue={current.category}
                onSelect={(val) => handleDropdownChange("category", val)}
              />
            </div>
            <span className={styles.helperText}>매출 · 기타(수입) 중 선택</span>
          </div>
          <div className={styles.aiReasonBox}>
            <div className={styles.aiReasonHeader}>
              <img src={AnalysisReason} alt="ai reason" />
              <span className={styles.aiReasonTitle}>AI 판단 이유</span>
            </div>
            <p className={styles.aiReasonText}>{current.reason}</p>
          </div>
        </div>
        <div className={styles.footerNotice}>
          <img src={AnalysisWarning2} alt="notice" />
          <span>저장하면 올해 누적 수입과 도달율에 합산돼요.</span>
        </div>
      </main>
      <div className={styles.bottomNav}>
        <button 
          className={styles.navBtn} 
          disabled={currentIndex === 0} 
          onClick={() => setCurrentIndex(prev => prev - 1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke={currentIndex === 0 ? "#D4D4D8" : "#111"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button className={styles.saveBtn} onClick={handleSaveAll}>
          {results.length}건 저장하기
        </button>

        <button 
          className={styles.navBtn} 
          disabled={currentIndex === results.length - 1} 
          onClick={() => setCurrentIndex(prev => prev + 1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke={currentIndex === results.length - 1 ? "#D4D4D8" : "#111"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AnalysisResult_In;
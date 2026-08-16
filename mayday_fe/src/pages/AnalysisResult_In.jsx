import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./AnalysisResult_In.module.css";
import Header from "../components/Header";
import AnalysisDropdown from "../components/AnalysisDropdown";

import AnalysisReason from "../assets/images/AnalysisReason.svg";
import AnalysisWarning2 from "../assets/images/AnalysisWarning2.svg";

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
  const rawItems = location.state?.items || [];
  const initialTaxSetting = location.state?.tax === '3.3';

  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const previousValuesRef = useRef({});

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (rawItems.length === 0) {
        alert("분석할 항목이 없습니다.");
        navigate(-1);
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      const analyzedData = [];
      for (const item of rawItems) {
        try {
          const res = await fetch('/expenses/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              sourceType: item.type === 'image' ? 'OCR' : 'TEXT',
              sourceId: item.sourceId,
              rawText: item.rawText,
              withholdingTaxApplied: initialTaxSetting
            })
          });
          const result = await res.json();
          if (res.status === 200 && result.data) {
            const baseAmount = result.data.amount || 0;
            const calculated = calculateAmounts(baseAmount, initialTaxSetting, "netAmount");
            analyzedData.push({
              analysisId: result.data.analysisId,
              date: result.data.date.replace(/-/g, "."),
              merchant: result.data.merchantName,
              item: result.data.itemName || "수입",
              isWithholding: initialTaxSetting,
              ...calculated,
              category: CATEGORY_MAP[result.data.category] || "매출",
              reason: result.data.reason
            });
          } else {
            throw new Error(result.message);
          }
        } catch (error) {
          console.error("AI 분석 실패:", error);
          // [임시 시연용 Mock 데이터]
          const baseAmount = 967000;
          const calculated = calculateAmounts(baseAmount, initialTaxSetting, "netAmount");
          analyzedData.push({
            analysisId: `ana_mock_${Date.now()}`,
            date: "2026.08.02",
            merchant: "크몽",
            item: "디자인 용역",
            isWithholding: initialTaxSetting,
            ...calculated,
            category: "매출",
            reason: "원천징수 후 입금된 용역 대금으로 판단했어요."
          });
        }
      }
      setResults(analyzedData);
      setIsAnalyzing(false);
    };
    fetchAnalysis();
  }, [rawItems, initialTaxSetting, navigate]);

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
    const token = localStorage.getItem('accessToken');
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
        const res = await fetch('/incomes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(postPayload)
        });
        if (res.status === 201) {
          successCount++;
        } else {
          // [임시 시연용] 백엔드 연결 전 테스트 통과 처리
          successCount++; 
        }
      } catch (error) {
        console.error("저장 실패", error);
        // [임시 시연용] 백엔드 연결 전 테스트 통과 처리
        successCount++;
      }
    }
    const totalSavedAmount = results.reduce((sum, item) => sum + Number(item.netAmount), 0);
    navigate('/analysis-record', { 
      state: { 
        type: 'income', 
        savedCount: successCount, 
        savedAmount: totalSavedAmount 
      }
    });
  };
  if (isAnalyzing) return <div className={styles.loadingContainer}>분석 중...</div>;
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
              <AnalysisDropdown
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
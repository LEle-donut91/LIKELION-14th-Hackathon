import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./AnalysisResult_Ex.module.css";
import Header from "../components/Header";
import AnalysisDropdown from "../components/AnalysisDropdown";

import AnalysisWarning from "../assets/images/AnalysisWarning.svg"
import AnalysisWarning2 from "../assets/images/AnalysisWarning2.svg"
import AnalysisReason from "../assets/images/AnalysisReason.svg";

import axiosInstance from '../api/axiosInstance';

const EVIDENCE_TYPE_MAP = {
  TAX_INVOICE: "세금계산서",
  INVOICE: "계산서",
  CARD_RECEIPT: "신용카드 매출전표",
  CASH_RECEIPT: "현금영수증",
  NON_QUALIFIED: "해당 없음",
};
const CATEGORY_MAP = {
  TAXES_AND_DUES: "제세공과금",
  RENT: "임차료",
  BUSINESS_PROMOTION_EXPENSE: "기업업무추진비",
  VEHICLE_MAINTENANCE: "차량유지비",
  SERVICE_FEES: "지급수수료",
  SUPPLIES: "소모품비",
  DELIVERY_EXPENSE: "운반비",
  ADVERTISING_EXPENSE: "광고선전비",
  TRAVEL_AND_TRANSPORTATION: "여비교통비",
  OTHER_EXPENSE: "기타(비용)",
};

const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};
const categoryItems = Object.values(CATEGORY_MAP);
const evidenceItems = Object.values(EVIDENCE_TYPE_MAP);

function AnalysisResult_Ex() {
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
    const formattedData = rawAnalyzedData.map(data => ({
      analysisId: data.analysisId,
      date: data.date.replace(/-/g, "."),
      merchant: data.merchantName,
      item: data.itemName,
      amount: String(data.amount),
      proofType: EVIDENCE_TYPE_MAP[data.evidenceType] || "해당 없음",
      category: CATEGORY_MAP[data.category] || "기타(비용)",
      qualifiedEvidence: data.qualifiedEvidence,
      reason: data.reason
    }));
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

    if (name === "amount") {
      updated[currentIndex].amount = value.replace(/[^0-9]/g, "");
    } else if (name === "date") {
      let onlyNumbers = value.replace(/[^0-9]/g, "");
      if (onlyNumbers.length > 8) {
        onlyNumbers = onlyNumbers.slice(0, 8);
      }
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

  const handleDropdownChange = (name, value) => {
    const updated = [...results];
    updated[currentIndex][name] = value;
    setResults(updated);
  };

  const handleQualifiedChange = (value) => {
    const updated = [...results];
    updated[currentIndex].qualifiedEvidence = value;
    setResults(updated);
  };

  const handleSaveAll = async () => {
    let successCount = 0;

    for (const current of results) {
      if (!current.merchant.trim() || !current.date.trim() || !current.amount.trim() || !current.item.trim()) {
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
      const cleanAmount = Number(current.amount);
      const patchPayload = {
        analysisId: current.analysisId,
        date: current.date.replace(/\./g, "-"),
        merchantName: current.merchant,
        itemName: current.item,
        amount: cleanAmount,
        category: getKeyByValue(CATEGORY_MAP, current.category),
        evidenceType: getKeyByValue(EVIDENCE_TYPE_MAP, current.proofType),
        qualifiedEvidence: current.qualifiedEvidence,
        remark: null,
      };

      try {
        const res = await axiosInstance.post('/expenses', patchPayload);
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
    const totalSavedAmount = successCount > 0 ? results.reduce((sum, item) => sum + Number(item.amount), 0) : 0;    
    navigate('/analysis-record', { 
      state: { 
        type: 'expense', 
        savedCount: successCount, 
        savedAmount: totalSavedAmount 
      }
    });
  };

  const renderWarningBox = (current) => {
    const numAmount = Number(current.amount) || 0;
    const isQual = current.qualifiedEvidence;
    let title = "";
    let desc = "";

    if (!isQual && numAmount <= 1000000) {
      title = "부적격 증빙 안내";
      desc = "적격증빙에 해당하지 않아요. 장부에는 그대로 기록돼요.\n지출 사실이 확인되면 경비로 인정받을 수 있지만, 3만 원을 초과한 거래는 추후 지출 증명이 필요할 수 있으니 내역을 보관해 두세요.";
    } else if (isQual && numAmount > 1000000) {
      title = "고액 지출 안내";
      desc = "금액이 큰 지출은 여러 해에 나누어 처리(감가상각)해야 할 수 있어요.";
    } else if (!isQual && numAmount > 1000000) {
      title = "부적격 및 고액 지출 안내";
      desc = "적격증빙에 해당하지 않아요. 장부에는 그대로 기록돼요.\n금액이 큰 지출은 여러 해에 나누어 처리(감가상각)해야 할 수 있어요.";
    } else {
      return null;
    }

    return (
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <img src={AnalysisWarning} />
          <span className={styles.warningTitle}>{title}</span>
        </div>
        <p className={styles.warningDesc}>{desc}</p>
      </div>
    );
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
          <div className={styles.inputGroup}>
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
          <div className={styles.rowGroup}>
            <div className={styles.halfInputGroup}>
              <label className={styles.label}>날짜</label>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  name="date"
                  className={styles.input}
                  value={current.date}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
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
                  value={current.amount ? `${Number(current.amount).toLocaleString()}원` : "0원"}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>거래내용</label>
            <div className={styles.inputBox}>
              <input
                type="text"
                name="item"
                className={styles.input}
                value={current.item}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>증빙 유형</label>
            <div className={styles.selectWrapper}>
              <AnalysisDropdown
                items={evidenceItems}
                selectedValue={current.proofType}
                onSelect={(val) => handleDropdownChange("proofType", val)}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>경비 항목</label>
            <div className={styles.selectWrapper}>
              <AnalysisDropdown
                items={categoryItems}
                selectedValue={current.category}
                onSelect={(val) => handleDropdownChange("category", val)}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>적격 여부</label>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioBtn} ${current.qualifiedEvidence === true ? styles.selected : ""}`}>
                <input
                  type="radio"
                  name="qualifiedEvidence"
                  checked={current.qualifiedEvidence === true}
                  onChange={() => handleQualifiedChange(true)}
                  className={styles.hiddenRadio}
                />
                <span>적격</span>
              </label>
              <label className={`${styles.radioBtn} ${current.qualifiedEvidence === false ? styles.selected : ""}`}>
                <input
                  type="radio"
                  name="qualifiedEvidence"
                  checked={current.qualifiedEvidence === false}
                  onChange={() => handleQualifiedChange(false)}
                  className={styles.hiddenRadio}
                />
                <span>부적격</span>
              </label>
            </div>
          </div>
          <div className={styles.aiReasonBox}>
            <div className={styles.aiReasonHeader}>
              <img src={AnalysisReason} />
              <span className={styles.aiReasonTitle}>AI 판단 이유</span>
            </div>
            <p className={styles.aiReasonText}>{current.reason}</p>
          </div>
          {renderWarningBox(current)}
        </div>
        <div className={styles.footerNotice}>
          <img src={AnalysisWarning2} />
          <span>종합소득세 신고 전, 반드시 세무 전문가와 확인해 보세요.</span>
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

export default AnalysisResult_Ex;
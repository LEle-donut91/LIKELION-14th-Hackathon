import React from "react";
import styles from "./HistoryUnChecked.module.css";

/**
 * 체크 안 된 상태 전용 컴포넌트
 */
function HistoryUnChecked({ className = "" }) {
  return <div className={`${styles.box} ${className}`} />;
}

export default HistoryUnChecked;

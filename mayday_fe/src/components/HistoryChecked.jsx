import React from "react";
import styles from "./HistoryChecked.module.css";

/**
 * 체크된 상태 전용 컴포넌트
 * @param {"square" | "circle"} [type="square"] - 모양 ("square": 사각형, "circle": 원형)
 */

function HistoryChecked({ type = "square" }) {
  if (type === "circle") {
    return (
      <div className={`${styles.checkCircle}`}>
        <div className={styles.circleCheckMark} />
      </div>
    );
  }

  return (
    <div className={`${styles.checkSquare}`}>
      <div className={styles.squareCheckMark} />
    </div>
  );
}

export default HistoryChecked;

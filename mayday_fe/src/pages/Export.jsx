import { useState } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import styles from "./Export.module.css";
import ExportModal from "../components/ExportModal";
import headerIcon from "../assets/images/HeaderIcon.svg";
import Header from "../components/Header";
import HistoryChecked from "../components/HistoryChecked";
import HistoryUnChecked from "../components/HistoryUnChecked";
import Button from "../components/Button";

// mock 데이터 가져오기
import { EXPORT_SUMMARY, mockExportPreviewData } from "../api/export-mock-data";

// 1. 증빙 유형 한글 매핑 딕셔너리
const EVIDENCE_TYPE_MAP = {
  TAX_INVOICE: "세금계산서",
  INVOICE: "계산서",
  CARD_RECEIPT: "신용카드전표",
  CASH_RECEIPT: "현금영수증",
  NON_QUALIFIED: "간이영수증",
};

// 2. 경비/수입 계정과목 한글 매핑 딕셔너리
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
  SALES: "매출",
  OTHER_INCOME: "기타(수입)",
};

// 사용자가 선택한 옵션에 맞춰 데이터 필터링
function getFilteredPreviewData(rawData, filterState) {
  const { isQualifiedGroupChecked, isEvidenceChecked, qualifiedOptions } =
    filterState;

  const headers = ["일자", "계정과목", "거래내용", "거래처", "수입", "비용"];
  if (isQualifiedGroupChecked) headers.push("적격 여부");
  if (isEvidenceChecked) headers.push("증빙 유형");
  if (isQualifiedGroupChecked && qualifiedOptions.remark) headers.push("비고");

  let filteredRows = rawData || [];

  // 적격/부적격 필터링 (qualifiedEvidence 기준)
  if (isQualifiedGroupChecked) {
    const { qualified, unqualified } = qualifiedOptions;
    if (qualified && !unqualified) {
      filteredRows = rawData.filter((row) => row.qualifiedEvidence === true);
    } else if (!qualified && unqualified) {
      filteredRows = rawData.filter((row) => row.qualifiedEvidence === false);
    }
  }

  // 데이터 매핑 및 매핑 딕셔너리 적용
  const formattedRows = filteredRows.map((item) => {
    const dateObj = new Date(item.date);
    const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

    // 계정과목 매핑
    const account = CATEGORY_MAP[item.category] || "-";

    // 수입 / 지출 금액 분리 및 콤마 포맷팅
    const formattedAmount = item.amount
      ? item.amount.toLocaleString("ko-KR")
      : "";
    const income = item.type === "INCOME" ? formattedAmount : "";
    const expense = item.type === "EXPENSE" ? formattedAmount : "";

    return {
      ...item,
      date: formattedDate,
      account,
      content: item.itemName,
      client: item.merchantName,
      income,
      expense,
      qualified: item.qualifiedEvidence,
      evidence: EVIDENCE_TYPE_MAP[item.evidenceType] || item.evidenceType,
    };
  });

  const totalCount = formattedRows.length;
  const topRecordsCount = totalCount < 4 ? totalCount : 4;

  const checkedLabels = [];
  if (isQualifiedGroupChecked) checkedLabels.push("적격 여부");
  if (isEvidenceChecked) checkedLabels.push("증빙 유형");
  if (isQualifiedGroupChecked && qualifiedOptions.remark)
    checkedLabels.push("비고");

  const noticeText =
    checkedLabels.length > 0
      ? `체크한 항목(${checkedLabels.join(" · ")})이 모두 열로 포함된 상태예요. 파일도 같은 구성으로 저장돼요.`
      : "기본 항목이 열로 포함된 상태예요. 파일도 같은 구성으로 저장돼요.";

  return {
    headers,
    filteredRows: formattedRows,
    summary: {
      totalCount,
      topRecordsCount,
    },
    noticeText,
  };
}

function Export() {
  // 2. location에서 state 추출
  const location = useLocation();
  const selectedYear = location.state?.selectedYear;

  // 1. 상태 정의
  // (1) 상위 항목 체크 상태
  const [isQualifiedGroupChecked, setIsQualifiedGroupChecked] = useState(false);
  const [isEvidenceChecked, setIsEvidenceChecked] = useState(false);

  // (2) 적격 여부 하위 항목 체크 상태
  const [qualifiedOptions, setQualifiedOptions] = useState({
    qualified: false,
    unqualified: false,
    remark: false,
  });

  // (3) 파일 형식 선택 상태 ("xlsx" | "csv")
  const [fileFormat, setFileFormat] = useState("xlsx");

  // (4) 미리보기 모달 열림/닫힘 상태 추가
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 2. 필터링 및 건수 재계산 함수 호출
  const { headers, filteredRows, summary, noticeText } = getFilteredPreviewData(
    mockExportPreviewData,
    { isQualifiedGroupChecked, isEvidenceChecked, qualifiedOptions },
  );

  const previewSummary = `${headers.length}개 열 · 상위 ${summary.topRecordsCount}건 · 전체 ${summary.totalCount}건`;

  // 3. 이벤트 핸들러
  const handleToggleQualifiedGroup = () => {
    setIsQualifiedGroupChecked((prev) => !prev);
  };

  // '증빙 유형' 토글
  const handleToggleEvidence = () => {
    setIsEvidenceChecked((prev) => !prev);
  };

  // 하위 항목 토글
  const handleToggleSubOption = (key) => {
    setQualifiedOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // "파일 다운로드" 버튼 클릭 이벤트 핸들러
  const handleDownload = () => {
    if (filteredRows.length === 0) {
      alert("다운로드할 기록이 없습니다.");
      return;
    }

    const excelData = filteredRows.map((row) => {
      const rowData = [
        row.date,
        row.account,
        row.content,
        row.client,
        row.income || "",
        row.expense || "",
      ];

      if (isQualifiedGroupChecked) {
        rowData.push(row.qualifiedEvidence ? "적격" : "부적격");
      }
      if (isEvidenceChecked) {
        rowData.push(row.evidence);
      }
      if (isQualifiedGroupChecked && qualifiedOptions.remark) {
        rowData.push(row.remark || "");
      }

      return rowData;
    });

    // 헤더 행을 최상단에 포함
    const worksheetData = [headers, ...excelData];

    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "내보내기_기록");

    const fileName = `장부내보내기_${EXPORT_SUMMARY.exportYear}.${fileFormat}`;

    if (fileFormat === "xlsx") {
      // 엑셀 파일 다운로드
      XLSX.writeFile(workbook, fileName);
    } else if (fileFormat === "csv") {
      // CSV 파일 다운로드 (한글 깨짐 방지 UTF-8 BOM 처리)
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob(["\uFEFF" + csvOutput], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={styles.card}>
      {/* 헤더 영역 */}
      <div className={styles.header}>
        <Header text="내보내기" />
      </div>

      <main className={styles.content}>
        {/* 요약 정보 카드 */}
        <section className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span>내보낼 기록</span>
            <strong>{EXPORT_SUMMARY.exportYear}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>기록 수</span>
            <strong>{EXPORT_SUMMARY.totalRecordsCount}건</strong>
          </div>
          <div className={`${styles.summaryRow} ${styles.dividerRow}`}>
            <span>수입</span>
            <strong>{EXPORT_SUMMARY.totalIncome}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>지출</span>
            <strong>{EXPORT_SUMMARY.totalExpense}</strong>
          </div>
        </section>

        {/* 내보낼 항목 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>함께 내보낼 항목</h2>
          <div className={styles.optionsBox}>
            {/* 상위: 적격 여부 */}
            <label className={styles.optionHeader}>
              <input
                type="checkbox"
                className={styles.visuallyHidden}
                checked={isQualifiedGroupChecked}
                onChange={handleToggleQualifiedGroup}
              />
              {isQualifiedGroupChecked ? (
                <HistoryChecked type="square" />
              ) : (
                <HistoryUnChecked />
              )}
              <strong className={styles.optionTitle}>적격 여부</strong>
              <span className={styles.optionSubtext}>
                간편장부 서식 외 항목
              </span>
            </label>

            {/* 하위 항목 목록 */}
            {isQualifiedGroupChecked && (
              <ul className={styles.subOptionList}>
                <li>
                  <label className={styles.subOptionItem}>
                    <input
                      type="checkbox"
                      className={styles.visuallyHidden}
                      checked={qualifiedOptions.qualified}
                      onChange={() => handleToggleSubOption("qualified")}
                    />
                    <span className={styles.subCheckboxWrapper}>
                      {qualifiedOptions.qualified ? (
                        <HistoryChecked type="square" />
                      ) : (
                        <HistoryUnChecked />
                      )}
                    </span>
                    <span>적격</span>
                  </label>
                </li>

                <li>
                  <label className={styles.subOptionItem}>
                    <input
                      type="checkbox"
                      className={styles.visuallyHidden}
                      checked={qualifiedOptions.unqualified}
                      onChange={() => handleToggleSubOption("unqualified")}
                    />
                    <span className={styles.subCheckboxWrapper}>
                      {qualifiedOptions.unqualified ? (
                        <HistoryChecked type="square" />
                      ) : (
                        <HistoryUnChecked />
                      )}
                    </span>
                    <span>부적격</span>
                  </label>
                </li>

                <li>
                  <label className={styles.subOptionItem}>
                    <input
                      type="checkbox"
                      className={styles.visuallyHidden}
                      checked={qualifiedOptions.remark}
                      onChange={() => handleToggleSubOption("remark")}
                    />
                    <span className={styles.subCheckboxWrapper}>
                      {qualifiedOptions.remark ? (
                        <HistoryChecked type="square" />
                      ) : (
                        <HistoryUnChecked />
                      )}
                    </span>
                    <span className={styles.itemLabel}>비고</span>
                    <span className={styles.itemDescription}>
                      증빙불비 · 감가상각 검토 분류
                    </span>
                  </label>
                </li>
              </ul>
            )}

            {/* 상위: 증빙 유형 */}
            <label className={`${styles.optionHeader} ${styles.dividerTop}`}>
              <input
                type="checkbox"
                className={styles.visuallyHidden}
                checked={isEvidenceChecked}
                onChange={handleToggleEvidence}
              />
              {isEvidenceChecked ? (
                <HistoryChecked type="square" />
              ) : (
                <HistoryUnChecked />
              )}
              <strong className={styles.optionTitle}>증빙 유형</strong>
              <span className={styles.optionSubtext}>
                간편장부 서식 외 항목
              </span>
            </label>
          </div>
          <p className={styles.noticeText}>
            체크를 해제하면 하위 항목도 함께 빠져요
          </p>
        </section>

        {/* 미리보기 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>미리보기</h2>
          <button
            type="button"
            className={styles.previewButton}
            onClick={() => setIsPreviewOpen(true)}
          >
            <div>
              <strong className={styles.previewTitle}>표로 미리보기</strong>
              <div className={styles.previewSummary}>{previewSummary}</div>
            </div>
            <span className={styles.arrowIcon} />
          </button>
          <p className={styles.noticeText}>
            체크한 항목이 열로 반영돼요 · 좌우로 밀어 전체 열 확인
          </p>
        </section>

        {/* 파일 형식 섹션 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>파일 형식</h2>
          <div className={styles.formatGroup}>
            <button
              className={`${styles.formatCard} ${
                fileFormat === "xlsx" ? styles.activeFormat : ""
              }`}
              onClick={() => setFileFormat("xlsx")}
            >
              {fileFormat === "xlsx" ? (
                <strong>엑셀 (.xlsx)</strong>
              ) : (
                <span className={styles.formatTitle}>엑셀 (.xlsx)</span>
              )}
              <span className={styles.subText}>신고 준비에 추천</span>
            </button>

            {/* CSV 카드 */}
            <button
              className={`${styles.formatCard} ${
                fileFormat === "csv" ? styles.activeFormat : ""
              }`}
              onClick={() => setFileFormat("csv")}
            >
              {fileFormat === "csv" ? (
                <strong>CSV (.csv)</strong>
              ) : (
                <span className={styles.formatTitle}>CSV (.csv)</span>
              )}
              <span className={styles.subText}>범용 형식</span>
            </button>
          </div>
        </section>

        {/* 하단 안내 및 다운로드 버튼 */}
        <footer className={styles.footer}>
          <p className={styles.footerNotice}>
            파일은 미리보기와 같은 구성으로 저장돼요
            <br />
            홈택스 자동 제출은 제공하지 않아요
          </p>
          <Button text="파일 다운로드" onClick={handleDownload} />
        </footer>
      </main>

      {/* 미리보기 모달 */}
      <ExportModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        summary={summary}
        headers={headers}
        rows={filteredRows}
        noticeText={noticeText}
        options={{
          isQualifiedGroupChecked,
          isEvidenceChecked,
          hasRemark: qualifiedOptions.remark,
        }}
      />
    </div>
  );
}

export default Export;

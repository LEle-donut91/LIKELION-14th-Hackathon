import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import styles from "./Export.module.css";
import ExportModal from "../components/ExportModal";
import headerIcon from "../assets/images/HeaderIcon.svg";
import Header from "../components/Header";
import Button from "../components/Button";
import { getExportPreview } from "../api/exportApi";
import HistorySquareCheckedIcon from "../assets/images/HistorySquareCheckedIcon.svg";
import HistoryUnCheckedIcon from "../assets/images/HistoryUnCheckedIcon.svg";

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

    if (!qualified && !unqualified) {
      // 1. "적격 여부"만 체크 -> 적격 지출 + 부적격 지출 + 모든 수입
      filteredRows = rawData;
    } else if (qualified && !unqualified) {
      // 2. "적격"만 체크 -> 적격 지출
      filteredRows = rawData.filter(
        (row) => row.type === "EXPENSE" && row.qualifiedEvidence === true
      );
    } else if (!qualified && unqualified) {
      // 3. "부적격"만 체크 -> 부적격 지출
      filteredRows = rawData.filter(
        (row) => row.type === "EXPENSE" && row.qualifiedEvidence === false
      );
    } else if (qualified && unqualified) {
      // 4. "적격" + "부적격" 둘 다 체크 -> 적격 지출 + 부적격 지출
      filteredRows = rawData.filter((row) => row.type === "EXPENSE");
    }
  }

  // 데이터 매핑 및 매핑 딕셔너리 적용
  const formattedRows = filteredRows.map((item) => {
    const dateObj = new Date(item.date);
    const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

    // 계정과목 매핑
    const account = CATEGORY_MAP[item.category] || "-";

    // 수입 / 지출 금액 분리 및 콤마 포맷팅
    const incomeVal = item.income || (item.type === "INCOME" ? item.amount : 0);
    const expenseVal =
      item.expense || (item.type === "EXPENSE" ? item.amount : 0);

    const income = incomeVal ? Number(incomeVal).toLocaleString("ko-KR") : "";
    const expense = expenseVal
      ? Number(expenseVal).toLocaleString("ko-KR")
      : "";

    // 수입이면 isIncome이 true (지출이면 false)
    const isIncome = item.type === "INCOME";

    // 적격 여부 (수입이면 "—"로 설정)
    const qualified = isIncome
      ? "—"
      : item.qualifiedEvidence
      ? "적격"
      : "부적격";

    // 증빙 유형 (수입이면 "—"로 설정)
    const evidence = isIncome
      ? "—"
      : EVIDENCE_TYPE_MAP[item.evidenceType] || item.evidenceType || "—";

    // 비고 (수입이면 "—"로 설정)
    const remark = isIncome ? "—" : item.remark || "";

    return {
      ...item,
      date: formattedDate,
      account,
      content: item.itemName,
      client: item.merchantName,
      income,
      expense,
      qualified,
      evidence,
      remark,
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
  const navigate = useNavigate();

  // API 요청 여부 플래그 (API 요청 중복 실행 방지용)
  const isFetchedRef = useRef(false);

  // 2. location에서 state 추출
  const location = useLocation();
  const targetYear = location.state?.selectedYear;

  // 서버 API 데이터 상태
  const [exportSummary, setExportSummary] = useState({
    exportYear: targetYear,
    totalRecordsCount: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const [rawPreviewItems, setRawPreviewItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  // 서버 API 데이터 조회
  useEffect(() => {
    if (isFetchedRef.current) return; // 이미 요청을 보냈다면 API 호출 자체를 하지 않고 중단

    isFetchedRef.current = true; // API 요청 여부 플래그를 true로 설정 (API 요청 완료)

    const fetchExportData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await getExportPreview(targetYear);
        if (response.status === 200 && response.data) {
          const { summary, items } = response.data;

          // 전체 기록 건수가 0이면 즉시 "내보낼 기록이 없습니다." alert 후 이전 페이지로 이동
          if (summary?.totalRecordsCount === 0) {
              alert("내보낼 기록이 없습니다.");
              navigate(-1);
          }

          setExportSummary(summary);
          setRawPreviewItems(items || []);
        }
      } catch (error) {
        // API 명세서 400 에러 메시지 표출
        console.error("내보내기 데이터 조회 실패:", error);
        setErrorMessage(error.message || "내보내기 조건이 올바르지 않습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExportData();
  }, [targetYear, navigate]);

  // 2. 필터링 및 건수 재계산 함수 호출
  const { headers, filteredRows, summary, noticeText } = getFilteredPreviewData(
    rawPreviewItems,
    { isQualifiedGroupChecked, isEvidenceChecked, qualifiedOptions },
  );

  const previewSummary = isLoading
    ? "로딩중..."
    : `${headers.length}개 열 · 상위 ${summary.topRecordsCount}건 · 전체 ${summary.totalCount}건`;

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
    if (isLoading) {
      alert("데이터를 불러오는 중입니다.");
      return;
    }

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
        rowData.push(row.qualified);
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

    const fileName = `장부내보내기_${exportSummary.exportYear}.${fileFormat}`;

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
    <div className={styles.export}>
      <Header text="내보내기" />

      <main className={styles.content}>

        {/* 요약 정보 카드 */}
        <section className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span>내보낼 기록</span>
            <strong>
              {isLoading
                ? "로딩중..."
                : `${exportSummary.exportYear || targetYear || ""}년`}
            </strong>
          </div>
          <div className={styles.summaryRow}>
            <span>기록 수</span>
            <strong>
              {isLoading ? "로딩중..." : `${exportSummary.totalRecordsCount}건`}
            </strong>
          </div>
          <div className={`${styles.incomeRow} ${styles.dividerRow}`}>
            <span>수입</span>
            <strong>
              {isLoading
                ? "로딩중..."
                : `${exportSummary.totalIncome?.toLocaleString("ko-KR")}원`}
            </strong>
          </div>
          <div className={styles.summaryRow}>
            <span>지출</span>
            <strong>
              {isLoading
                ? "로딩중..."
                : `${exportSummary.totalExpense?.toLocaleString("ko-KR")}원`}
            </strong>
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
                disabled={isLoading}
              />
              {isQualifiedGroupChecked ? (
                <img src={HistorySquareCheckedIcon} />
              ) : (
                <img src={HistoryUnCheckedIcon} />
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
                      disabled={isLoading}
                    />
                    <span className={styles.subCheckboxWrapper}>
                      {qualifiedOptions.qualified ? (
                        <img src={HistorySquareCheckedIcon} />
                      ) : (
                        <img src={HistoryUnCheckedIcon} />
                      )}
                    </span>
                    <span>적격</span>
                    <span className={styles.itemDescription}>
                      지출 적격만 분류
                    </span>
                  </label>
                </li>

                <li>
                  <label className={styles.subOptionItem}>
                    <input
                      type="checkbox"
                      className={styles.visuallyHidden}
                      checked={qualifiedOptions.unqualified}
                      onChange={() => handleToggleSubOption("unqualified")}
                      disabled={isLoading}
                    />
                    <span className={styles.subCheckboxWrapper}>
                      {qualifiedOptions.unqualified ? (
                        <img src={HistorySquareCheckedIcon} />
                      ) : (
                        <img src={HistoryUnCheckedIcon} />
                      )}
                    </span>
                    <span>부적격</span>
                    <span className={styles.itemDescription}>
                      지출 부적격만 분류
                    </span>
                  </label>
                </li>

                <li>
                  <label className={styles.subOptionItem}>
                    <input
                      type="checkbox"
                      className={styles.visuallyHidden}
                      checked={qualifiedOptions.remark}
                      onChange={() => handleToggleSubOption("remark")}
                      disabled={isLoading}
                    />
                    <span className={styles.subCheckboxWrapper}>
                      {qualifiedOptions.remark ? (
                        <img src={HistorySquareCheckedIcon} />
                      ) : (
                        <img src={HistoryUnCheckedIcon} />
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
                disabled={isLoading}
              />
              {isEvidenceChecked ? (
                <img src={HistorySquareCheckedIcon} />
              ) : (
                <img src={HistoryUnCheckedIcon} />
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
            disabled={isLoading}
          >
            <div>
              <strong className={styles.previewTitle}>표로 미리보기</strong>
              <div className={styles.previewSummary}>{previewSummary}</div>
            </div>
            <span className={styles.arrowIcon} />
          </button>
        </section>

        {/* 파일 형식 섹션 */}
        <section className={styles.sectionFile}>
          <h2 className={styles.sectionTitle}>파일 형식</h2>
          <div className={styles.formatGroup}>
            <button
              className={`${styles.formatCard} ${
                fileFormat === "xlsx" ? styles.activeFormat : ""
              }`}
              onClick={() => setFileFormat("xlsx")}
              disabled={isLoading}
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
              disabled={isLoading}
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
        <p className={styles.footerNotice}>
          파일은 미리보기와 같은 구성으로 저장돼요
          <br />
          홈택스 자동 제출은 제공하지 않아요
        </p>
      </main>
      {/* 하단 안내 및 다운로드 버튼 */}
      <footer className={styles.footer}>
        <Button text="파일 다운로드" onClick={handleDownload} />
      </footer>

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

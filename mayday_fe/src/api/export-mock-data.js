// 내보내기 요약 정보
export const EXPORT_SUMMARY = {
  exportYear: "2026년", // 내보낼 기록 (사용자가 선택한 연도)
  totalRecordsCount: 156, // 기록 수 (156건)
  totalIncome: "21,340,000원", // 수입 (21,340,000원)
  totalExpense: "4,326,400원", // 지출 (4,326,400원)
};

// 사용자가 선택한 연도에 해당하는 모든 데이터를 불러옴
export const mockExportPreviewData = [
  {
    analysisId: "ana_001", // 데이터 ID
    type: "EXPENSE", // 수입(INCOME)인지 지출(EXPENSE)인지
    date: "2026-08-04", // 일자
    merchantName: "쿠팡", // 거래처
    itemName: "사무용품", // 거래내용
    amount: 34900, // 금액
    category: "SUPPLIES", // 계정과목
    evidenceType: "CARD_RECEIPT", // 증빙 유형
    qualifiedEvidence: true, // 적격 여부 (적격 or 부적격)
    remark: "", // 비고
  },
  {
    analysisId: "ana_002",
    type: "EXPENSE",
    date: "2026-08-03",
    merchantName: "한정식집",
    itemName: "미팅",
    amount: 84000,
    category: "BUSINESS_PROMOTION_EXPENSE",
    evidenceType: "NON_QUALIFIED",
    qualifiedEvidence: false,
    remark: "증빙불비(가산세 유의)",
  },
  {
    analysisId: "ana_003",
    type: "EXPENSE",
    date: "2026-08-03",
    merchantName: "애플코리아",
    itemName: "맥북 프로 14",
    amount: 2490000,
    category: "SUPPLIES",
    evidenceType: "CARD_RECEIPT",
    qualifiedEvidence: true,
    remark: "감가상각 검토",
  },
  {
    analysisId: "ana_071",
    type: "INCOME",
    date: "2026-08-02",
    merchantName: "크몽",
    itemName: "디자인 용역",
    amount: 967000,
    category: "SALES",
    evidenceType: "CASH_RECEIPT",
    qualifiedEvidence: true,
    remark: "",
  },
];

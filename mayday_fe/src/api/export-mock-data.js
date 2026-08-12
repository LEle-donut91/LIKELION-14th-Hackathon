// 내보내기 요약 정보
export const EXPORT_SUMMARY = {
  exportYear: "2026년",
  totalRecordsCount: 156,
  totalIncome: "21,340,000원",
  totalExpense: "4,326,400원",
};

// 2번 형식(history-mock-data.js)을 참고한 미리보기용 더미 데이터
export const mockExportPreviewData = [
  {
    analysisId: "ana_001",
    type: "EXPENSE",
    date: "2026-08-04",
    merchantName: "쿠팡",
    itemName: "사무용품",
    amount: 34900,
    category: "SUPPLIES",
    evidenceType: "CARD_RECEIPT",
    qualifiedEvidence: true,
    remark: "",
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

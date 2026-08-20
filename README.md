# 🪙 메이데이 (Mayday)

> 프리랜서를 위한 1년 365일 24시 증빙 기록 도구.
5월 종합소득세 신고 직전이 아니라, 지출이 발생하는 그 순간을 기록합니다.
> 

### **배포 링크**

https://mayday-beryl.vercel.app

### **유튜브(시연 영상) 링크**

https://youtu.be/4qhc-XZuLas

## ⚙️ 목차
- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [라우팅](#-라우팅)
- [설치 및 실행](#-설치-및-실행)

---

## 🌟 소개

프리랜서(인적용역 사업자)는 직전연도 사업소득 7,500만 원 미만이면 간편장부 대상이며, 장부 없이 추계로 신고하면 무기장가산세를 부담합니다. 문제는 신고 자체가 아니라 **1년 내내 흩어진 증빙을 장부로 만들지 못한다는 점**입니다.

메이데이는 신고를 대행하지 않습니다. 대신 다음 흐름으로 신고 직전에 필요한 자료가 이미 완성되어 있도록 돕습니다.

1. **기록** — 영수증·결제내역·카드 문자·카톡 등 텍스트/이미지 형태로 입력
2. **분석** — OCR + LLM이 일자·거래처·금액·경비 항목·적격 여부를 판단하고, 판단 이유를 함께 제시
3. **확인** — 사용자가 건별로 검토·수정하고, 승인한 값만 장부에 저장
4. **내보내기** — 간편장부 서식을 엑셀/CSV로 다운로드

## **✨** 주요 기능

| 기능 | 설명 |
| --- | --- |
| **홈** | 5월 종소세 신고 마감 D-day, 올해 정리한 경비, 올해 수입과 비용 |
| **기록하기** | 이미지/텍스트 업로드로 지출·수입 최대 10건 일괄 등록, 3.3% 원천징수 역산 지원 |
| **분석 결과 확인** | OCR 텍스트를 LLM에 전달해 적격증빙 4종(세금계산서·계산서·신용카드 매출전표·현금영수증) 기준으로 자동 분류 |
| **기록 조회** | 기록 내역 확인 (적격 여부, 증빙 유형, 계정과목 필터링) |
| **기록 수정 및 삭제** | 건별 카드에서 항목 수정 후 승인 |
| **내보내기** | 간편장부 서식 엑셀/CSV 다운로드 (미리보기 제공) |
| **마이페이지** | 사용자 정보, 기록 및 금액 집계, 로그아웃 및 회원탈퇴 |

## **🛠️** 기술 스택

- **Framework**: React
- **Style**: CSS Module
- **HTTP Client**: axios
- **Excel 처리**: xlsx
- **Routing**: react-router-dom

## **📁** 프로젝트 구조

```
src/
├── assets/                 # 이미지, 아이콘, 폰트 등 정적 리소스
│   └── images/             # 이미지 파일
├── api/                    # axios 세팅, api 요청 함수
|   ├── axiosInstance.js    # 공통 Axios 인스턴스
|   └── axiosRequests.js    # API 엔드포인트 URL 관리
├── components/             # 페이지를 구성하는 UI 컴포넌트
├── pages/                  # 라우팅되는 페이지 컴포넌트
├── App.jsx                 # 최상위 컴포넌트 및 페이지 라우팅 관리
├── App.module.css          # 최상위 레이아웃 스타일 관리 (가로 너비 등)
├── index.css               # 전역 스타일 관리 (기본 폰트 등)
└── index.js                # React 애플리케이션 진입점
```

## 🔁 라우팅

`App.js`에서 `react-router-dom`으로 페이지를 관리합니다.

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | Onboarding | 온보딩 |
| `/login` | Login | 로그인 |
| `/join` | Join | 회원가입 |
| `/home` | Home | 홈 화면 |
| `/record` | Record | 기록하기 |
| `/loading` | Loading | 로딩 |
| `/analysis-result-ex` | AnalysisResult_Ex | 분석 결과 확인 (지출) |
| `/analysis-result-in` | AnalysisResult_In | 분석 결과 확인 (수입) |
| `/analysis-record` | AnalysisRecord | 분석 결과 저장 완료 |
| `/mypage` | Mypage | 마이페이지 |
| `/history` | History | 기록 조회 |
| `/export` | Export | 내보내기 |
| `/edit_expense/:expenseId` | EditEx | 경비 기록 수정 |
| `/edit_income/:incomeId` | EditIn | 수입 기록 수정 |

---

## **📋 설치 및 실행**

```powershell
git clone https://github.com/Sunyoungs/LIKELION-14th-Hackathon.git
cd LIKELION-14th-Hackathon/mayday_fe

npm install
npm install react-router-dom axios xlsx

npm start
```

`npm start` 실행 시 로컬 개발 서버가 열립니다.

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 입력하세요.

\`\`\ `REACT_APP_API_BASE_URL=https://api.maydayapp.xyz \`\`\`

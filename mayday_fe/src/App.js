import React from 'react';
import { BrowserRouter, Router, Routes, Route } from 'react-router-dom';
import styles from "./App.module.css";

// 컴포넌트 테스트
import NavBar from './components/NavBar';
import Button from './components/Button';
import Header from './components/Header';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Join from './pages/Join';
import Home from './pages/Home';
import Loading from './pages/Loading';
import AnalysisResult_Ex from './pages/AnalysisResult_Ex';
import AnalysisResult_In from './pages/AnalysisResult_In';
import AnalysisRecord from './pages/AnalysisRecord';
import Record from './pages/Record';
import Mypage from './pages/Mypage';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.appWrapper}>
        <div className={styles.appContainer}>
          <div className={styles.contentArea}>
            <Routes>
              <Route path="/" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/join" element={<Join />} />
              <Route path="/home" element={<Home />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/analysis-result-ex" element={<AnalysisResult_Ex />} />
              <Route path="/analysis-result-in" element={<AnalysisResult_In />} />
              <Route path="/analysis-record" element={<AnalysisRecord />} />
              <Route path="/record" element={<Record />} />
              <Route path="/mypage" element={<Mypage />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
import React from 'react';
import { BrowserRouter, Router, Routes, Route } from 'react-router-dom';
import styles from "./App.module.css";

// 컴포넌트 테스트
import NavBar from './components/NavBar';
import Button from './components/Button';
import Header from './components/Header';
import Login from './pages/Login';
import Join from './pages/Join';
import Home from './pages/Home';
import Record from './pages/Record';
import Mypage from './pages/Mypage';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.appContainer}>
        <div className={styles.contentArea}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/home" element={<Home />} />
            <Route path="/record" element={<Record />} />
            <Route path="/mypage" element={<Mypage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
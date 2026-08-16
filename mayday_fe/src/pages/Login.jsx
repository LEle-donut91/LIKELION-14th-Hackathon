import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import Button from '../components/Button';

import loginIcon from '../assets/images/LoginIcon.svg';
import loginError from '../assets/images/Loginerror.svg';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (response.status === 200) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        navigate('/home');
      } else if (response.status === 401) {
        setErrorMessage('이메일 또는 비밀번호가 일치하지 않아요');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      const response = await fetch('/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoKey: "mayday-demo" })
      });
      const result = await response.json();
      if (response.status === 200) {
        localStorage.setItem('accessToken', result.data.accessToken);
        navigate('/home');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.logo}>
          <img src={loginIcon} className={styles.loginIcon} />
        </div>
        <p className={styles.text}>영수증만 올리면 AI가 경비를 정리해요.<br />5월 종합소득세 신고 준비를 미리 끝내세요.</p>
        <div className={styles.inputWrap}>
          <input type="email" placeholder="이메일" className={styles.input} value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" placeholder="비밀번호" className={styles.input} value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        {errorMessage && (
          <div className={styles.errorMes}>
             <img src={loginError} />
             <span>{errorMessage}</span>
          </div>
        )}
        <Button text="로그인" onClick={handleLogin} />
        <div className={styles.btn}>
          <span className={styles.link} style={{ color: '#3F4652' }} onClick={() => navigate('/join')}>회원가입</span>
          <span className={styles.div}>|</span>
          <span className={styles.link} onClick={handleDemoLogin}>심사위원용 데모 로그인</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
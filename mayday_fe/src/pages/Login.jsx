import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import Button from '../components/Button';

import loginIcon from '../assets/images/LoginIcon.svg';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = () => {
    navigate('/home');
  };
  const handleDemoLogin = () => {
    navigate('/home');
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src={loginIcon} className={styles.loginIcon} />
      </div>
      <h1 className={styles.title}>메이데이</h1>
      <p className={styles.text}>영수증만 올리면 AI가 경비를 정리해요.<br />5월 종합소득세 신고 준비를 미리 끝내세요.</p>
      <div className={styles.inputWrap}>
        <input type="email" placeholder="이메일" className={styles.input} value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" placeholder="비밀번호" className={styles.input} value={password} onChange={(e)=>setPassword(e.target.value)} />
      </div>
      <div className={styles.error}>
        이메일 또는 비밀번호가 일치하지 않아요.
      </div>
      <div className={styles.btn}>
        <Button text="로그인" onClick={handleLogin} />
        <Button text="심사위원용 데모 로그인" onClick={handleDemoLogin} style={{ backgroundColor: '#CBCBD0', color: '#ffffff' }} />
      </div>
      <div className={styles.join} onClick={() => navigate('/join')}>회원가입</div>
    </div>
  );
}

export default Login;
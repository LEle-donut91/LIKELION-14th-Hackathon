import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Join.module.css';
import Header from '../components/Header';
import Button from '../components/Button';

import JoinCheck from '../assets/images/JoinCheck.svg';
import JoinunCheck from '../assets/images/JoinunCheck.svg';

import axiosInstance from '../api/axiosInstance';
import axiosRequests from '../api/axiosRequests';

function Join() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordCheckError, setPasswordCheckError] = useState('');

  const [check, setCheck] = useState({ service: false, privacy: false });
  const allCheck = check.service && check.privacy;

  const checkAll = () => {
    const state = !allCheck;
    setCheck({ service: state, privacy: state });
  };

  useEffect(() => {
    const pwdRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
    if (password && !pwdRegex.test(password)) {
      setPasswordError('영문·숫자 포함 8자 이상이어야 합니다.');
    } else {
      setPasswordError('');
    }
    if (passwordCheck && password !== passwordCheck) {
      setPasswordCheckError('비밀번호가 일치하지 않아요');
    } else {
      setPasswordCheckError('');
    }
  }, [password, passwordCheck]);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = email && isValidEmail(email) && password && !passwordError && passwordCheck && !passwordCheckError && allCheck;

  const handleJoin = async () => {
    if (!isFormValid) return;
    try {
      const response = await axiosInstance.post(axiosRequests.signup, {
        email,
        password,
        passwordConfirm: passwordCheck,
        termsAgreed: check.service,
        privacyAgreed: check.privacy,
        evidenceProcessingAgreed: check.privacy
      });
      if (response.status === 201) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        navigate('/login');
      } 
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        setEmailError('이미 가입된 이메일이에요');
      } else if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('통신 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <Header text="회원가입" onClick={() => navigate('/login')}/>
      <div className={styles.content}>
        <p className={styles.text}>계정을 만들면 기록이 연도 단위로<br />안전하게 보관돼요.</p>

        <div className={styles.inputWrap}>
          <input type="email" placeholder="이메일" className={`${styles.input} ${emailError ? styles.inputError : ''}`} value={email} onChange={e => {setEmail(e.target.value); setEmailError('');}} />
          {emailError && <span className={styles.error}>{emailError}</span>}
        </div>
        <div className={styles.inputWrap}>
          <input type="password" placeholder="비밀번호" className={`${styles.input} ${passwordError ? styles.inputError : ''}`} value={password} onChange={e => setPassword(e.target.value)} />
          <span className={styles.guide}>영문·숫자 포함 8자 이상</span>
        </div>
        <div className={styles.inputWrap}>
          <input type="password" placeholder="비밀번호 확인" className={`${styles.input} ${passwordCheckError ? styles.inputError : ''}`} value={passwordCheck} onChange={e => setPasswordCheck(e.target.value)} />
          {passwordCheckError && <span className={styles.error}>{passwordCheckError}</span>}
        </div>

        <div className={styles.check}>
          <div className={`${styles.Item} ${styles.All}`} onClick={checkAll}>
            <img src={allCheck ? JoinCheck : JoinunCheck} alt="전체동의" />
            <span>전체 동의</span>
          </div>
          <div className={`${styles.Item}`} onClick={() => setCheck(prev => ({...prev, service: !prev.service}))}>
            <img src={check.service ? JoinCheck : JoinunCheck} alt="서비스이용약관" />
            <span>[필수] 서비스 이용약관 동의</span>
          </div>
          <div className={`${styles.Item}`} onClick={() => setCheck(prev => ({...prev, privacy: !prev.privacy}))}>
            <img src={check.privacy ? JoinCheck : JoinunCheck} alt="개인정보처리동의" />
            <span>[필수] 개인정보·증빙 처리 동의</span>
          </div>
        </div>
      </div>
      <div className={styles.btn}>
        <Button text="가입하기" onClick={handleJoin} disabled={!isFormValid} style={!isFormValid ? { backgroundColor: '#EBECEF', color: '#ABB0BA' } : {}} />
      </div>
    </div>
  )
}

export default Join;
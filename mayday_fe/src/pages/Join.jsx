import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Join.module.css';
import Header from '../components/Header';
import Button from '../components/Button';

import JoinCheck from '../assets/images/JoinCheck.svg';
import JoinunCheck from '../assets/images/JoinunCheck.svg';

function Join() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');

  const [check, setCheck] = useState({ service: false, privacy: false });
  const allCheck = check.service && check.privacy;
  const checkAll = () => {
    const state = !allCheck;
    setCheck({ service: state, privacy: state });
  };
  const handleJoin = () => {
    navigate('/');
  };
  const isFormValid = email && password && passwordCheck && allCheck;

  return (
    <div className={styles.container}>
      <Header text="회원가입" onClick={(navigate('/'))}/>
      <div className={styles.content}>
        <p className={styles.text}>계정을 만들면 기록이 연도 단위로<br />안전하게 보관돼요.</p>

        <div className={styles.inputWrap}>
          <input type="email" placeholder="이메일" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} />
          <span className={styles.error}>이미 가입된 이메일이에요</span>
        </div>
        <div className={styles.inputWrap}>
          <input type="password" placeholder="비밀번호" className={styles.input} value={password} onChange={e => setPassword(e.target.value)} />
          <span className={styles.guide}>영문·숫자 포함 8자 이상</span>
        </div>
        <div className={styles.inputWrap}>
          <input type="password" placeholder="비밀번호 확인" className={styles.input} value={passwordCheck} onChange={e => setPasswordCheck(e.target.value)} />
          <span className={styles.error}>비밀번호가 일치하지 않아요</span>
        </div>

        <div className={styles.check}>
          <div className={`${styles.Item} ${styles.All}`} onClick={checkAll}>
            <img src={JoinunCheck} />
            <span>전체 동의</span>
          </div>
          <div className={`${styles.Item}`} onClick={() => setCheck(prev => ({...prev, service: !prev.service}))}>
            <img src={JoinunCheck} />
            <span>[필수] 서비스 이용약관 동의</span>
          </div>
          <div className={`${styles.Item}`} onClick={() => setCheck(prev => ({...prev, privacy: !prev.privacy}))}>
            <img src={JoinunCheck} />
            <span>[필수] 개인정보·증빙 처리 동의</span>
          </div>
        </div>
      </div>
      <div className={styles.btn}>
        <Button text="가입하기" onClick={handleJoin} disabled={!isFormValid} style={!isFormValid ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' } : {}} />
      </div>
    </div>
  )
}

export default Join;
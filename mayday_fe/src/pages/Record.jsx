import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Record.module.css';
import Header from '../components/Header';
import Button from '../components/Button';

import RecordIcon from '../assets/images/RecordIcon.svg';
import RecordImg from '../assets/images/RecordImg.svg';
import RecordTxt from '../assets/images/RecordTxt.svg';

function Record() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('expense'); // 'expense' or 'income'
  const [tax, setTax] = useState('3.3'); // '3.3' or 'none'
  const [items, setItems] = useState([]);

  const handleAddItem = (type) => {
    setItems([...items, { id: Date.now(), type, name: type === 'image' ? 'IMG_0412.jpg' : '[KB] 08/04 34,900원...' }]);
  };

  const handleAnalyze = () => {
    if (items.length === 0) return;
    navigate('/loading', { state: { itemCount: items.length } });
  };

  return (
    <div className={styles.container}>
      <Header text="기록하기" />
      
      <div className={styles.content}>
        <div className={styles.tabContainer}>
          <div className={`${styles.tab} ${tab === 'expense' ? styles.activeTab : ''}`} onClick={() => setTab('expense')}>지출</div>
          <div className={`${styles.tab} ${tab === 'income' ? styles.activeTab : ''}`} onClick={() => setTab('income')}>수입</div>
        </div>

        {tab === 'income' && (
          <div className={styles.taxSection}>
            <div className={styles.taxTitle}>3.3% 원천징수(공제) 여부</div>
            <div className={styles.tabContainer}>
              <div className={`${styles.tab} ${tax === '3.3' ? styles.activeTab : ''}`} onClick={() => setTax('3.3')}>3.3% 공제</div>
              <div className={`${styles.tab} ${tax === 'none' ? styles.activeTab : ''}`} onClick={() => setTax('none')}>공제 없음</div>
            </div>
            <p className={styles.taxDesc}>선택한 기준으로 AI가 공제 전 금액과 세액을 계산해요</p>
          </div>
        )}

        <div className={styles.uploadBox} onClick={() => handleAddItem('image')}>
          <div className={styles.uploadIcon}><img src={RecordIcon} /></div>
          <div className={styles.uploadTitle}>{tab === 'expense' ? '영수증 업로드' : '정산서 · 영수증 업로드'}</div>
          <div className={styles.uploadDesc}>{tab === 'expense' ? '영수증 · 카드전표 · 세금계산서 이미지' : '플랫폼 정산 내역 · 입금 확인증 이미지'}</div>
        </div>

        <div className={styles.textBox}>
          <div className={styles.textTitle}>{tab === 'expense' ? '문자 · 결제내역 붙여넣기' : '문자 · 입금내역 붙여넣기'}</div>
          <textarea 
            className={styles.textarea} 
            placeholder={tab === 'expense' ? "결제 문자나 카카오톡 내역을 복사해서 붙여 넣어 주세요" : "입금 문자나 정산 알림을 복사해서 붙여 넣어 주세요"}
          />
        </div>

        <div className={styles.listHeader}>
          <span>추가된 항목 {items.length}건</span>
          <span className={styles.listStatus}>분석 전이에요</span>
        </div>
        
        {items.length === 0 ? (
          <div className={styles.emptyBox}>
            아직 추가된 항목이 없어요<br/>영수증을 올리거나 내역을 붙여 넣어 주세요
          </div>
        ) : (
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemThumb}>{item.type === 'image' ? 'IMG' : 'TXT'}</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.type === 'image' ? `이미지 · ${item.name}` : `텍스트 · ${item.name}`}</div>
                  <div className={styles.itemSub}>{item.type === 'image' ? '방금 추가' : '붙여넣기'}</div>
                </div>
                <button className={styles.deleteBtn} onClick={() => setItems(items.filter(i => i.id !== item.id))}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.btn}>
        <Button 
          text={items.length > 0 ? `${items.length}건 분석하기` : '분석하기'} 
          onClick={handleAnalyze} 
          disabled={items.length === 0}
          style={items.length === 0 ? { backgroundColor: '#E5E5EA', color: '#99A1AF' } : {}}
        />
      </div>
    </div>
  );
}

export default Record;
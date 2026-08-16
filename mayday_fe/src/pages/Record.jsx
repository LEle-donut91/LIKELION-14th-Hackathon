import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Record.module.css';
import Header from '../components/Header';
import Button from '../components/Button';

import RecordIcon from '../assets/images/RecordIcon.svg';
import RecordImg from '../assets/images/RecordImg.svg';
import RecordTxt from '../assets/images/RecordTxt.svg';
import RecordDel from '../assets/images/RecordDelete.svg';

function Record() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('expense'); // 'expense' or 'income'
  const [tax, setTax] = useState('3.3'); // '3.3' or 'none'
  const [expenseItems, setExpenseItems] = useState([]);
  const [incomeItems, setIncomeItems] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const currentItems = tab === 'expense' ? expenseItems : incomeItems;
  const setCurrentItems = tab === 'expense' ? setExpenseItems : setIncomeItems;

  const limit = () => {
    if (currentItems.length >= 10) {
      alert("최대 입력 개수는 10개입니다.");
      return false;
    }
    return true;
  }

  const handleImage = () => {
    if (!limit()) return;
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!limit()) return;
    setIsUploading(true);
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/expenses/ocr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();

      if (res.status === 200) {
        setCurrentItems(prev => [...prev, {
          id: Date.now(),
          type: 'image',
          sourceId: result.data.ocrId,
          rawText: result.data.rawText,
          name: file.name
        }]);
      } else {
        throw new Error(result.message || 'OCR 추출 실패');
      }
    } catch (error) {
      console.error(error);
      // [임시 시연용 로직] 백엔드 연결 전 테스트를 위해 UI상에 항목 추가
      setCurrentItems(prev => [...prev, {
        id: Date.now(),
        type: 'image',
        sourceId: `mock_ocr_${Date.now()}`,
        rawText: "Mock OCR 텍스트",
        name: file.name
      }]);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleText = async (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = textInput.trim();
      if (!text) return;
      if (!limit()) return;
      const token = localStorage.getItem('accessToken');
      try {
        const res = await fetch('/expenses/text/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rawText: text,
            typeHint: tab === 'expense' ? 'EXPENSE' : 'INCOME'
          })
        });
        const result = await res.json();

        if (res.status === 200) {
          setCurrentItems(prev => [...prev, {
            id: Date.now(),
            type: 'text',
            sourceId: result.data.textInputId,
            rawText: result.data.rawText,
            name: text
          }]);
        } else {
          throw new Error(result.message || '텍스트 분석 실패');
        }
      } catch (error) {
        console.error(error);
        // [임시 시연용 로직] 테스트용 통과 코드
        setCurrentItems(prev => [...prev, {
          id: Date.now(),
          type: 'text',
          sourceId: `mock_txt_${Date.now()}`,
          rawText: text,
          name: text
        }]);
      } finally {
        setTextInput('');
      }
    }
  };

  const turnText = (text, maxLength = 25) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleDeleteItem = (id) => {
    setCurrentItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAnalyze = () => {
    if (currentItems.length === 0) return;
    // 향후 /expenses/analyze 에 items 배열 데이터를 넘기는 로직 추가 가능
    navigate('/loading', { 
      state: { 
        items: currentItems, 
        tab: tab, 
        tax: tab === 'income' ? tax : null
      } 
    });
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
            <div className={styles.taxTabContainer}>
              <div className={`${styles.taxTab} ${tax === '3.3' ? styles.taxActive : ''}`} onClick={() => setTax('3.3')}>3.3% 공제</div>
              <div className={`${styles.taxTab} ${tax === 'none' ? styles.taxActive : ''}`} onClick={() => setTax('none')}>공제 없음</div>
            </div>
            <p className={styles.taxText}>선택한 기준으로 AI가 공제 전 금액과 세액을 계산해요.</p>
          </div>
        )}

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />

        <div className={styles.uploadBox} onClick={handleImage}>
          <div className={styles.uploadIcon}><img src={RecordIcon} /></div>
          <div className={styles.uploadTitle}>{tab === 'expense' ? '영수증 업로드' : '정산서 · 영수증 업로드'}</div>
          <div className={styles.uploadText}>{tab === 'expense' ? '영수증 · 카드전표 · 세금계산서 이미지' : '플랫폼 정산 내역 · 입금 확인증 이미지'}</div>
        </div>

        <div className={styles.textBox}>
          <div className={styles.textTitle}>{tab === 'expense' ? '문자 · 결제내역 붙여넣기' : '문자 · 입금내역 붙여넣기'}</div>
          <textarea 
            className={styles.textarea} 
            placeholder={tab === 'expense' ? "결제 문자나 카카오톡 내역을 복사해서 붙여 넣어 주세요" : "입금 문자나 정산 알림을 복사해서 붙여 넣어 주세요"}
            value={textInput}
            onChange={(e)=>setTextInput(e.target.value)} onKeyDown={handleText}
          />
        </div>

        <div className={styles.listHeader}>
          <span className={styles.listTitle}>추가된 항목 {currentItems.length}건</span>
          <span className={styles.listStatus}>분석 전이에요</span>
        </div>
        
        {currentItems.length === 0 ? (
          <div className={styles.emptyBox}>
            <b>아직 추가된 항목이 없어요</b><br />영수증을 올리거나 내역을 붙여 넣어 주세요
          </div>
        ) : (
          <div className={styles.itemList}>
            {currentItems.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemThumb}>
                  <img src={item.type === 'image' ? RecordImg : RecordTxt } />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.type === 'image' ? turnText(item.name) : turnText(item.name)}</div>
                  <div className={styles.itemSub}>{item.type === 'image' ? '이미지' : '텍스트'}</div>
                </div>
                <button className={styles.deleteBtn} onClick={() => handleDeleteItem(item.id)}>
                  <img src={RecordDel} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.btn}>
        <Button 
          text={currentItems.length > 0 ? `${currentItems.length}건 분석하기` : '분석하기'} 
          onClick={handleAnalyze} 
          disabled={currentItems.length === 0}
          style={currentItems.length === 0 ? { backgroundColor: '#EFF0F3', color: '#ABB0BA' } : {}}
        />
        <p className={styles.btntext}>업무용 기록만 입력해주세요</p>
      </div>
    </div>
  );
}

export default Record;
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Record.module.css';
import Header from '../components/Header';
import Button from '../components/Button';

import RecordIcon from '../assets/images/RecordIcon.svg';
import RecordImg from '../assets/images/RecordImg.svg';
import RecordTxt from '../assets/images/RecordTxt.svg';
import RecordDel from '../assets/images/RecordDelete.svg';
import RecordWarning from '../assets/images/RecordWarning.svg';

import axiosInstance from '../api/axiosInstance';

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
  const isFull = currentItems.length >= 10;

  const limit = () => {
    return currentItems.length < 10;
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
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axiosInstance.post('/expenses/ocr', formData);
      if (res.status === 200 || res.status === 201) {
        const responseData = res.data?.data || res.data;
        setCurrentItems(prev => [...prev, {
          id: Date.now(),
          type: 'image',
          sourceId: responseData.ocrId,
          rawText: responseData.rawText,
          name: file.name,
          withholding: tab === 'income' ? tax === '3.3' : false
        }]);
      }
    } catch (error) {
      console.error("이미지 업로드 및 OCR 실패:", error);
      const errMsg = error.response?.data?.message || "이미지 처리에 실패했습니다. 다시 시도해주세요.";
      alert(errMsg);
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
        const res = await axiosInstance.post('/expenses/text/parse', {
          rawText: text,
          typeHint: tab === 'expense' ? 'EXPENSE' : 'INCOME'
        });
        if (res.status === 200 || res.status === 201) {
          const responseData = res.data?.data || res.data;

          setCurrentItems(prev => [...prev, {
            id: Date.now(),
            type: 'text',
            sourceId: responseData.textInputId,
            rawText: responseData.rawText,
            name: text,
            withholding: tab === 'income' ? tax === '3.3' : false
          }]);
        }
      } catch (error) {
        console.error("텍스트 분석 실패:", error);
        const errMsg = error.response?.data?.message || "텍스트 분석에 실패했습니다. 다시 시도해주세요.";
        alert(errMsg);
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
    navigate('/loading', { 
      state: { 
        items: currentItems, 
        tab: tab
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
        
        <div className={`${styles.uploadBox} ${isFull ? styles.uploadBoxDisabled : ''}`} onClick={isFull ? undefined : handleImage}>
          <div className={styles.uploadIcon}><img src={RecordIcon} style={{ opacity: isFull ? 0.3 : 1 }} /></div>
          <div className={styles.uploadTitle}>{isFull ? '업로드가 가득 찼어요' : (tab === 'expense' ? '영수증 업로드' : '정산서 · 영수증 업로드')}</div>
          <div className={styles.uploadText}>{isFull ? '분석하거나 항목을 지운 뒤 추가할 수 있어요' : (tab === 'expense' ? '영수증 · 카드전표 · 세금계산서 이미지' : '플랫폼 정산 내역 · 입금 확인증 이미지')}</div>
        </div>

        <div className={`${styles.textBox} ${isFull ? styles.textBoxDisabled : ''}`}>
          <div className={styles.textTitle}>{tab === 'expense' ? '문자 · 결제내역 붙여넣기' : '문자 · 입금내역 붙여넣기'}</div>
          <textarea 
            className={`${styles.textarea} ${isFull ? styles.textareaDisabled : ''}`} 
            placeholder={isFull ? '붙여넣기는 최대 10개까지 가능해요.' : (tab === 'expense' ? "결제 문자나 카카오톡 내역을 복사해서 붙여 넣어 주세요" : "입금 문자나 정산 알림을 복사해서 붙여 넣어 주세요")}
            value={textInput}
            onChange={(e)=>setTextInput(e.target.value)} onKeyDown={handleText} disabled={isFull}
          />
        </div>

        {isFull && (
          <div className={styles.info}>
            <img src={RecordWarning} />
            <span>한 번에 10건까지 분석할 수 있어요</span>
          </div>
        )}

        <div className={styles.listHeader}>
          <div className={styles.listWrap}>
            <span className={styles.listTitle}>추가된 항목</span>
            <span className={styles.countBadge}>{currentItems.length}/10건</span>
          </div>
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
                  <div className={styles.itemName}>{turnText(item.name)}</div>
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
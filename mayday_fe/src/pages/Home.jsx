import React from 'react';
import Button from '../components/Button';

function Home() {
  const handleTestClick = () => {
    alert("공통 버튼 클릭 작동 확인!");
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>메이데이 홈 화면</h2>
      <p>여기서부터 메인 UI 작업을 시작하시면 됩니다.</p>
      
      <div style={{ marginTop: '20px' }}>
        <Button text="저장하기" onClick={handleTestClick} />
      </div>
    </div>
  );
}

export default Home;
import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('프로다 견적서 생성기');
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{message}</h1>
      <p>기본 앱이 실행되었습니다!</p>
    </div>
  );
}

export default App;

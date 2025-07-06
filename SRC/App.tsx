import React, { useState, useEffect } from 'react';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  businessNumber: string;
  notes: string;
}

interface ClientInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  projectName: string;
  quoteDate: string;
  notes: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  originalPrice: number;
  discountType: 'none' | 'amount' | 'percent' | 'free';
  discountValue: number;
  discountReason: string;
  unitPrice: number;
  amount: number;
}

interface ServiceTemplate {
  name: string;
  description: string;
  originalPrice: number;
}

interface QuoteHistory {
  id: string;
  clientName: string;
  projectName: string;
  totalAmount: number;
  quoteDate: string;
  previewData: any;
}

function App() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '(주)프로다코퍼레이션',
    address: '서울특별시 영등포구 영신로 166, 6층 614호',
    phone: '02-2633-6581',
    email: 'official@proda.net',
    businessNumber: '253-88-02522',
    notes: '',
  });

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    companyName: '',
    contactPerson: '',
    email: '',
    projectName: '',
    quoteDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [services, setServices] = useState<Service[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [recentServices, setRecentServices] = useState<ServiceTemplate[]>([]);
  const [quoteHistory, setQuoteHistory] = useState<QuoteHistory[]>([]);

  // localStorage 저장/로드 로직을 단순화
  useEffect(() => {
    const savedRecent = localStorage.getItem('proda-recent-services');
    const savedHistory = localStorage.getItem('proda-quote-history');
    
    if (savedRecent) {
      try {
        setRecentServices(JSON.parse(savedRecent));
      } catch (e) {
        console.error('Recent services parse error:', e);
      }
    }
    
    if (savedHistory) {
      try {
        setQuoteHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Quote history parse error:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('proda-recent-services', JSON.stringify(recentServices));
  }, [recentServices]);

  useEffect(() => {
    localStorage.setItem('proda-quote-history', JSON.stringify(quoteHistory));
  }, [quoteHistory]);

  const serviceTemplates: ServiceTemplate[] = [
    { name: '인스타그램', description: '인스타그램 계정 운영 및 콘텐츠 제작', originalPrice: 800000 },
    { name: '네이버블로그', description: '네이버 블로그 포스팅 및 SEO 최적화', originalPrice: 600000 },
    { name: '유튜브', description: '유튜브 채널 운영 및 영상 최적화', originalPrice: 1200000 },
    { name: '페이스북', description: '페이스북 페이지 운영 및 광고 관리', originalPrice: 700000 },
    { name: '카카오톡', description: '카카오톡 채널 운영 및 메시지 마케팅', originalPrice: 500000 },
    { name: '영상제작', description: '브랜드 홍보영상 및 콘텐츠 영상 제작', originalPrice: 1500000 },
    { name: '제품촬영', description: '상품 사진 촬영 및 편집', originalPrice: 800000 },
    { name: '인플루언서마케팅', description: '인플루언서 섭외 및 캠페인 진행', originalPrice: 1000000 },
    { name: '매체광고', description: '온라인 매체 광고 기획 및 집행', originalPrice: 900000 },
  ];

  // 드래그 앤 드롭 함수들
  const moveService = (dragIndex: number, hoverIndex: number) => {
    const draggedService = services[dragIndex];
    const newServices = [...services];
    newServices.splice(dragIndex, 1);
    newServices.splice(hoverIndex, 0, draggedService);
    setServices(newServices);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveService(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  // 가격 계산 함수
  const calculateServicePrice = (service: Service) => {
    let unitPrice = service.originalPrice;

    switch (service.discountType) {
      case 'amount':
        unitPrice = Math.max(0, service.originalPrice - service.discountValue);
        break;
      case 'percent':
        unitPrice = service.originalPrice * (1 - service.discountValue / 100);
        break;
      case 'free':
        unitPrice = 0;
        break;
      default:
        unitPrice = service.originalPrice;
    }

    return {
      unitPrice: Math.round(unitPrice),
      amount: Math.round(unitPrice * service.quantity),
    };
  };

  const addService = () => {
    const newId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    setServices([
      ...services,
      {
        id: newId,
        name: '',
        description: '',
        quantity: 1,
        unit: '개월',
        originalPrice: 0,
        discountType: 'none',
        discountValue: 0,
        discountReason: '',
        unitPrice: 0,
        amount: 0,
      },
    ]);

    // 서비스 추가 후 스크롤 및 포커스
    setTimeout(() => {
      const serviceElements = document.querySelectorAll('[data-service-item]');
      const lastService = serviceElements[serviceElements.length - 1];
      if (lastService) {
        lastService.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const firstInput = lastService.querySelector('input[placeholder="서비스명"]') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 100);
  };

  const removeService = (id: number) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const updateService = (id: number, field: keyof Service, value: string | number) => {
    setServices(
      services.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          if (['quantity', 'originalPrice', 'discountType', 'discountValue'].includes(field)) {
            const calculated = calculateServicePrice(updated);
            updated.unitPrice = calculated.unitPrice;
            updated.amount = calculated.amount;
          }
          return updated;
        }
        return s;
      })
    );
  };

  const saveToRecentServices = (service: Service) => {
    if (service.name && service.originalPrice > 0) {
      const newRecentService: ServiceTemplate = {
        name: service.name,
        description: service.description,
        originalPrice: service.originalPrice,
      };
      setRecentServices((prev) => {
        const filtered = prev.filter((rs) => rs.name !== service.name);
        return [newRecentService, ...filtered].slice(0, 10);
      });
    }
  };

  const removeRecentService = (serviceName: string) => {
    setRecentServices(recentServices.filter((service) => service.name !== serviceName));
  };

  const generatePreview = () => {
    if (services.length === 0) {
      alert('먼저 서비스 항목을 추가해주세요.');
      return;
    }

    const quoteDate = new Date(clientInfo.quoteDate);
    const validUntil = new Date(quoteDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const validUntilString = validUntil.toISOString().split('T')[0];

    const subtotal = services.reduce((sum, service) => sum + service.amount, 0);
    const netAmount = subtotal;
    const vat = netAmount * 0.1;
    const total = netAmount + vat;

    const preview = {
      companyInfo: { ...companyInfo },
      clientInfo: { ...clientInfo, validUntil: validUntilString },
      services: [...services],
      discount,
      discountReason,
      subtotal,
      netAmount,
      vat,
      total,
    };

    setPreviewData(preview);

    const newHistory: QuoteHistory = {
      id: Date.now().toString(),
      clientName: clientInfo.companyName || '고객사명 없음',
      projectName: clientInfo.projectName || '프로젝트명 없음',
      totalAmount: total,
      quoteDate: clientInfo.quoteDate,
      previewData: preview,
    };

    setQuoteHistory((prev) => {
      const filtered = prev.filter(
        (h) =>
          !(
            h.clientName === newHistory.clientName &&
            h.projectName === newHistory.projectName &&
            h.quoteDate === newHistory.quoteDate
          )
      );
      return [newHistory, ...filtered].slice(0, 10);
    });

    services.forEach((service) => {
      saveToRecentServices(service);
    });

    setActiveTab('preview');
    alert('견적서 미리보기가 생성되었습니다!');
  };

  const loadFromHistory = (historyItem: QuoteHistory) => {
    const data = historyItem.previewData;
    setCompanyInfo(data.companyInfo);
    setClientInfo({
      companyName: data.clientInfo.companyName,
      contactPerson: data.clientInfo.contactPerson,
      email: data.clientInfo.email,
      projectName: data.clientInfo.projectName,
      quoteDate: data.clientInfo.quoteDate,
      notes: data.clientInfo.notes || '',
    });
    setServices(data.services);
    setDiscount(data.discount || 0);
    setDiscountReason(data.discountReason || '');
    setPreviewData(data);
    setActiveTab('preview');
    alert('과거 견적서 데이터를 불러왔습니다!');
  };

  const removeFromHistory = (id: string) => {
    setQuoteHistory(quoteHistory.filter((item) => item.id !== id));
  };

  const openQuoteInNewTab = () => {
    if (!previewData) {
      alert('먼저 견적서 미리보기를 생성해주세요.');
      return;
    }

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      alert('팝업이 차단되었습니다.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>견적서 - ${previewData.clientInfo.companyName || '프로다코퍼레이션'}</title>
        <style>
          body { font-family: 'Malgun Gothic', Arial, sans-serif; padding: 30px; margin: 0; line-height: 1.5; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { font-size: 28px; font-weight: 900; margin: 0; }
          .company { margin-bottom: 20px; border-left: 3px solid black; padding-left: 15px; }
          .company h2 { font-size: 16px; margin: 0 0 5px 0; }
          .company p { font-size: 11px; margin: 2px 0; color: #333; }
          .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .section-title { font-size: 13px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
          .client-info p { font-size: 11px; margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 10px 6px; vertical-align: top; }
          th { background: #f5f5f5; font-weight: bold; font-size: 11px; text-align: center; }
          .service-name { font-weight: bold; font-size: 12px; margin-bottom: 3px; }
          .service-desc { color: #666; font-size: 10px; line-height: 1.3; }
          .total-section { border-top: 2px solid black; padding-top: 15px; text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; }
          .total-final { font-size: 15px; font-weight: 900; border-top: 1px solid #333; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>견적서</h1>
              <p style="font-size: 11px; color: #666;">QUOTATION</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #666;">
              <p>견적일: ${previewData.clientInfo.quoteDate}</p>
              <p>유효기한: ${previewData.clientInfo.validUntil}</p>
            </div>
          </div>
          
          <div class="company">
            <h2>${previewData.companyInfo.name}</h2>
            <p>${previewData.companyInfo.address}</p>
            <p>T. ${previewData.companyInfo.phone} | E. ${previewData.companyInfo.email}</p>
            <p>사업자등록번호: ${previewData.companyInfo.businessNumber}</p>
          </div>
          
          ${previewData.companyInfo.notes ? `
          <div style="margin-bottom: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div class="section-title">참고사항</div>
            <p style="font-size: 12px; color: #374151; line-height: 1.5; margin: 0; white-space: pre-wrap;">${previewData.companyInfo.notes}</p>
          </div>
          ` : ''}
          
          <div class="client-info">
            <div>
              <div class="section-title">CLIENT</div>
              <p><strong>${previewData.clientInfo.companyName}</strong></p>
              <p>${previewData.clientInfo.contactPerson}</p>
              <p>${previewData.clientInfo.email}</p>
            </div>
            <div>
              <div class="section-title">PROJECT</div>
              <p><strong>${previewData.clientInfo.projectName}</strong></p>
            </div>
          </div>
          
          ${previewData.clientInfo.notes ? `
          <div style="margin-bottom: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div class="section-title">참고사항</div>
            <p style="font-size: 12px; color: #374151; line-height: 1.5; margin: 0; white-space: pre-wrap;">${previewData.clientInfo.notes}</p>
          </div>
          ` : ''}
          
          <div class="section-title">SERVICES</div>
          <table>
            <tr><th>서비스명</th><th>수량</th><th>단가</th><th>금액(원)</th></tr>
            ${previewData.services.map((service: any) => `
              <tr>
                <td>
                  <div class="service-name">${service.name}</div>
                  <div class="service-desc">${service.description}</div>
                  ${service.discountType !== 'none' && service.discountReason ? `<div style="color: #059669; font-size: 10px; margin-top: 3px;">※ ${service.discountReason}</div>` : ''}
                </td>
                <td style="text-align: center; font-size: 9px;">${service.quantity}${service.unit}</td>
                <td style="text-align: right; font-size: 9px;">
                  ${service.discountType !== 'none' 
                    ? `<div style="text-decoration: line-through; color: #999; font-size: 9px;">${service.originalPrice.toLocaleString()}</div>
                       <div style="color: #059669; font-weight: bold; font-size: 9px;">${service.unitPrice.toLocaleString()}</div>`
                    : `${service.unitPrice.toLocaleString()}`
                  }
                </td>
                <td style="text-align: right; font-size: 9px;">${service.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="total-section">
            <div style="display: inline-block; min-width: 250px;">
              <div class="total-row"><span>소계</span><span>${previewData.subtotal.toLocaleString()}</span></div>
              <div class="total-row"><span>공급가액</span><span>${previewData.netAmount.toLocaleString()}</span></div>
              <div class="total-row"><span>부가세(10%)</span><span>${previewData.vat.toLocaleString()}</span></div>
              <div class="total-row total-final"><span>총 금액</span><span>${previewData.total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    newWindow.document.write(html);
    newWindow.document.close();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 스타일 정의
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  };

  const mainGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    alignItems: 'start',
    overflow: 'hidden',
  };

  const responsiveGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const buttonStyle = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#1e293b', fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px' }}>
        프로다 견적서 생성기
      </h1>

      <div style={mainGridStyle}>
        {/* 왼쪽: 입력 폼 */}
        <div>
          {/* 회사 정보 */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#334155', marginBottom: '20px', borderBottom: '2px solid #6366f1', paddingBottom: '10px' }}>
              🏢 회사 정보
            </h2>
            <input
              type="text"
              placeholder="회사명"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="사업자등록번호"
              value={companyInfo.businessNumber}
              onChange={(e) => setCompanyInfo({ ...companyInfo, businessNumber: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="주소"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              style={inputStyle}
            />
            <div style={responsiveGridStyle}>
              <input
                type="text"
                placeholder="전화번호"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                style={{ ...inputStyle, marginBottom: '0' }}
              />
              <input
                type="email"
                placeholder="이메일"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                style={{ ...inputStyle, marginBottom: '0' }}
              />
            </div>
            <textarea
              placeholder="참고사항 (계약 방식, 결제 정보 등)"
              value={companyInfo.notes}
              onChange={(e) => setCompanyInfo({ ...companyInfo, notes: e.target.value })}
              style={{ ...inputStyle, height: '80px', resize: 'vertical', fontFamily: 'inherit', marginTop: '12px' }}
            />
          </div>

          {/* 고객 정보 */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#334155', marginBottom: '20px', borderBottom: '2px solid #8b5cf6', paddingBottom: '10px' }}>
              📧 고객 정보
            </h2>
            <div style={responsiveGridStyle}>
              <input
                type="text"
                placeholder="고객사명"
                value={clientInfo.companyName}
                onChange={(e) => setClientInfo({ ...clientInfo, companyName: e.target.value })}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="담당자명"
                value={clientInfo.contactPerson}
                onChange={(e) => setClientInfo({ ...clientInfo, contactPerson: e.target.value })}
                style={inputStyle}
              />
            </div>
            <input
              type="email"
              placeholder="이메일"
              value={clientInfo.email}
              onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="프로젝트명"
              value={clientInfo.projectName}
              onChange={(e) => setClientInfo({ ...clientInfo, projectName: e.target.value })}
              style={inputStyle}
            />
            <input
              type="date"
              value={clientInfo.quoteDate}
              onChange={(e) => setClientInfo({ ...clientInfo, quoteDate: e.target.value })}
              style={inputStyle}
            />
            <textarea
              placeholder="고객 관련 참고사항"
              value={clientInfo.notes}
              onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
              style={{ ...inputStyle, height: '60px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0' }}
            />
          </div>

          {/* 서비스 항목 */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#334155' }}>🛠️ 서비스 항목</h2>
              <button onClick={addService} style={{ ...buttonStyle, background: '#6366f1', color: 'white' }}>
                ➕ 추가
              </button>
            </div>

            {/* 서비스 템플릿 */}
            <div style={{ marginBottom: '20px', padding: '18px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '12px', color: '#475569' }}>기본 템플릿:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                {serviceTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
                      setServices([
                        ...services,
                        {
                          id: newId,
                          name: template.name,
                          description: template.description,
                          quantity: 1,
                          unit: ['인스타그램', '네이버블로그', '유튜브', '페이스북', '카카오톡', '매체광고'].includes(template.name) ? '개월' : '개',
                          originalPrice: template.originalPrice,
                          discountType: 'none',
                          discountValue: 0,
                          discountReason: '',
                          unitPrice: template.originalPrice,
                          amount: template.originalPrice,
                        },
                      ]);
                    }}
                    style={{ ...buttonStyle, background: 'white', border: '1px solid #d1d5db', color: '#374151', fontSize: '12px' }}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 서비스 목록 */}
            {services.map((service, index) => (
              <div
                key={service.id}
                data-service-item
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  background: draggedIndex === index ? '#e0e7ff' : '#f8fafc',
                  border: draggedIndex === index ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '18px',
                  marginBottom: '14px',
                  cursor: 'move',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#6366f1', color: 'white', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500' }}>
                      {index + 1}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', cursor: 'move' }}>⋮⋮</span>
                  </div>
                  <button onClick={() => removeService(service.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                    🗑️
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 0.7fr) minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="서비스명"
                    value={service.name}
                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', minWidth: '0' }}
                  />
                  <input
                    type="number"
                    placeholder="수량"
                    value={service.quantity}
                    onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value) || 0)}
                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', textAlign: 'center', minWidth: '0' }}
                    min="1"
                  />
                  <input
                    type="text"
                    placeholder="단위"
                    value={service.unit}
                    onChange={(e) => updateService(service.id, 'unit', e.target.value)}
                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', textAlign: 'center', minWidth: '0' }}
                  />
                  <input
                    type="number"
                    placeholder="정가"
                    value={service.originalPrice}
                    onChange={(e) => updateService(service.id, 'originalPrice', parseInt(e.target.value) || 0)}
                    style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', minWidth: '0' }}
                  />
                  <div style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', backgroundColor: '#f9fafb', color: '#6b7280', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '0', overflow: 'hidden' }}>
                    {service.discountType !== 'none' && service.originalPrice > 0 && (
                      <div style={{ fontSize: '10px', textDecoration: 'line-through', color: '#9ca3af' }}>
                        {formatCurrency(service.originalPrice)}
                      </div>
                    )}
                    <div style={{ fontWeight: service.discountType !== 'none' ? 'bold' : 'normal' }}>
                      {formatCurrency(service.unitPrice)}
                    </div>
                  </div>
                </div>

                {/* 할인 설정 */}
                <div style={{ marginBottom: '10px', padding: '12px', background: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    <select
                      value={service.discountType}
                      onChange={(e) => updateService(service.id, 'discountType', e.target.value)}
                      style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', outline: 'none', minWidth: '0' }}
                    >
                      <option value="none">할인 없음</option>
                      <option value="amount">금액 할인</option>
                      <option value="percent">비율 할인</option>
                      <option value="free">무료 제공</option>
                    </select>

                    {service.discountType !== 'none' && service.discountType !== 'free' && (
                      <input
                        type="number"
                        placeholder={service.discountType === 'amount' ? '할인금액' : '할인%'}
                        value={service.discountValue}
                        onChange={(e) => updateService(service.id, 'discountValue', parseFloat(e.target.value) || 0)}
                        style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', outline: 'none', minWidth: '0' }}
                        min="0"
                        max={service.discountType === 'percent' ? 100 : undefined}
                      />
                    )}

                    {service.discountType !== 'none' && (
                      <input
                        type="text"
                        placeholder="할인 사유"
                        value={service.discountReason}
                        onChange={(e) => updateService(service.id, 'discountReason', e.target.value)}
                        style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', outline: 'none', minWidth: '0' }}
                      />
                    )}
                  </div>

                  {service.discountType !== 'none' && (
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {service.discountType === 'free' && '무료 제공'}
                      {service.discountType === 'amount' && `${service.discountValue.toLocaleString()}원 할인`}
                      {service.discountType === 'percent' && `${service.discountValue}% 할인`}
                      {service.discountReason && ` - ${service.discountReason}`}
                    </div>
                  )}
                </div>

                <div style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: 'bold', textAlign: 'right', overflow: 'hidden' }}>
                  최종 금액: {formatCurrency(service.amount)}
                </div>

                <textarea
                  placeholder="서비스 설명"
                  value={service.description}
                  onChange={(e) => updateService(service.id, 'description', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', height: '60px', resize: 'none', outline: 'none', marginTop: '10px', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            {services.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontStyle: 'italic' }}>
                서비스 항목을 추가해주세요
              </div>
            )}

            {services.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', marginBottom: '20px' }}>
                <button onClick={addService} style={{ ...buttonStyle, background: '#10b981', color: 'white' }}>
                  ➕ 서비스 추가
                </button>
              </div>
            )}

            {/* 최근 사용한 서비스 */}
            {recentServices.length > 0 && (
              <div style={{ marginTop: '20px', padding: '18px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#1e40af', marginBottom: '12px' }}>
                  최근 사용한 서비스
                </h4>
                {recentServices.map((recentService, index) => (
                  <div key={index} style={{ padding: '12px', background: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid #dbeafe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e40af', marginBottom: '4px' }}>
                          {recentService.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                          {recentService.description}
                        </div>
                        <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>
                          {recentService.originalPrice.toLocaleString()}원
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            const newId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
                            setServices([
                              ...services,
                              {
                                id: newId,
                                name: recentService.name,
                                description: recentService.description,
                                quantity: 1,
                                unit: ['인스타그램', '네이버블로그', '유튜브', '페이스북', '카카오톡', '매체광고'].includes(recentService.name) ? '개월' : '개',
                                originalPrice: recentService.originalPrice,
                                discountType: 'none',
                                discountValue: 0,
                                discountReason: '',
                                unitPrice: recentService.originalPrice,
                                amount: recentService.originalPrice,
                              },
                            ]);
                          }}
                          style={{ padding: '6px 10px', fontSize: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                          추가
                        </button>
                        <button
                          onClick={() => removeRecentService(recentService.name)}
                          style={{ padding: '6px 10px', fontSize: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 추가 할인율 설정 */}
            <div style={{ marginTop: '20px', padding: '18px', background: '#fefce8', borderRadius: '10px', border: '1px solid #fde047' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#a16207', marginBottom: '12px' }}>
                추가 할인율 설정
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ color: '#a16207', fontWeight: '500' }}>추가 할인율:</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  style={{ width: '80px', padding: '8px 10px', border: '1px solid #eab308', borderRadius: '6px', textAlign: 'center', background: 'white', outline: 'none' }}
                  min="0"
                  max="100"
                />
                <span style={{ color: '#a16207', fontWeight: '500' }}>%</span>
                {discount > 0 && (
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                    (전체 금액에서 추가로 {discount}% 할인)
                  </span>
                )}
              </div>
              {discount > 0 && (
                <input
                  type="text"
                  placeholder="할인 사유 입력 (예: 신규고객 특별혜택, 장기계약 할인 등)"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #eab308', borderRadius: '6px', fontSize: '13px', background: 'white', outline: 'none', boxSizing: 'border-box' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
            <button onClick={generatePreview} style={{ ...buttonStyle, background: '#10b981', color: 'white', fontSize: '15px', fontWeight: '600', padding: '14px 28px' }}>
              📋 견적서 미리보기 생성
            </button>
          </div>

          <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                background: activeTab === 'preview' ? '#6366f1' : 'transparent',
                color: activeTab === 'preview' ? 'white' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
              }}
            >
              📋 미리보기
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                background: activeTab === 'history' ? '#6366f1' : 'transparent',
                color: activeTab === 'history' ? 'white' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
              }}
            >
              📚 견적 히스토리{' '}
              {quoteHistory.length > 0 && (
                <span style={{ background: activeTab === 'history' ? 'rgba(255,255,255,0.3)' : '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>
                  {quoteHistory.length}
                </span>
              )}
            </button>
          </div>

          <div style={{ minHeight: '400px', fontSize: '12px' }}>
            {activeTab === 'preview' ? (
              <>
                {previewData && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                    <button onClick={openQuoteInNewTab} style={{ ...buttonStyle, background: '#6366f1', color: 'white', fontSize: '13px', padding: '8px 14px' }}>
                      🖨️ 견적서 출력
                    </button>
                  </div>
                )}

                {!previewData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#6b7280', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                    <p style={{ fontSize: '16px', marginBottom: '10px' }}>견적서 미리보기</p>
                    <p style={{ fontSize: '14px', fontStyle: 'italic' }}>상단의 "견적서 미리보기 생성" 버튼을 클릭하세요</p>
                  </div>
                ) : (
                  <div style={{ width: '100%' }}>
                    <div style={{ borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
                      <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>견적서</h1>
                      <p style={{ fontSize: '10px', color: '#666' }}>QUOTATION</p>
                      <p style={{ fontSize: '10px', color: '#666' }}>견적일: {previewData.clientInfo.quoteDate}</p>
                    </div>

                    <div style={{ marginBottom: '20px', borderLeft: '3px solid #000', paddingLeft: '15px' }}>
                      <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{previewData.companyInfo.name}</h2>
                      <p style={{ fontSize: '10px', margin: '2px 0' }}>{previewData.companyInfo.address}</p>
                      <p style={{ fontSize: '10px', margin: '2px 0' }}>T. {previewData.companyInfo.phone} | E. {previewData.companyInfo.email}</p>
                      <p style={{ fontSize: '10px', margin: '2px 0' }}>사업자등록번호: {previewData.companyInfo.businessNumber}</p>
                    </div>

                    {previewData.companyInfo.notes && (
                      <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>참고사항</h3>
                        <p style={{ fontSize: '10px', color: '#374151', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {previewData.companyInfo.notes}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '3px' }}>CLIENT</h3>
                        <p style={{ fontWeight: 'bold', margin: '3px 0', fontSize: '11px' }}>{previewData.clientInfo.companyName || '고객사명'}</p>
                        <p style={{ margin: '3px 0', fontSize: '10px' }}>{previewData.clientInfo.contactPerson || '담당자명'}</p>
                        <p style={{ margin: '3px 0', fontSize: '10px' }}>{previewData.clientInfo.email || '이메일'}</p>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '3px' }}>PROJECT</h3>
                        <p style={{ fontWeight: 'bold', margin: '3px 0', fontSize: '11px' }}>{previewData.clientInfo.projectName || '프로젝트명'}</p>
                      </div>
                    </div>

                    {previewData.clientInfo.notes && (
                      <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>참고사항</h3>
                        <p style={{ fontSize: '10px', color: '#374151', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {previewData.clientInfo.notes}
                        </p>
                      </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '3px' }}>SERVICES</h3>
                      {previewData.services.map((service: any, index: number) => (
                        <div key={index} style={{ padding: '6px', background: '#f9fafb', marginBottom: '4px', borderRadius: '4px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '2px' }}>{service.name}</div>
                          <div style={{ fontSize: '9px', color: '#666', marginBottom: '3px' }}>{service.description}</div>
                          <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              {service.discountType !== 'none' ? (
                                <div>
                                  <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>
                                    {service.quantity}{service.unit} × {service.originalPrice.toLocaleString()}원
                                  </span>
                                  <br />
                                  <span style={{ color: '#059669', fontWeight: 'bold' }}>
                                    {service.quantity}{service.unit} × {service.unitPrice.toLocaleString()}원
                                    {service.discountReason && ` (${service.discountReason})`}
                                  </span>
                                </div>
                              ) : (
                                <span>{service.quantity}{service.unit} × {service.unitPrice.toLocaleString()}원</span>
                              )}
                            </div>
                            <span style={{ fontWeight: 'bold' }}>{service.amount.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '2px solid #000', paddingTop: '15px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-block', minWidth: '200px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
                          <span>소계</span><span>{previewData.subtotal.toLocaleString()}원</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
                          <span>공급가액</span><span>{previewData.netAmount.toLocaleString()}원</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
                          <span>부가세(10%)</span><span>{previewData.vat.toLocaleString()}원</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '900', borderTop: '1px solid #333', paddingTop: '6px' }}>
                          <span>총 금액</span><span>{previewData.total.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
                      <p style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
                        본 견적서는 {previewData.clientInfo.validUntil}까지 유효합니다.
                      </p>
                      <div style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'Arial, sans-serif' }}>proda</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                {quoteHistory.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#6b7280', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
                    <p style={{ fontSize: '16px', marginBottom: '10px' }}>견적 히스토리가 없습니다</p>
                    <p style={{ fontSize: '14px', fontStyle: 'italic' }}>견적서를 생성하면 여기에 저장됩니다</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {quoteHistory.map((historyItem) => (
                      <div key={historyItem.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                              {historyItem.clientName} - {historyItem.projectName}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
                              ₩{historyItem.totalAmount.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {historyItem.quoteDate}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => loadFromHistory(historyItem)}
                              style={{ padding: '6px 12px', fontSize: '11px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                              불러오기
                            </button>
                            <button
                              onClick={() => removeFromHistory(historyItem.id)}
                              style={{ padding: '6px 8px', fontSize: '11px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

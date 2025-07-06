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

  // 메모리 저장 (localStorage 대신)
  const [memoryStore, setMemoryStore] = useState<{
    recentServices: ServiceTemplate[];
    quoteHistory: QuoteHistory[];
  }>({
    recentServices: [],
    quoteHistory: []
  });

  // 초기 로드
  useEffect(() => {
    setRecentServices(memoryStore.recentServices);
    setQuoteHistory(memoryStore.quoteHistory);
  }, [memoryStore]);

  // 메모리 저장 업데이트
  useEffect(() => {
    setMemoryStore(prev => ({
      ...prev,
      recentServices: recentServices
    }));
  }, [recentServices]);

  useEffect(() => {
    setMemoryStore(prev => ({
      ...prev,
      quoteHistory: quoteHistory
    }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-5 font-sans">
      <h1 className="text-center text-slate-800 text-4xl font-bold mb-8">
        프로다 견적서 생성기
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* 왼쪽: 입력 폼 */}
        <div>
          {/* 회사 정보 */}
          <div className="bg-white rounded-xl p-7 mb-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 mb-5 pb-2 border-b-2 border-indigo-500">
              🏢 회사 정보
            </h2>
            <input
              type="text"
              placeholder="회사명"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="사업자등록번호"
              value={companyInfo.businessNumber}
              onChange={(e) => setCompanyInfo({ ...companyInfo, businessNumber: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="주소"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="전화번호"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="이메일"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <textarea
              placeholder="참고사항 (계약 방식, 결제 정보 등)"
              value={companyInfo.notes}
              onChange={(e) => setCompanyInfo({ ...companyInfo, notes: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm h-20 resize-y mt-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 고객 정보 */}
          <div className="bg-white rounded-xl p-7 mb-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 mb-5 pb-2 border-b-2 border-purple-500">
              📧 고객 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="고객사명"
                value={clientInfo.companyName}
                onChange={(e) => setClientInfo({ ...clientInfo, companyName: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="담당자명"
                value={clientInfo.contactPerson}
                onChange={(e) => setClientInfo({ ...clientInfo, contactPerson: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <input
              type="email"
              placeholder="이메일"
              value={clientInfo.email}
              onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="프로젝트명"
              value={clientInfo.projectName}
              onChange={(e) => setClientInfo({ ...clientInfo, projectName: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="date"
              value={clientInfo.quoteDate}
              onChange={(e) => setClientInfo({ ...clientInfo, quoteDate: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              placeholder="고객 관련 참고사항"
              value={clientInfo.notes}
              onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm h-16 resize-y outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 서비스 항목 */}
          <div className="bg-white rounded-xl p-7 mb-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-slate-700">🛠️ 서비스 항목</h2>
              <button 
                onClick={addService} 
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                ➕ 추가
              </button>
            </div>

            {/* 서비스 템플릿 */}
            <div className="mb-5 p-5 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium mb-3 text-slate-600">기본 템플릿:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                    className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs hover:bg-slate-50 transition-colors"
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
                className={`p-5 mb-4 rounded-lg border transition-all cursor-move ${
                  draggedIndex === index 
                    ? 'bg-indigo-50 border-indigo-500 border-2' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-xs text-slate-500 cursor-move">⋮⋮</span>
                  </div>
                  <button 
                    onClick={() => removeService(service.id)} 
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="서비스명"
                    value={service.name}
                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    className="col-span-2 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="수량"
                    value={service.quantity}
                    onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="p-2 border border-slate-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                  />
                  <input
                    type="text"
                    placeholder="단위"
                    value={service.unit}
                    onChange={(e) => updateService(service.id, 'unit', e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="정가"
                    value={service.originalPrice}
                    onChange={(e) => updateService(service.id, 'originalPrice', parseInt(e.target.value) || 0)}
                    className="p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-600 mb-3">
                  {service.discountType !== 'none' && service.originalPrice > 0 && (
                    <div className="text-xs line-through text-slate-400">
                      {formatCurrency(service.originalPrice)}
                    </div>
                  )}
                  <div className={service.discountType !== 'none' ? 'font-bold' : ''}>
                    {formatCurrency(service.unitPrice)}
                  </div>
                </div>

                {/* 할인 설정 */}
                <div className="mb-3 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <select
                      value={service.discountType}
                      onChange={(e) => updateService(service.id, 'discountType', e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>

                  {service.discountType !== 'none' && (
                    <div className="text-xs text-slate-600">
                      {service.discountType === 'free' && '무료 제공'}
                      {service.discountType === 'amount' && `${service.discountValue.toLocaleString()}원 할인`}
                      {service.discountType === 'percent' && `${service.discountValue}% 할인`}
                      {service.discountReason && ` - ${service.discountReason}`}
                    </div>
                  )}
                </div>

                <div className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-600 font-bold text-right">
                  최종 금액: {formatCurrency(service.amount)}
                </div>

                <textarea
                  placeholder="서비스 설명"
                  value={service.description}
                  onChange={(e) => updateService(service.id, 'description', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm h-16 resize-none outline-none mt-3 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}

            {services.length === 0 && (
              <div className="text-center py-10 text-slate-500 italic">
                서비스 항목을 추가해주세요
              </div>
            )}

            {services.length > 0 && (
              <div className="flex justify-center mt-4 mb-5">
                <button 
                  onClick={addService} 
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  ➕ 서비스 추가
                </button>
              </div>
            )}

            {/* 최근 사용한 서비스 */}
            {recentServices.length > 0 && (
              <div className="mt-5 p-5 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-3">
                  최근 사용한 서비스
                </h4>
                {recentServices.map((recentService, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg mb-2 border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-3">
                        <div className="font-semibold text-sm text-blue-800 mb-1">
                          {recentService.name}
                        </div>
                        <div className="text-xs text-slate-600 mb-1">
                          {recentService.description}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {recentService.originalPrice.toLocaleString()}원
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                          className="px-2 py-1 text-xs bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          추가
                        </button>
                        <button
                          onClick={() => removeRecentService(recentService.name)}
                          className="px-2 py-1 text-xs bg-red-500 text-white border-none rounded cursor-pointer hover:bg-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 sticky top-5 max-h-screen overflow-y-auto">
          <div className="flex justify-center mb-5 pb-5 border-b-2 border-slate-200">
            <button 
              onClick={generatePreview} 
              className="px-7 py-4 bg-emerald-500 text-white rounded-lg text-base font-semibold hover:bg-emerald-600 transition-colors"
            >
              📋 견적서 미리보기 생성
            </button>
          </div>

          <div className="flex mb-5 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 p-3 border-none text-sm font-medium cursor-pointer rounded-t-lg transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              📋 미리보기
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 p-3 border-none text-sm font-medium cursor-pointer rounded-t-lg transition-colors ${
                activeTab === 'history' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              📚 견적 히스토리{' '}
              {quoteHistory.length > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                  activeTab === 'history' 
                    ? 'bg-white bg-opacity-30 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {quoteHistory.length}
                </span>
              )}
            </button>
          </div>

          <div className="min-h-96 text-xs">
            {activeTab === 'preview' ? (
              <>
                {previewData && (
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={openQuoteInNewTab} 
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
                    >
                      🖨️ 견적서 출력
                    </button>
                  </div>
                )}

                {!previewData ? (
                  <div className="flex flex-col items-center justify-center h-96 text-slate-500 text-center">
                    <div className="text-5xl mb-5">📋</div>
                    <p className="text-base mb-3">견적서 미리보기</p>
                    <p className="text-sm italic">상단의 "견적서 미리보기 생성" 버튼을 클릭하세요</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="border-b-2 border-black pb-4 mb-5">
                      <h1 className="text-2xl font-black m-0">견적서</h1>
                      <p className="text-xs text-slate-600">QUOTATION</p>
                      <p className="text-xs text-slate-600">견적일: {previewData.clientInfo.quoteDate}</p>
                    </div>

                    <div className="mb-5 border-l-4 border-black pl-4">
                      <h2 className="text-sm font-bold mb-2">{previewData.companyInfo.name}</h2>
                      <p className="text-xs mb-1">{previewData.companyInfo.address}</p>
                      <p className="text-xs mb-1">T. {previewData.companyInfo.phone} | E. {previewData.companyInfo.email}</p>
                      <p className="text-xs mb-1">사업자등록번호: {previewData.companyInfo.businessNumber}</p>
                    </div>

                    {previewData.companyInfo.notes && (
                      <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-xs font-bold mb-2 text-slate-800">참고사항</h3>
                        <p className="text-xs text-slate-700 leading-relaxed m-0 whitespace-pre-wrap">
                          {previewData.companyInfo.notes}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <div>
                        <h3 className="text-xs font-bold mb-2 border-b border-slate-300 pb-1">CLIENT</h3>
                        <p className="font-bold mb-1 text-xs">{previewData.clientInfo.companyName || '고객사명'}</p>
                        <p className="mb-1 text-xs">{previewData.clientInfo.contactPerson || '담당자명'}</p>
                        <p className="mb-1 text-xs">{previewData.clientInfo.email || '이메일'}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold mb-2 border-b border-slate-300 pb-1">PROJECT</h3>
                        <p className="font-bold mb-1 text-xs">{previewData.clientInfo.projectName || '프로젝트명'}</p>
                      </div>
                    </div>

                    {previewData.clientInfo.notes && (
                      <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-xs font-bold mb-2 text-slate-800">참고사항</h3>
                        <p className="text-xs text-slate-700 leading-relaxed m-0 whitespace-pre-wrap">
                          {previewData.clientInfo.notes}
                        </p>
                      </div>
                    )}

                    <div className="mb-5">
                      <h3 className="text-xs font-bold mb-2 border-b border-slate-300 pb-1">SERVICES</h3>
                      {previewData.services.map((service: any, index: number) => (
                        <div key={index} className="p-2 bg-slate-50 mb-1 rounded">
                          <div className="font-bold text-xs mb-1">{service.name}</div>
                          <div className="text-xs text-slate-600 mb-1">{service.description}</div>
                          <div className="text-xs flex justify-between items-center">
                            <div>
                              {service.discountType !== 'none' ? (
                                <div>
                                  <span className="line-through text-slate-400">
                                    {service.quantity}{service.unit} × {service.originalPrice.toLocaleString()}원
                                  </span>
                                  <br />
                                  <span className="text-emerald-600 font-bold">
                                    {service.quantity}{service.unit} × {service.unitPrice.toLocaleString()}원
                                    {service.discountReason && ` (${service.discountReason})`}
                                  </span>
                                </div>
                              ) : (
                                <span>{service.quantity}{service.unit} × {service.unitPrice.toLocaleString()}원</span>
                              )}
                            </div>
                            <span className="font-bold">{service.amount.toLocaleString()}원</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-black pt-4 text-right">
                      <div className="inline-block min-w-48">
                        <div className="flex justify-between mb-1 text-xs">
                          <span>소계</span><span>{previewData.subtotal.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between mb-1 text-xs">
                          <span>공급가액</span><span>{previewData.netAmount.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between mb-1 text-xs">
                          <span>부가세(10%)</span><span>{previewData.vat.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between text-sm font-black border-t border-slate-400 pt-2">
                          <span>총 금액</span><span>{previewData.total.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 text-center border-t border-slate-300 pt-4">
                      <p className="text-xs text-slate-600 mb-2">
                        본 견적서는 {previewData.clientInfo.validUntil}까지 유효합니다.
                      </p>
                      <div className="text-base font-black">proda</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                {quoteHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-slate-500 text-center">
                    <div className="text-5xl mb-5">📚</div>
                    <p className="text-base mb-3">견적 히스토리가 없습니다</p>
                    <p className="text-sm italic">견적서를 생성하면 여기에 저장됩니다</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {quoteHistory.map((historyItem) => (
                      <div key={historyItem.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-800 mb-1">
                              {historyItem.clientName} - {historyItem.projectName}
                            </div>
                            <div className="text-sm font-bold text-emerald-600 mb-1">
                              ₩{historyItem.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-600">
                              {historyItem.quoteDate}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadFromHistory(historyItem)}
                              className="px-3 py-1 text-xs bg-indigo-500 text-white border-none rounded cursor-pointer hover:bg-indigo-600 transition-colors"
                            >
                              불러오기
                            </button>
                            <button
                              onClick={() => removeFromHistory(historyItem.id)}
                              className="px-2 py-1 text-xs bg-red-500 text-white border-none rounded cursor-pointer hover:bg-red-600 transition-colors"
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

# 뎁스 차트 구현 가이드

## 개요

뎁스 차트는 주문장 데이터의 시각적 표현으로, 다양한 가격 수준에서의 누적 매수 및 매도 주문을 보여줍니다. 트레이더들이 시장 유동성과 잠재적 지지/저항 수준을 이해하는 데 도움을 줍니다.

## 기본 흐름 및 아키텍처

### 1. 데이터 흐름

```
원시 주문장 데이터 → 데이터 처리 → 캔버스 렌더링 → 사용자 상호작용
```

#### 1단계: 데이터 준비
```typescript
// 원시 주문장 데이터
const rawBuyOrders = [
  { price: '95000', quantity: '0.5' },
  { price: '94000', quantity: '1.2' },
  // ... 더 많은 주문들
];

// 총 수량 누적 계산
const buyOrdersWithTotal = accumulateTotal(rawBuyOrders);
// 결과: 각 주문이 이제 quantity_total (누적 합계)를 가짐

// 캔버스 위치 지정을 위한 비율 계산
const buyOrdersWithRatio = calculateRatios(buyOrdersWithTotal);
// 결과: 각 주문이 accumulation_amount_ratio (Y축 위치 지정을 위한 0-1 스케일)를 가짐
```

#### 2단계: 캔버스 설정
```typescript
const initCanvas = ({canvas, enableGridLine, enablePlot, enableDrawCenterLine}) => {
  // 1. 캔버스 컨텍스트 가져오기 및 고해상도 렌더링 설정
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  // 2. 치수 계산
  const canvasWidth = rect.width;
  const canvasHeight = rect.height;
  const halfWidth = canvasWidth / 2; // 매수/매도 구간으로 분할
```

### 2. 렌더링 과정

#### 1단계: 그리드 및 기본 요소
```typescript
// 선택사항: 참조용 그리드 라인 그리기
if (enableGridLine) {
  drawGridLines(ctx);
}

// X축 기준선 그리기
drawXAxis(ctx);

// 선택사항: 매수/매도 구분하는 중심선 그리기
if (enableDrawCenterLine) {
  drawCenterLine(ctx);
}
```

#### 2단계: 매수 측 렌더링 (왼쪽, 녹색)
```typescript
// 위치 계산
const gap = halfWidth / buyRowsWithRatio.length; // 가격 수준 간 간격

// 각 매수 주문에 대해 (최고가에서 최저가 순)
for (let i = 0; i < buyRowsWithRatio.length; i++) {
  const x = halfWidth - (i + 1) * gap; // 중심에서 왼쪽으로 위치
  const y = canvasHeight * (1 - accumulation_amount_ratio); // 누적 거래량 기반 Y 위치
  
  // 계단식 경로 생성 (수평선 다음 수직선)
  if (i === 0) {
    ctx.lineTo(x, y);
  } else {
    const prevY = canvasHeight * (1 - buyRowsWithRatio[i - 1].accumulation_amount_ratio);
    ctx.lineTo(x, prevY); // 수평 단계
    ctx.lineTo(x, y);     // 수직 단계
  }
}

// 곡선 아래 영역 채우기
ctx.fillStyle = upColor;
ctx.globalAlpha = 0.1;
ctx.fill(buyPath);

// 외곽선 그리기
ctx.strokeStyle = upColor;
ctx.stroke();
```

#### 3단계: 매도 측 렌더링 (오른쪽, 빨간색)
```typescript
// 매도 주문에 대해서도 비슷한 과정이지만 미러링됨
const gap = halfWidth / sellRowsWithRatio.length;

// 각 매도 주문에 대해 (최저가에서 최고가 순)
for (let i = 0; i < sellRowsWithRatio.length; i++) {
  const x = halfWidth + (i + 1) * gap; // 중심에서 오른쪽으로 위치
  const y = canvasHeight * (1 - accumulation_amount_ratio);
  
  // 계단식 경로 생성
  // ... 비슷한 로직이지만 오른쪽으로 이동
}

// downColor(빨간색)로 채우기 및 스트로크
```

### 3. 상호작용 기능

#### 마우스 이벤트 처리
```typescript
const handleMouseMove = (e: MouseEvent) => {
  // 1. 캔버스 기준 마우스 위치 가져오기
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  
  // 2. 가장 가까운 데이터 포인트 찾기
  const allPoints = [...buyPoints, ...sellPoints];
  const distances = allPoints.map(p => Math.abs(p.x - mouseX));
  const nearestIndex = distances.indexOf(Math.min(...distances));
  
  // 3. 임계값 내에 있으면 호버 상태 업데이트
  if (nearestDistance < threshold) {
    setHoverIndex(adjustedIndex);
    setHoverSide(isBuySide ? 'buy' : 'sell');
  }
};
```

#### 호버 효과 렌더링
```typescript
if (hoverIndex !== null) {
  // 점선 가이드 라인 그리기
  ctx.setLineDash([4, 2]);
  
  // 위에서 아래로 수직선
  ctx.moveTo(point.x, 0);
  ctx.lineTo(point.x, canvasHeight);
  
  // 포인트에서 중심까지 수평선
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(canvasWidth / 2, point.y);
  
  // 호버 영역 채우기 (왼쪽 또는 오른쪽)
  if (side === 'buy') {
    ctx.fillRect(0, 0, point.x, canvasHeight); // 왼쪽 영역 채우기
  } else {
    ctx.fillRect(point.x, 0, canvasWidth - point.x, canvasHeight); // 오른쪽 영역 채우기
  }
}
```

## 주요 개념 설명

### 1. 좌표계
```
캔버스 좌표:
- 원점 (0,0)은 왼쪽 상단 모서리
- X는 왼쪽에서 오른쪽으로 증가
- Y는 위에서 아래로 증가

차트 로직:
- X축: 가격 수준 (최저가 왼쪽, 최고가 오른쪽)
- Y축: 누적 거래량 (아래에서 위로)
- 중심선: 매수(왼쪽)와 매도(오른쪽) 주문 구분
```

### 2. 데이터 변환

#### 누적 과정
```typescript
// 예시: 매수 주문 변환 (통합 총량 계산 포함)
입력:    [{ price: '95000', quantity: '0.5' }, { price: '94000', quantity: '1.2' }]
1단계:   [{ price: '95000', quantity: '0.5', quantity_total: '0.5' }, 
         { price: '94000', quantity: '1.2', quantity_total: '1.7' }]

// 통합 총량 계산: 매수총량(1.7) + 매도총량(2.5) = 4.2
2단계:   [{ price: '95000', quantity: '0.5', quantity_total: '0.5', accumulation_amount_ratio: 0.5/4.2 ≈ 0.119 },
         { price: '94000', quantity: '1.2', quantity_total: '1.7', accumulation_amount_ratio: 1.7/4.2 ≈ 0.405 }]
```

#### Y 위치 계산
```typescript
// 비율을 캔버스 Y 좌표로 변환
const y = canvasHeight * (1 - accumulation_amount_ratio);

// 왜 (1 - ratio)인가?
// - 캔버스 Y=0은 위쪽이지만 더 높은 거래량을 위쪽에 표시하려고 함
// - ratio=0 → y=canvasHeight (아래쪽)
// - ratio=1 → y=0 (위쪽)

// 중요: 비율은 통합 총 거래량에 대해 계산됨
// 예시 - 매수총량=10.0, 매도총량=8.0, 통합총량=18.0:
// - 최대 매수 비율: 10.0/18.0 ≈ 0.556 → y ≈ 위에서 44.4%
// - 최대 매도 비율: 8.0/18.0 ≈ 0.444 → y ≈ 위에서 55.6%
// - 합쳐서 실제 시장 깊이 비례를 보여줌
```

### 3. 계단 함수 그리기

뎁스 차트는 각 가격 수준이 다음 수준까지 그 거래량을 유지하기 때문에 "계단" 패턴을 만듭니다:

```typescript
// 각 가격 수준에 대해
if (i === 0) {
  ctx.lineTo(x, y); // 첫 번째 포인트로 직접 선
} else {
  ctx.lineTo(x, prevY); // 수평선 (이전 거래량 유지)
  ctx.lineTo(x, y);     // 수직선 (새로운 거래량으로 단계)
}
```

이것이 특징적인 계단식 모양을 만드는데:
- 수평 세그먼트 = 해당 가격 수준의 거래량
- 수직 세그먼트 = 가격 수준 간 전환

## 컴포넌트 구조

### 핵심 컴포넌트

```typescript
// 메인 컴포넌트 구조
const BasicDepthChart = () => {
  // 상태 관리
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverSide, setHoverSide] = useState<'buy' | 'sell' | null>(null);
  
  // 데이터 준비
  const buyRowsWithRatio = preprocessBuyData();
  const sellRowsWithRatio = preprocessSellData();
  
  // 캔버스 렌더링 함수
  const initCanvas = useCallback(() => {
    // 캔버스 설정 → 그리드 → 매수 측 → 매도 측 → 상호작용
  }, [dependencies]);
  
  // 렌더링 트리거 효과
  useEffect(() => {
    const cleanup = initCanvas({canvas, options});
    return cleanup;
  }, [initCanvas]);
  
  return (
    <Box>
      <Canvas ref={canvasRef} />
      {/* 툴팁/UI 요소 */}
    </Box>
  );
};
```

### 데이터 타입

```typescript
interface OrderBookWithRatio {
  price: string;           // 가격 수준 (예: '95000')
  quantity: string;        // 이 수준의 거래량 (예: '0.5')
  quantity_total: string;  // 이 수준까지의 누적 거래량
  accumulation_amount_ratio: number; // Y 위치 지정을 위한 0-1 비율
}

interface OrderBookWithPoint extends OrderBookWithRatio {
  x: number; // 캔버스 X 좌표
  y: number; // 캔버스 Y 좌표
}
```

## 사용 예시

### 기본 사용법
```typescript
import BasicDepthChart from './BasicDepthChart';

// 단순 뎁스 차트
<BasicDepthChart width={600} height={300} />

// 커스텀 치수로
<BasicDepthChart width={800} height={400} />
```

### 실제 데이터와 통합
```typescript
// 주문장 데이터 변환 (통합 총량 계산 포함)
const processOrderBookData = (buyOrders, sellOrders) => {
  // 개별 총량 계산
  const buyTotal = buyOrders.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
  const sellTotal = sellOrders.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
  const combinedTotal = buyTotal + sellTotal;
  
  // 매수 주문 처리
  const processedBuyOrders = buyOrders.map((order, index, arr) => {
    const cumulativeQuantity = arr
      .slice(0, index + 1)
      .reduce((sum, o) => sum + parseFloat(o.quantity), 0);
    
    return {
      ...order,
      quantity_total: cumulativeQuantity.toString(),
      accumulation_amount_ratio: cumulativeQuantity / combinedTotal
    };
  });
  
  // 매도 주문 처리
  const processedSellOrders = sellOrders.map((order, index, arr) => {
    const cumulativeQuantity = arr
      .slice(0, index + 1)
      .reduce((sum, o) => sum + parseFloat(o.quantity), 0);
    
    return {
      ...order,
      quantity_total: cumulativeQuantity.toString(),
      accumulation_amount_ratio: cumulativeQuantity / combinedTotal
    };
  });
  
  return { buyOrders: processedBuyOrders, sellOrders: processedSellOrders };
};
```

## 성능 고려사항

1. **캔버스 재렌더링**: 데이터나 호버 상태가 변경될 때만 재렌더링
2. **마우스 이벤트 스로틀링**: 더 나은 성능을 위해 마우스 이동 이벤트 스로틀링 고려
3. **포인트 감지**: 가장 가까운 포인트를 찾기 위한 효율적인 알고리즘 사용
4. **메모리 관리**: useEffect 클린업에서 이벤트 리스너 정리

## 커스터마이징 옵션

`initCanvas` 함수는 구성 옵션을 받습니다:
- `enableGridLine`: 참조용 배경 그리드 표시
- `enablePlot`: 개별 데이터 포인트를 점으로 표시
- `enableDrawCenterLine`: 매수/매도 구분하는 수직선 표시

## 더미 데이터 구조

컴포넌트는 기능을 시연하기 위해 현실적인 더미 데이터를 사용합니다:

```typescript
// 총 거래량: 매수=10.0 BTC, 매도=8.0 BTC, 통합=18.0 BTC

// 매수 주문 (입찰) - 가격 내림차순, 15개 수준
const buyRowsWithRatio = [
  { price: '95500', quantity: '0.2', quantity_total: '0.2', accumulation_amount_ratio: 0.2/18.0 }, // ~0.011
  { price: '95000', quantity: '1.1', quantity_total: '3.4', accumulation_amount_ratio: 3.4/18.0 }, // ~0.189
  { price: '94100', quantity: '0.4', quantity_total: '10.0', accumulation_amount_ratio: 10.0/18.0 }, // ~0.556
  // ... 총 15개 수준
];

// 매도 주문 (매도호가) - 가격 오름차순, 15개 수준
const sellRowsWithRatio = [
  { price: '95600', quantity: '0.1', quantity_total: '0.1', accumulation_amount_ratio: 0.1/18.0 }, // ~0.006
  { price: '96000', quantity: '0.5', quantity_total: '1.5', accumulation_amount_ratio: 1.5/18.0 }, // ~0.083
  { price: '97000', quantity: '0.3', quantity_total: '8.0', accumulation_amount_ratio: 8.0/18.0 }, // ~0.444
  // ... 총 15개 수준
];
```

**주요 포인트:**
- Y축은 통합 시장 깊이를 나타냄 (총 18.0 BTC)
- 매수 측은 차트 높이의 ~55.6%에 도달 (더 많은 유동성)
- 매도 측은 차트 높이의 ~44.4%에 도달 (더 적은 유동성)
- 매수자 우세 시장을 보여주는 현실적인 시장 불균형
- 현재 스프레드: $95,500 (최고 매수가) ~ $95,600 (최저 매도가)

## 주요 용어 정리

- **뎁스 차트 (Depth Chart)**: 시장 깊이를 시각화한 차트
- **주문장 (Order Book)**: 매수/매도 주문들의 목록
- **매수호가 (Bid)**: 매수 주문들, 차트의 왼쪽(녹색) 영역
- **매도호가 (Ask)**: 매도 주문들, 차트의 오른쪽(빨간색) 영역
- **누적 거래량 (Cumulative Volume)**: 특정 가격까지의 총 거래량
- **유동성 (Liquidity)**: 시장에서 거래 가능한 물량의 정도
- **지지선/저항선 (Support/Resistance)**: 가격이 머물거나 반등하는 수준

## 트러블슈팅

### 일반적인 문제들

1. **차트가 표시되지 않음**: 캔버스 ref가 올바르게 설정되었는지 확인
2. **호버 효과가 작동하지 않음**: 마우스 이벤트 리스너가 제대로 등록되었는지 확인
3. **성능 이슈**: 데이터 크기를 줄이거나 렌더링 최적화 적용
4. **모바일에서 터치 이벤트**: 터치 이벤트 핸들러 추가 고려

이 문서는 뎁스 차트를 처음 접하는 개발자들이 이해하기 쉽도록 작성되었으며, 실제 구현에 필요한 모든 정보를 포함하고 있습니다.
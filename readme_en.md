# Depth Chart Implementation Guide

## Overview

A depth chart is a visual representation of order book data that shows the cumulative buy and sell orders at different price levels. It helps traders understand market liquidity and potential support/resistance levels.

## Basic Flow & Architecture

### 1. Data Flow

```
Raw Order Book Data → Data Processing → Canvas Rendering → User Interaction
```

#### Step 1: Data Preparation
```typescript
// Raw order book data
const rawBuyOrders = [
  { price: '95000', quantity: '0.5' },
  { price: '94000', quantity: '1.2' },
  // ... more orders
];

// Accumulate total quantities
const buyOrdersWithTotal = accumulateTotal(rawBuyOrders);
// Result: Each order now has quantity_total (cumulative sum)

// Calculate ratios for canvas positioning
const buyOrdersWithRatio = calculateRatios(buyOrdersWithTotal);
// Result: Each order has accumulation_amount_ratio (0-1 scale for Y-axis positioning)
```

#### Step 2: Canvas Setup
```typescript
const initCanvas = ({canvas, enableGridLine, enablePlot, enableDrawCenterLine}) => {
  // 1. Get canvas context and setup high-DPI rendering
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  // 2. Calculate dimensions
  const canvasWidth = rect.width;
  const canvasHeight = rect.height;
  const halfWidth = canvasWidth / 2; // Split for buy/sell sides
```

### 2. Rendering Process

#### Phase 1: Grid and Base Elements
```typescript
// Optional: Draw grid lines for reference
if (enableGridLine) {
  drawGridLines(ctx);
}

// Draw X-axis baseline
drawXAxis(ctx);

// Optional: Draw center line separating buy/sell
if (enableDrawCenterLine) {
  drawCenterLine(ctx);
}
```

#### Phase 2: Buy Side Rendering (Left Side, Green)
```typescript
// Calculate positioning
const gap = halfWidth / buyRowsWithRatio.length; // Space between price levels

// For each buy order (from highest to lowest price)
for (let i = 0; i < buyRowsWithRatio.length; i++) {
  const x = halfWidth - (i + 1) * gap; // Position from center going left
  const y = canvasHeight * (1 - accumulation_amount_ratio); // Y position based on cumulative volume
  
  // Create step-like path (horizontal then vertical lines)
  if (i === 0) {
    ctx.lineTo(x, y);
  } else {
    const prevY = canvasHeight * (1 - buyRowsWithRatio[i - 1].accumulation_amount_ratio);
    ctx.lineTo(x, prevY); // Horizontal step
    ctx.lineTo(x, y);     // Vertical step
  }
}

// Fill area under the curve
ctx.fillStyle = upColor;
ctx.globalAlpha = 0.1;
ctx.fill(buyPath);

// Draw the outline
ctx.strokeStyle = upColor;
ctx.stroke();
```

#### Phase 3: Sell Side Rendering (Right Side, Red)
```typescript
// Similar process but mirrored for sell orders
const gap = halfWidth / sellRowsWithRatio.length;

// For each sell order (from lowest to highest price)
for (let i = 0; i < sellRowsWithRatio.length; i++) {
  const x = halfWidth + (i + 1) * gap; // Position from center going right
  const y = canvasHeight * (1 - accumulation_amount_ratio);
  
  // Create step-like path
  // ... similar logic but moving rightward
}

// Fill and stroke with downColor (red)
```

### 3. Interactive Features

#### Mouse Event Handling
```typescript
const handleMouseMove = (e: MouseEvent) => {
  // 1. Get mouse position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  
  // 2. Find nearest data point
  const allPoints = [...buyPoints, ...sellPoints];
  const distances = allPoints.map(p => Math.abs(p.x - mouseX));
  const nearestIndex = distances.indexOf(Math.min(...distances));
  
  // 3. Update hover state if within threshold
  if (nearestDistance < threshold) {
    setHoverIndex(adjustedIndex);
    setHoverSide(isBuySide ? 'buy' : 'sell');
  }
};
```

#### Hover Effects Rendering
```typescript
if (hoverIndex !== null) {
  // Draw dashed guide lines
  ctx.setLineDash([4, 2]);
  
  // Vertical line from top to bottom
  ctx.moveTo(point.x, 0);
  ctx.lineTo(point.x, canvasHeight);
  
  // Horizontal line from point to center
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(canvasWidth / 2, point.y);
  
  // Fill hover area (left or right side)
  if (side === 'buy') {
    ctx.fillRect(0, 0, point.x, canvasHeight); // Fill left area
  } else {
    ctx.fillRect(point.x, 0, canvasWidth - point.x, canvasHeight); // Fill right area
  }
}
```

## Key Concepts Explained

### 1. Coordinate System
```
Canvas Coordinates:
- Origin (0,0) is top-left corner
- X increases left to right
- Y increases top to bottom

Chart Logic:
- X-axis: Price levels (lowest left, highest right)
- Y-axis: Cumulative volume (bottom to top)
- Center line: Separates buy (left) and sell (right) orders
```

### 2. Data Transformation

#### Accumulation Process
```typescript
// Example: Buy orders transformation with combined total calculation
Input:  [{ price: '95000', quantity: '0.5' }, { price: '94000', quantity: '1.2' }]
Step 1: [{ price: '95000', quantity: '0.5', quantity_total: '0.5' }, 
         { price: '94000', quantity: '1.2', quantity_total: '1.7' }]

// Calculate combined total: buyTotal (1.7) + sellTotal (2.5) = 4.2
Step 2: [{ price: '95000', quantity: '0.5', quantity_total: '0.5', accumulation_amount_ratio: 0.5/4.2 ≈ 0.119 },
         { price: '94000', quantity: '1.2', quantity_total: '1.7', accumulation_amount_ratio: 1.7/4.2 ≈ 0.405 }]
```

#### Y-Position Calculation
```typescript
// Convert ratio to canvas Y coordinate
const y = canvasHeight * (1 - accumulation_amount_ratio);

// Why (1 - ratio)?
// - Canvas Y=0 is top, but we want higher volumes at top
// - ratio=0 → y=canvasHeight (bottom)
// - ratio=1 → y=0 (top)

// Important: Ratio is calculated against COMBINED total volume
// Example with buyTotal=10.0, sellTotal=8.0, combinedTotal=18.0:
// - Max buy ratio: 10.0/18.0 ≈ 0.556 → y ≈ 44.4% from top
// - Max sell ratio: 8.0/18.0 ≈ 0.444 → y ≈ 55.6% from top
// - Combined they show true market depth proportion
```

### 3. Step-Function Drawing

The depth chart creates a "step" pattern because each price level maintains its volume until the next level:

```typescript
// For each price level
if (i === 0) {
  ctx.lineTo(x, y); // Direct line to first point
} else {
  ctx.lineTo(x, prevY); // Horizontal line (maintain previous volume)
  ctx.lineTo(x, y);     // Vertical line (step to new volume)
}
```

This creates the characteristic staircase appearance where:
- Horizontal segments = volume at that price level
- Vertical segments = transitions between price levels

## Component Structure

### Core Components

```typescript
// Main component structure
const BasicDepthChart = () => {
  // State management
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverSide, setHoverSide] = useState<'buy' | 'sell' | null>(null);
  
  // Data preparation
  const buyRowsWithRatio = preprocessBuyData();
  const sellRowsWithRatio = preprocessSellData();
  
  // Canvas rendering function
  const initCanvas = useCallback(() => {
    // Canvas setup → Grid → Buy side → Sell side → Interactions
  }, [dependencies]);
  
  // Effect to trigger rendering
  useEffect(() => {
    const cleanup = initCanvas({canvas, options});
    return cleanup;
  }, [initCanvas]);
  
  return (
    <Box>
      <Canvas ref={canvasRef} />
      {/* Tooltip/UI elements */}
    </Box>
  );
};
```

### Data Types

```typescript
interface OrderBookWithRatio {
  price: string;           // Price level (e.g., '95000')
  quantity: string;        // Volume at this level (e.g., '0.5')
  quantity_total: string;  // Cumulative volume up to this level
  accumulation_amount_ratio: number; // 0-1 ratio for Y positioning
}

interface OrderBookWithPoint extends OrderBookWithRatio {
  x: number; // Canvas X coordinate
  y: number; // Canvas Y coordinate
}
```

## Usage Examples

### Basic Usage
```typescript
import BasicDepthChart from './BasicDepthChart';

// Simple depth chart
<BasicDepthChart width={600} height={300} />

// With custom dimensions
<BasicDepthChart width={800} height={400} />
```

### Integration with Real Data
```typescript
// Transform your order book data with combined total calculation
const processOrderBookData = (buyOrders, sellOrders) => {
  // Calculate individual totals
  const buyTotal = buyOrders.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
  const sellTotal = sellOrders.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
  const combinedTotal = buyTotal + sellTotal;
  
  // Process buy orders
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
  
  // Process sell orders
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

## Performance Considerations

1. **Canvas Re-rendering**: Only re-render when data or hover state changes
2. **Mouse Event Throttling**: Consider throttling mouse move events for better performance
3. **Point Detection**: Use efficient algorithms for finding nearest points
4. **Memory Management**: Clean up event listeners in useEffect cleanup

## Customization Options

The `initCanvas` function accepts configuration options:
- `enableGridLine`: Show background grid for reference
- `enablePlot`: Show individual data points as dots
- `enableDrawCenterLine`: Show vertical line separating buy/sell sides

## Dummy Data Structure

The component uses realistic dummy data to demonstrate functionality:

```typescript
// Total volumes: Buy=10.0 BTC, Sell=8.0 BTC, Combined=18.0 BTC

// Buy orders (bids) - decreasing prices, 15 levels
const buyRowsWithRatio = [
  { price: '95500', quantity: '0.2', quantity_total: '0.2', accumulation_amount_ratio: 0.2/18.0 }, // ~0.011
  { price: '95000', quantity: '1.1', quantity_total: '3.4', accumulation_amount_ratio: 3.4/18.0 }, // ~0.189
  { price: '94100', quantity: '0.4', quantity_total: '10.0', accumulation_amount_ratio: 10.0/18.0 }, // ~0.556
  // ... 15 levels total
];

// Sell orders (asks) - increasing prices, 15 levels
const sellRowsWithRatio = [
  { price: '95600', quantity: '0.1', quantity_total: '0.1', accumulation_amount_ratio: 0.1/18.0 }, // ~0.006
  { price: '96000', quantity: '0.5', quantity_total: '1.5', accumulation_amount_ratio: 1.5/18.0 }, // ~0.083
  { price: '97000', quantity: '0.3', quantity_total: '8.0', accumulation_amount_ratio: 8.0/18.0 }, // ~0.444
  // ... 15 levels total
];
```

**Key Points:**
- Y-axis represents combined market depth (18.0 BTC total)
- Buy side reaches ~55.6% of chart height (more liquidity)
- Sell side reaches ~44.4% of chart height (less liquidity)
- Realistic market imbalance showing buyer-heavy market
- Current spread: $95,500 (highest bid) to $95,600 (lowest ask)
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OrderBookWithPoint } from './type';
import { buyRowsWithRatio, sellRowsWithRatio } from './constant';
import { formatNumber } from '../../lib/NumberFormatter';

// Dummy theme colors (simplified)
const dummyTheme = {
  upColor: '#26a69a',
  downColor: '#ef5350',
};

const BasicDepthChart = ({
  width = 600,
  height = 300,
}: {
  width?: number;
  height?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useColorScheme();
  const { palette } = useTheme();

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverSide, setHoverSide] = useState<'buy' | 'sell' | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [enableGridLine, setEnableGridLine] = useState(true);
  const [enablePlot, setEnablePlot] = useState(true);
  const [enableDrawCenterLine, setEnableDrawCenterLine] = useState(true);

  const initCanvas = useCallback(
    ({
      canvas,
      enableGridLine = false,
      enablePlot = false,
      enableDrawCenterLine = false,
    }: {
      canvas: HTMLCanvasElement;
      enableGridLine: boolean;
      enablePlot: boolean;
      enableDrawCenterLine: boolean;
    }) => {
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Canvas setup for high DPI
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const canvasWidth = rect.width;
        const canvasHeight = rect.height;
        const halfWidth = canvasWidth / 2;

        // Point arrays for hover detection
        const buyPoints: OrderBookWithPoint[] = [];
        const sellPoints: OrderBookWithPoint[] = [];

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw grid lines if enabled
        if (enableGridLine) {
          const gridColumns = 4;
          const gridRows = 3;

          ctx.strokeStyle = palette.grey[300];
          ctx.lineWidth = 1;

          // Horizontal lines
          for (let i = 0; i <= gridRows; i++) {
            const y = (canvasHeight * i) / gridRows;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
          }

          // Vertical lines
          for (let i = 0; i <= gridColumns; i++) {
            const x = (canvasWidth * i) / gridColumns;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
          }
        }

        // Draw buy side (left side, green)
        if (buyRowsWithRatio.length > 0) {
          const gap = halfWidth / buyRowsWithRatio.length;
          const firstBuy = buyRowsWithRatio[0];

          // Create buy path
          ctx.beginPath();
          const firstX = halfWidth - gap;
          const firstY =
            canvasHeight * (1 - firstBuy.accumulation_amount_ratio);
          ctx.moveTo(firstX, canvasHeight); // Start from baseline
          ctx.lineTo(firstX, firstY); // Vertical line to first point

          for (let i = 0; i < buyRowsWithRatio.length; i++) {
            const x = halfWidth - (i + 1) * gap;
            const y =
              canvasHeight *
              (1 - buyRowsWithRatio[i].accumulation_amount_ratio);

            if (i === 0) {
              ctx.lineTo(x, y);
            } else {
              const prevY =
                canvasHeight *
                (1 - buyRowsWithRatio[i - 1].accumulation_amount_ratio);
              ctx.lineTo(x, prevY); // horizontal step
              ctx.lineTo(x, y); // vertical step
            }

            // Store points for hover detection
            if (enablePlot) {
              buyPoints.push({ x, y, ...buyRowsWithRatio[i] });
            }
          }

          // Complete the path to baseline
          const lastBuyY =
            canvasHeight *
            (1 -
              buyRowsWithRatio[buyRowsWithRatio.length - 1]
                .accumulation_amount_ratio);
          ctx.lineTo(0, lastBuyY);

          // Fill buy area
          const buyPath = new Path2D();
          buyPath.moveTo(firstX, canvasHeight);
          buyPath.lineTo(firstX, firstY);

          for (let i = 0; i < buyRowsWithRatio.length; i++) {
            const x = halfWidth - (i + 1) * gap;
            const y =
              canvasHeight *
              (1 - buyRowsWithRatio[i].accumulation_amount_ratio);

            if (i === 0) {
              buyPath.lineTo(x, y);
            } else {
              const prevY =
                canvasHeight *
                (1 - buyRowsWithRatio[i - 1].accumulation_amount_ratio);
              buyPath.lineTo(x, prevY);
              buyPath.lineTo(x, y);
            }
          }

          buyPath.lineTo(0, lastBuyY);
          buyPath.lineTo(0, canvasHeight);
          buyPath.lineTo(firstX, canvasHeight);
          buyPath.closePath();

          ctx.fillStyle = dummyTheme.upColor;
          ctx.globalAlpha = 0.1;
          ctx.fill(buyPath);
          ctx.globalAlpha = 1;

          // Draw buy line
          ctx.strokeStyle = dummyTheme.upColor;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Draw buy points if enabled
          if (enablePlot) {
            buyPoints.forEach((point) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
              ctx.fillStyle = dummyTheme.upColor;
              ctx.fill();
            });
          }
        }

        // Draw sell side (right side, red)
        if (sellRowsWithRatio.length > 0) {
          const gap = halfWidth / sellRowsWithRatio.length;
          const firstSell = sellRowsWithRatio[0];

          // Create sell path
          ctx.beginPath();
          const firstX = halfWidth + gap;
          const firstY =
            canvasHeight * (1 - firstSell.accumulation_amount_ratio);
          ctx.moveTo(firstX, canvasHeight); // Start from baseline
          ctx.lineTo(firstX, firstY); // Vertical line to first point

          for (let i = 0; i < sellRowsWithRatio.length; i++) {
            const x = halfWidth + (i + 1) * gap;
            const y =
              canvasHeight *
              (1 - sellRowsWithRatio[i].accumulation_amount_ratio);

            if (i === 0) {
              ctx.lineTo(x, y);
            } else {
              const prevY =
                canvasHeight *
                (1 - sellRowsWithRatio[i - 1].accumulation_amount_ratio);
              ctx.lineTo(x, prevY); // horizontal step
              ctx.lineTo(x, y); // vertical step
            }

            // Store points for hover detection
            if (enablePlot) {
              sellPoints.push({ x, y, ...sellRowsWithRatio[i] });
            }
          }

          // Complete the path to baseline
          const lastSellY =
            canvasHeight *
            (1 -
              sellRowsWithRatio[sellRowsWithRatio.length - 1]
                .accumulation_amount_ratio);
          ctx.lineTo(canvasWidth, lastSellY);

          // Fill sell area
          const sellPath = new Path2D();
          sellPath.moveTo(firstX, canvasHeight);
          sellPath.lineTo(firstX, firstY);

          for (let i = 0; i < sellRowsWithRatio.length; i++) {
            const x = halfWidth + (i + 1) * gap;
            const y =
              canvasHeight *
              (1 - sellRowsWithRatio[i].accumulation_amount_ratio);

            if (i === 0) {
              sellPath.lineTo(x, y);
            } else {
              const prevY =
                canvasHeight *
                (1 - sellRowsWithRatio[i - 1].accumulation_amount_ratio);
              sellPath.lineTo(x, prevY);
              sellPath.lineTo(x, y);
            }
          }

          sellPath.lineTo(canvasWidth, lastSellY);
          sellPath.lineTo(canvasWidth, canvasHeight);
          sellPath.lineTo(firstX, canvasHeight);
          sellPath.closePath();

          ctx.fillStyle = dummyTheme.downColor;
          ctx.globalAlpha = 0.1;
          ctx.fill(sellPath);
          ctx.globalAlpha = 1;

          // Draw sell line
          ctx.strokeStyle = dummyTheme.downColor;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Draw sell points if enabled
          if (enablePlot) {
            sellPoints.forEach((point) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
              ctx.fillStyle = dummyTheme.downColor;
              ctx.fill();
            });
          }
        }

        // Draw X-axis
        ctx.strokeStyle =
          mode === 'light' ? palette.grey[800] : palette.grey[300];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight);
        ctx.lineTo(canvasWidth, canvasHeight);
        ctx.stroke();

        // Draw center line if enabled
        if (enableDrawCenterLine) {
          const centerX = canvasWidth / 2;
          ctx.strokeStyle =
            mode === 'light' ? palette.grey[600] : palette.grey[400];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(centerX, 0);
          ctx.lineTo(centerX, canvasHeight);
          ctx.stroke();
        }

        // Handle hover effects
        if (hoverIndex !== null) {
          const pointGroups: Record<'buy' | 'sell', OrderBookWithPoint[]> = {
            buy: buyPoints,
            sell: sellPoints,
          };

          (['buy', 'sell'] as const).forEach((side) => {
            const points = pointGroups[side];
            const point = points[hoverIndex];
            if (!point) return;

            // Draw dashed lines for hover
            ctx.save();
            ctx.strokeStyle =
              mode === 'light' ? palette.grey[600] : palette.grey[400];
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 2]);

            // Vertical line
            ctx.beginPath();
            ctx.moveTo(point.x, 0);
            ctx.lineTo(point.x, canvasHeight);
            ctx.stroke();

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(canvasWidth / 2, point.y);
            ctx.stroke();

            ctx.restore();

            // Fill hover area
            ctx.save();
            ctx.fillStyle = palette.grey[300];
            ctx.globalAlpha = 0.2;

            if (side === 'buy') {
              ctx.fillRect(0, 0, point.x, canvasHeight);
            } else {
              ctx.fillRect(point.x, 0, canvasWidth - point.x, canvasHeight);
            }

            ctx.restore();
          });
        }

        // Mouse event handlers
        const handleMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;

          const allPoints = [...buyPoints, ...sellPoints];
          const xPositions = allPoints.map((p) => p.x);
          const distances = xPositions.map((x) => Math.abs(x - mouseX));
          const nearest = Math.min(...distances);
          const index = distances.indexOf(nearest);
          const threshold = 20;

          if (nearest < threshold) {
            const isBuySide = index < buyPoints.length;
            const adjustedIndex = isBuySide ? index : index - buyPoints.length;

            if (
              adjustedIndex !== hoverIndex ||
              (isBuySide ? 'buy' : 'sell') !== hoverSide
            ) {
              setHoverIndex(adjustedIndex);
              setHoverSide(isBuySide ? 'buy' : 'sell');

              // Calculate tooltip position based on the original DepthChart logic
              const targetPoints = isBuySide ? buyPoints : sellPoints;
              const point = targetPoints[adjustedIndex];
              if (point) {
                const canvasWidth = rect.width;
                const canvasHeight = rect.height;
                const horizontalPadding = 5;

                let tooltipX: number;
                let tooltipY: number;

                if (isBuySide) {
                  // Buy side positioning
                  const halfWidth = (canvasWidth - horizontalPadding * 2) / 2;
                  const gap = halfWidth / buyRowsWithRatio.length;
                  const x =
                    horizontalPadding + halfWidth - (adjustedIndex + 1) * gap;
                  tooltipX = Math.min(canvasWidth - 60, Math.max(30, x));
                  const paddingTop = 10;
                  tooltipY = Math.max(
                    0,
                    paddingTop +
                      (canvasHeight - paddingTop) *
                        (1 -
                          buyRowsWithRatio[adjustedIndex]
                            .accumulation_amount_ratio) -
                      30
                  );
                } else {
                  // Sell side positioning
                  const halfWidth = (canvasWidth - horizontalPadding * 2) / 2;
                  const gap = halfWidth / sellRowsWithRatio.length;
                  const x =
                    horizontalPadding + halfWidth + (adjustedIndex + 1) * gap;
                  tooltipX = Math.min(canvasWidth - 60, Math.max(30, x));
                  const paddingTop = 10;
                  tooltipY = Math.max(
                    0,
                    paddingTop +
                      (canvasHeight - paddingTop) *
                        (1 -
                          sellRowsWithRatio[adjustedIndex]
                            .accumulation_amount_ratio) -
                      30
                  );
                }

                setTooltipPosition({ x: tooltipX, y: tooltipY });
              }
            }
          } else {
            if (hoverIndex !== null) {
              setHoverIndex(null);
              setHoverSide(null);
            }
          }
        };

        const handleMouseLeave = () => {
          setHoverIndex(null);
          setHoverSide(null);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
      } catch (error) {
        console.error('Error initializing canvas for depth chart:', error);
        return () => {};
      }
    },
    [hoverIndex, mode, hoverSide, palette.grey]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const cleanup = initCanvas({
        canvas,
        enableGridLine,
        enablePlot,
        enableDrawCenterLine,
      });

      return cleanup;
    } catch (error) {
      console.error('Error during canvas initialization:', error);
      return () => {};
    }
  }, [initCanvas, enableGridLine, enablePlot, enableDrawCenterLine]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        width: `${width}px`,
        height: `${height}px`,
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 1,
        p: 2,
      }}
    >
      <Box
        sx={{
          mb: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={enableGridLine}
              onChange={(e) => setEnableGridLine(e.target.checked)}
              size='small'
            />
          }
          label='Grid'
          sx={{ fontSize: { xs: '10px', sm: '12px' } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={enablePlot}
              onChange={(e) => setEnablePlot(e.target.checked)}
              size='small'
            />
          }
          label='Points'
          sx={{ fontSize: { xs: '10px', sm: '12px' } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={enableDrawCenterLine}
              onChange={(e) => setEnableDrawCenterLine(e.target.checked)}
              size='small'
            />
          }
          label='Center'
          sx={{ fontSize: { xs: '10px', sm: '12px' } }}
        />
      </Box>

      <Box
        sx={{
          mb: 1,
          textAlign: 'center',
          fontSize: { xs: '12px', sm: '14px' },
          fontWeight: 'bold',
        }}
      >
        Basic Depth Chart with Dummy Data
      </Box>

      <Canvas ref={canvasRef} />

      {hoverIndex !== null && (
        <Box
          sx={{
            position: 'absolute',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'common.black',
            color: 'common.white',
            borderRadius: 1,
            p: 1,
            fontSize: '12px',
            zIndex: 10,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '100%',
              left: '50%',
              marginLeft: '-6px',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid black',
            },
          }}
        >
          <div>Side: {hoverSide}</div>
          <div>Index: {hoverIndex}</div>
          {hoverSide === 'buy' && buyRowsWithRatio[hoverIndex] && (
            <>
              <div>
                Price:{' '}
                {formatNumber({
                  value: buyRowsWithRatio[hoverIndex].price,
                  prefix: '$',
                  decimalPlaces: 2,
                })}
              </div>
              <div>
                Quantity:{' '}
                {formatNumber({
                  value: buyRowsWithRatio[hoverIndex].quantity,
                  decimalPlaces: 4,
                })}
              </div>
              <div>
                Total:{' '}
                {formatNumber({
                  value: buyRowsWithRatio[hoverIndex].quantity_total,
                  decimalPlaces: 4,
                })}
              </div>
            </>
          )}
          {hoverSide === 'sell' && sellRowsWithRatio[hoverIndex] && (
            <>
              <div>
                Price:{' '}
                {formatNumber({
                  value: sellRowsWithRatio[hoverIndex].price,
                  prefix: '$',
                  decimalPlaces: 2,
                })}
              </div>
              <div>
                Quantity:{' '}
                {formatNumber({
                  value: sellRowsWithRatio[hoverIndex].quantity,
                  decimalPlaces: 4,
                })}
              </div>
              <div>
                Total:{' '}
                {formatNumber({
                  value: sellRowsWithRatio[hoverIndex].quantity_total,
                  decimalPlaces: 4,
                })}
              </div>
            </>
          )}
        </Box>
      )}

      <Box
        sx={{
          mt: 1,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: { xs: '10px', sm: '12px' },
          color: 'text.secondary',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <span style={{ color: dummyTheme.upColor }}>
          Buy Orders (15 levels)
        </span>
        <span>
          Current Price: ~{formatNumber({ value: 95550, prefix: '$' })}
          {/* <NumberFormatter value={95550} prefix='$' /> */}
        </span>
        <span style={{ color: dummyTheme.downColor }}>
          Sell Orders (15 levels)
        </span>
      </Box>
    </Box>
  );
};

export default BasicDepthChart;

const Canvas = styled('canvas')({
  width: '100%',
  height: 'calc(100% - 60px)',
  display: 'block',
  position: 'relative',
  zIndex: 1,
});

import { Box, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import BasicDepthChart from './BasicDepthChart';

const DepthChartExample = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: { xs: '100%', md: 800 }, 
      margin: '0 auto',
      width: '100%'
    }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        gutterBottom
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      >
        Depth Chart Testing Component
      </Typography>

      <Typography 
        variant="body1" 
        sx={{ 
          mb: 3, 
          color: 'text.secondary',
          fontSize: { xs: '0.875rem', md: '1rem' }
        }}
      >
        This component demonstrates how depth charts work with dummy data. The chart shows buy orders (green, left side)
        and sell orders (red, right side). Hover over the chart to see interactive features.
      </Typography>

      <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
          How Depth Charts Work:
        </Typography>
        <Box component="ul" sx={{ pl: 2, fontSize: { xs: '0.875rem', md: '1rem' } }}>
          <li>
            <strong>Left side (Green):</strong> Buy orders (bids) - shows cumulative buy volume at different price
            levels
          </li>
          <li>
            <strong>Right side (Red):</strong> Sell orders (asks) - shows cumulative sell volume at different price
            levels
          </li>
          <li>
            <strong>X-axis:</strong> Price levels from lowest (left) to highest (right)
          </li>
          <li>
            <strong>Y-axis:</strong> Cumulative volume/quantity
          </li>
          <li>
            <strong>Center line:</strong> Current market price separator
          </li>
          <li>
            <strong>Hover interaction:</strong> Shows detailed information for each price level
          </li>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: { xs: 0.5, sm: 1 }, overflow: 'hidden' }}>
        <BasicDepthChart 
          width={isMobile ? (isSmallMobile ? 320 : 500) : 700} 
          height={isMobile ? (isSmallMobile ? 300 : 350) : 400} 
        />
      </Paper>

      <Box sx={{ 
        mt: 2, 
        p: { xs: 1, sm: 2 }, 
        backgroundColor: 'background.default', 
        borderRadius: 1 
      }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
          Dummy Data Explanation:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2, 
            fontStyle: 'italic',
            fontSize: { xs: '0.75rem', md: '0.875rem' }
          }}
        >
          <strong>Important:</strong> Y-axis represents combined volume from both buy and sell sides. 
          Total buy volume: 10.0 BTC, Total sell volume: 8.0 BTC, Combined total: 18.0 BTC
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
          gap: 2 
        }}>
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#26a69a', 
                fontWeight: 'bold',
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              Buy Orders (Bids) - 15 levels:
            </Typography>
            <Typography 
              variant="body2" 
              component="div" 
              sx={{ 
                fontSize: { xs: '10px', md: '11px' }, 
                lineHeight: 1.3 
              }}
            >
              • $95,500: 0.2 BTC (Total: 0.2)<br />
              • $95,400: 0.3 BTC (Total: 0.5)<br />
              • $95,300: 0.4 BTC (Total: 0.9)<br />
              • $95,200: 0.6 BTC (Total: 1.5)<br />
              • $95,100: 0.8 BTC (Total: 2.3)<br />
              • $95,000: 1.1 BTC (Total: 3.4)<br />
              • $94,900: 0.9 BTC (Total: 4.3)<br />
              • $94,800: 1.3 BTC (Total: 5.6)<br />
              • ... down to $94,100 (Total: 10.0 BTC)
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#ef5350', 
                fontWeight: 'bold',
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              Sell Orders (Asks) - 15 levels:
            </Typography>
            <Typography 
              variant="body2" 
              component="div" 
              sx={{ 
                fontSize: { xs: '10px', md: '11px' }, 
                lineHeight: 1.3 
              }}
            >
              • $95,600: 0.1 BTC (Total: 0.1)<br />
              • $95,700: 0.2 BTC (Total: 0.3)<br />
              • $95,800: 0.3 BTC (Total: 0.6)<br />
              • $95,900: 0.4 BTC (Total: 1.0)<br />
              • $96,000: 0.5 BTC (Total: 1.5)<br />
              • $96,100: 0.6 BTC (Total: 2.1)<br />
              • $96,200: 0.8 BTC (Total: 2.9)<br />
              • $96,300: 0.7 BTC (Total: 3.6)<br />
              • ... up to $97,000 (Total: 8.0 BTC)
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DepthChartExample;

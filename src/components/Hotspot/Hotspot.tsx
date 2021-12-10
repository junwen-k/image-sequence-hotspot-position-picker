import { keyframes } from '@emotion/react';
import { Paper } from '@mui/material';
import { alpha, hexToRgb, styled } from '@mui/material/styles';

export interface HotspotProps {
  left?: number;
  top?: number;
  size: number;
}

const Hotspot = styled(Paper, {
  shouldForwardProp: (prop) =>
    prop !== 'size' && prop !== 'left' && prop !== 'top',
})<HotspotProps>(({ size, left, top, theme }) => {
  const RippleAnimation = keyframes`
    0% {
      box-shadow: 0 0 0 0 ${alpha(hexToRgb(theme.palette.primary.main), 0.2)};
    }
    100% {
      box-shadow: 0 0 0 1.5rem rgba(0, 0, 0, 0);
    }
  `;
  return {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '100%',
    padding: size,
    position: 'absolute',
    animation: `${RippleAnimation} 1.25s linear infinite`,
    ...(left && { left: `${left}%` }),
    ...(top && { top: `${top}%` }),
  };
});

export default Hotspot;

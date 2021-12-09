import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MarkerProps {
  left?: number;
  top?: number;
  size: number;
}

const Marker = styled(Paper, {
  shouldForwardProp: (prop) =>
    prop !== 'size' && prop !== 'left' && prop !== 'top',
})<MarkerProps>(({ size, left, top, theme }) => ({
  backgroundColor: theme.palette.primary.main,
  // border: `1px solid ${theme.palette.primary.light}`,
  borderRadius: '100%',
  padding: size,
  position: 'absolute',
  ...(left && { left: `${left}%` }),
  ...(top && { top: `${top}%` }),
}));

export default Marker;

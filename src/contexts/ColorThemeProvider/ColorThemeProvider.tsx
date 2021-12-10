import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  createTheme,
  PaletteMode,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';

export const ColorModeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useColorModeContext = () => useContext(ColorModeContext);

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#007fff' },
          secondary: { main: '#9c27b0' },
        }
      : {
          primary: { main: '#5090d3' },
          secondary: { main: '#ce93d8' },
        }),
  },
  typography: {
    fontFamily: ['Nunito Sans', 'Arial'].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          // IE
          msScrollbarFaceColor: grey[500],
          msScrollbarShadowColor: grey[500],
          msScrollbarDarkshadowColor: grey[500],
          msScrollbarTrackColor: alpha(grey[500], 0.4),
          msScrollbarArrowColor: grey[500],
          // FireFox
          scrollbarColor: alpha(grey[500], 0.4),
          scrollbarWidth: 'thin',
          '&:hover': {
            // IE
            msScrollbarTrackColor: alpha(grey[500], 0.6),
            // FireFox
            scrollbarColor: alpha(grey[500], 0.6),
          },
        },
        // Chrome
        '*::-webkit-scrollbar': {
          width: '0.5rem',
          height: '0.5rem',
        },
        '*::-webkit-scrollbar-button': {
          width: 0,
          height: 0,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(grey[500], 0.4),
          borderRadius: 4,
          '&:hover': {
            backgroundColor: alpha(grey[500], 0.6),
          },
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'unset',
        },
      },
    },
  },
});

const ColorThemeProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [mode, setMode] = useState<'light' | 'dark'>(
    useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
  );

  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const context = {
    mode,
    toggleColorMode,
  };
  return (
    <ColorModeContext.Provider value={context}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorThemeProvider;

import Highlight, { defaultProps } from 'prism-react-renderer';
import React, { useCallback, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  GitHub as GitHubIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import {
  Alert,
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  createTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputBase,
  InputLabel,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';

import { Marker } from './components';

const StandardImg = styled('img')({
  maxWidth: '100%',
});

const PreviewImg = styled(StandardImg)({
  cursor: 'crosshair',
});

const Pre = styled('pre')(({ theme }) => ({
  fontSize: theme.typography.pxToRem(10),
  margin: 0,
  padding: theme.spacing(2),
}));

const PositionInput = styled(InputBase)({
  width: '100%',
});

interface Image {
  id: string;
  file: File;
  imgSrc: string;
}

interface Position {
  left: number;
  top: number;
}

const theme = createTheme({
  palette: {
    primary: { main: '#007FFF' },
    secondary: { main: '#9c27b0' },
  },
});

const MARKER_SIZE = 6;

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [activeImageID, setActiveImageID] = useState<string | undefined>();

  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isTabletBelow = useMediaQuery(theme.breakpoints.down('md'));

  useBeforeunload((e) => {
    if (images.length) {
      e.preventDefault();
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const images = acceptedFiles.map((file) => ({
      id: uuidv4(),
      file,
      imgSrc: URL.createObjectURL(file),
    }));
    setImages((prevImages) => [...prevImages, ...images]);

    // Default to first image.
    setActiveImageID(images[0]?.id);

    const positions = images.reduce(
      (res, image) => ({
        ...res,
        [image.id]: { left: undefined, top: undefined },
      }),
      {}
    );
    setPositions((prevPositions) => ({ ...prevPositions, ...positions }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',
    onDrop,
  });

  const handlePlotHotspot = (
    e: React.MouseEvent<HTMLImageElement>,
    image: Image
  ) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - MARKER_SIZE - rect.left;
    const y = e.clientY - MARKER_SIZE - rect.top;
    const left = +((x / rect.width) * 100).toFixed(2);
    const top = +((y / rect.height) * 100).toFixed(2);
    setPositions((prevPositions) => ({
      ...prevPositions,
      [image.id]: { left, top },
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    imageID: string
  ) => {
    setPositions((prevPositions) => ({
      ...prevPositions,
      [imageID]: {
        ...prevPositions[imageID],
        [e.target.name]: Number(e.target.value),
      },
    }));
  };

  const handlePreviousImage = () => {
    const currentImgIndex = images.findIndex(
      (image) => activeImageID === image.id
    );
    if (currentImgIndex > -1 && currentImgIndex > 0) {
      setActiveImageID(images[currentImgIndex - 1].id);
    }
  };

  const handleNextImage = () => {
    const currentImgIndex = images.findIndex(
      (image) => activeImageID === image.id
    );
    if (currentImgIndex > -1 && currentImgIndex < images.length - 1) {
      setActiveImageID(images[currentImgIndex + 1].id);
    }
  };

  const handleDeleteImage = (imageID: string) => {
    if (imageID === activeImageID) {
      setActiveImageID(undefined);
    }
    setImages((prevImages) => {
      const newImages = [...prevImages];
      const idx = newImages.findIndex((i) => i.id === imageID);
      if (idx > -1) {
        newImages.splice(idx, 1);
      }
      return newImages;
    });
    setPositions((prevPositions) => {
      const newPositions = { ...prevPositions };
      delete newPositions[imageID];
      return newPositions;
    });
  };

  const isPositionSet = (imageID: string) =>
    positions[imageID] && positions[imageID].left && positions[imageID].top;

  const renderImageUploader = () => (
    <Box p={2} {...getRootProps()}>
      <input {...getInputProps()} />
      <Box
        sx={{
          border: (theme) => `1px dotted ${theme.palette.primary.main}`,
          minHeight: 400,
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      >
        {isDragActive ? (
          <AddIcon color="primary" fontSize="large" />
        ) : (
          <FileUploadIcon color="primary" fontSize="large" />
        )}
      </Box>
    </Box>
  );

  const renderPositionTable = () => (
    <TableContainer
      component="aside"
      sx={{
        borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
        height: '100%',
        maxHeight: !isTabletBelow ? 750 : undefined,
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Tooltip title="JSON">
                <IconButton onClick={() => setOpen((prevOpen) => !prevOpen)}>
                  <CodeIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
            <TableCell align="right">
              <InputLabel>Left (%)</InputLabel>
            </TableCell>
            <TableCell align="right">
              <InputLabel>Top (%)</InputLabel>
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(positions).map(([imageID, position]) => (
            <TableRow key={imageID} hover>
              <TableCell>
                <Switch
                  value={imageID}
                  checked={activeImageID === imageID}
                  onChange={(e) => setActiveImageID(e.target.value)}
                />
              </TableCell>
              <TableCell align="right">
                <PositionInput
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.1,
                    style: { textAlign: 'right' },
                  }}
                  name="left"
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => handleInputChange(e, imageID)}
                  value={position.left ?? 0}
                />
              </TableCell>
              <TableCell align="right">
                <PositionInput
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.1,
                    style: { textAlign: 'right' },
                  }}
                  name="top"
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => handleInputChange(e, imageID)}
                  value={position.top ?? 0}
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDeleteImage(imageID)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCopySnackbar = () => (
    <Snackbar
      autoHideDuration={6000}
      open={snackbarOpen}
      onClose={(e, reason) => reason !== 'clickaway' && setSnackbarOpen(false)}
    >
      <Alert onClose={() => setSnackbarOpen(false)}>
        Successfully copied to clipboard
      </Alert>
    </Snackbar>
  );

  const renderCodeDialog = () => (
    <Dialog scroll="paper" fullWidth onClose={() => setOpen(false)} open={open}>
      <DialogTitle>JSON</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Highlight
          {...defaultProps}
          code={JSON.stringify(Object.values(positions), null, 2)}
          language="json"
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <Pre className={className} style={style}>
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </Pre>
          )}
        </Highlight>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            window.navigator.clipboard.writeText(
              JSON.stringify(Object.values(positions), null, 2)
            );
            setSnackbarOpen(true);
          }}
          color="primary"
        >
          Copy
        </Button>
        <Button onClick={() => setOpen(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderImageStack = () => (
    <Stack spacing={2} direction="row" sx={{ p: 2, overflow: 'auto' }}>
      {images.map((image) => (
        <Card
          variant="outlined"
          key={image.id}
          title={image.file.name}
          sx={{
            flex: '0 0 16.67%',
            ...(activeImageID === image.id && {
              border: (theme) => `1px solid ${theme.palette.primary.main}`,
            }),
          }}
        >
          <CardActionArea onClick={() => setActiveImageID(image.id)}>
            <CardMedia
              component="img"
              image={image.imgSrc}
              alt={image.file.name}
            />
            <CardContent
              sx={{
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {image.file.name}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
      <Card variant="outlined" title="Add" sx={{ flex: '0 0 16.67%' }}>
        <CardActionArea
          component="label"
          sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
        >
          <input {...getInputProps()} />
          <AddIcon fontSize="large" color="action" />
        </CardActionArea>
      </Card>
    </Stack>
  );

  const renderImageCanvas = (image: Image) => (
    <>
      <Box display="flex" position="relative">
        <PreviewImg
          alt={image.file.name}
          onMouseDown={(e) => handlePlotHotspot(e, image)}
          src={image.imgSrc}
        />
        {isPositionSet(image.id) && (
          <Tooltip title={JSON.stringify(positions[image.id])}>
            <Marker
              size={MARKER_SIZE}
              left={positions[image.id].left}
              top={positions[image.id].top}
            />
          </Tooltip>
        )}
      </Box>
      <Divider />
      <Box display="flex" justifyContent="center" alignItems="center" p={1}>
        <Tooltip title="Previous">
          <span>
            <IconButton disabled={isFirstImage} onClick={handlePreviousImage}>
              <ChevronLeftIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ mx: 2 }}>
          {image.file.name}
        </Typography>
        <Tooltip title="Next">
          <span>
            <IconButton disabled={isLastImage} onClick={handleNextImage}>
              <ChevronRightIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </>
  );

  const isFirstImage =
    images.findIndex((image) => image.id === activeImageID) === 0;

  const isLastImage =
    images.findIndex((image) => image.id === activeImageID) ===
    images.length - 1;

  const activeImage = images.find((image) => image.id === activeImageID);

  return (
    <main>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <AppBar>
          <Toolbar
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="subtitle1">
              Image Sequence Position Picker
            </Typography>
            <div>
              <Tooltip title="GitHub repository">
                <IconButton
                  color="inherit"
                  href={process.env.REACT_APP_GITHUB_REPOSITORY_URL as string}
                  target="_blank"
                  rel="noreferrer noopener"
                  sx={{ mr: 1 }}
                >
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" color="inherit">
                v{process.env.REACT_APP_VERSION}
              </Typography>
            </div>
          </Toolbar>
        </AppBar>
        <Toolbar />
        {renderCodeDialog()}
        {renderCopySnackbar()}
        <Container>
          <Paper sx={{ my: 4 }}>
            {!images.length ? (
              renderImageUploader()
            ) : (
              <Grid container>
                <Grid item xs={12} md={8}>
                  {activeImage ? (
                    renderImageCanvas(activeImage)
                  ) : (
                    <Box
                      p={2}
                      minHeight={300}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ImageIcon color="action" fontSize="large" />
                    </Box>
                  )}
                  <Divider />
                  {renderImageStack()}
                  <Divider />
                </Grid>
                <Grid item xs={12} md={4}>
                  {renderPositionTable()}
                </Grid>
              </Grid>
            )}
          </Paper>
        </Container>
      </ThemeProvider>
    </main>
  );
}

export default App;

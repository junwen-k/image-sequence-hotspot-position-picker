import '@fontsource/nunito-sans';

import Highlight, { defaultProps } from 'prism-react-renderer';
import React, { useCallback, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useDropzone } from 'react-dropzone';
import { useHotkeys } from 'react-hotkeys-hook';
import { v4 as uuidv4 } from 'uuid';

import {
  Add as AddIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  HighlightOff as HighlightOffIcon,
  ImageOutlined as ImageOutlinedIcon,
} from '@mui/icons-material';
import {
  Alert,
  AppBar as MuiAppBar,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  IconButtonProps,
  InputBase,
  InputLabel,
  Link,
  Paper,
  Snackbar,
  Stack,
  Switch,
  SwitchProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled, Theme } from '@mui/material/styles';
import { Box } from '@mui/system';

import { Hotspot, ImageDropzoneUploader } from './components';
import { ColorThemeProvider, useColorModeContext } from './contexts';

const HOTSPOT_SIZE = 6;

interface Image {
  id: string;
  file: File;
  imgSrc: string;
}

interface Position {
  left: number;
  top: number;
}

type Positions = Record<string, Position>;

const AppBar = () => {
  const { mode, toggleColorMode } = useColorModeContext();
  return (
    <MuiAppBar
      sx={{
        backgroundColor: (theme) =>
          mode === 'dark'
            ? theme.palette.background.default
            : theme.palette.primary.main,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">Position Picker</Typography>
        <Stack spacing={1} direction="row">
          <Tooltip title={`Turn ${mode === 'light' ? 'off' : 'on'} the light`}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub repository">
            <IconButton
              color="inherit"
              href={process.env.REACT_APP_GITHUB_REPOSITORY_URL as string}
              target="_blank"
              rel="noreferrer noopener"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </MuiAppBar>
  );
};

interface PositionTableProps {
  activeImageID?: string;
  positions: Positions;
  onCodeOpen: IconButtonProps['onClick'];
  onDeleteAll: IconButtonProps['onClick'];
  onClearAll: IconButtonProps['onClick'];
  onSwitchChange: SwitchProps['onChange'];
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    imageID: string
  ) => void;
  onDelete: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    imageID: string
  ) => void;
  onClear: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    imageID: string
  ) => void;
}

const PositionTable = ({
  activeImageID,
  positions,
  onCodeOpen,
  onDeleteAll,
  onClearAll,
  onSwitchChange,
  onInputChange,
  onDelete,
  onClear,
}: PositionTableProps) => {
  const isTabletBelow = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );

  return (
    <TableContainer
      component="aside"
      sx={{
        ...(isTabletBelow
          ? {
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }
          : {
              borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
            }),
        background: (theme) => theme.palette.background.paper,
        height: '100%',
        maxHeight: !isTabletBelow ? 750 : undefined,
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ background: (theme) => theme.palette.background.paper }}
            >
              <Tooltip title="JSON">
                <IconButton onClick={onCodeOpen}>
                  <CodeIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
            <TableCell
              sx={{ background: (theme) => theme.palette.background.paper }}
              align="right"
            >
              <InputLabel>Left (%)</InputLabel>
            </TableCell>
            <TableCell
              sx={{ background: (theme) => theme.palette.background.paper }}
              align="right"
            >
              <InputLabel>Top (%)</InputLabel>
            </TableCell>
            <TableCell
              sx={{
                background: (theme) => theme.palette.background.paper,
                width: (theme) => theme.spacing(1),
              }}
            >
              <Tooltip title="Clear All">
                <IconButton onClick={onClearAll}>
                  <HighlightOffIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
            <TableCell
              sx={{ background: (theme) => theme.palette.background.paper }}
            >
              <Tooltip title="Delete All">
                <IconButton onClick={onDeleteAll}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(positions).map(([imageID, position]) => (
            <TableRow key={imageID} hover>
              <TableCell>
                <Switch
                  value={imageID}
                  checked={activeImageID === imageID}
                  onChange={onSwitchChange}
                />
              </TableCell>
              <TableCell align="right">
                <InputBase
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.01,
                    style: { textAlign: 'right' },
                  }}
                  name="left"
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => onInputChange(e, imageID)}
                  value={position.left ?? 0}
                />
              </TableCell>
              <TableCell align="right">
                <InputBase
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.01,
                    style: { textAlign: 'right' },
                  }}
                  name="top"
                  type="number"
                  placeholder="0.00"
                  onChange={(e) => onInputChange(e, imageID)}
                  value={position.top ?? 0}
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Clear">
                  <IconButton onClick={(e) => onClear(e, imageID)}>
                    <HighlightOffIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip title="Delete">
                  <IconButton onClick={(e) => onDelete(e, imageID)}>
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
};

interface DeleteAllDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAllDialog = ({
  open,
  onClose,
  onConfirm,
}: DeleteAllDialogProps) => (
  <Dialog fullWidth onClose={onClose} open={open}>
    <DialogTitle>Delete All</DialogTitle>
    <DialogContent dividers>
      <Typography>Are you sure you want to delete all images?</Typography>
      <Typography variant="caption" color="text.secondary">
        *You cannot undo this action
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button onClick={onConfirm} color="primary">
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

interface CopySnackbarProps {
  open: boolean;
  onClose: () => void;
}

const CopySnackbar = ({ open, onClose }: CopySnackbarProps) => (
  <Snackbar
    autoHideDuration={6000}
    open={open}
    onClose={(e, reason) => reason !== 'clickaway' && onClose()}
  >
    <Alert onClose={onClose}>Successfully copied to clipboard</Alert>
  </Snackbar>
);

interface ContentSectionProps {
  title: string;
}

const ContentSection = ({
  children,
  title,
}: React.PropsWithChildren<ContentSectionProps>) => (
  <Box component="section" my={4}>
    <Typography gutterBottom variant="h5" sx={{ fontWeight: 'bold' }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const Footer = () => (
  <Box component="footer" textAlign="center" p={2}>
    <Typography variant="caption" color="text.secondary">
      v{process.env.REACT_APP_VERSION}
    </Typography>
  </Box>
);

const ImageCanvasPreviewImg = styled('img')({
  maxWidth: '100%',
  cursor: 'crosshair',
});

const ImageCanvasWrapper = styled('div')({
  display: 'flex',
  position: 'relative',
});

const ImageCanvasCaptionWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(1),
}));

const EmptyImageCanvasRoot = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const EmptyImageCanvas = () => (
  <EmptyImageCanvasRoot>
    <Box textAlign="center">
      <ImageOutlinedIcon color="action" fontSize="large" />
      <Typography gutterBottom color="text.secondary" variant="subtitle2">
        Select an image from the carousel below to begin
      </Typography>
    </Box>
  </EmptyImageCanvasRoot>
);

interface ImageStackProps {
  activeImageID?: string;
  images: Image[];
  inputProps: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  onChange: (imageID: string) => void;
}

const ImageStack = ({
  activeImageID,
  images,
  inputProps,
  onChange,
}: ImageStackProps) => {
  const isTabletBelow = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );

  return (
    <Stack spacing={2} direction="row" sx={{ p: 2, overflow: 'auto' }}>
      {images.map((image) => (
        <Card
          variant="outlined"
          key={image.id}
          title={image.file.name}
          sx={{
            flex: `0 0 ${isTabletBelow ? 33.34 : 16.67}%`,
            ...(activeImageID === image.id && {
              border: (theme) => `1px solid ${theme.palette.primary.main}`,
            }),
          }}
        >
          <CardActionArea onClick={() => onChange(image.id)}>
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
      <Card
        variant="outlined"
        title="Add"
        sx={{ flex: `0 0 ${isTabletBelow ? 33.34 : 16.67}%` }}
      >
        <CardActionArea
          component="label"
          sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
        >
          <input type="file" hidden {...inputProps} />
          <AddIcon fontSize="large" color="action" />
        </CardActionArea>
      </Card>
    </Stack>
  );
};

const CodeDialogPre = styled('pre')(({ theme }) => ({
  fontSize: theme.typography.pxToRem(10),
  margin: 0,
  padding: theme.spacing(2),
}));

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [positions, setPositions] = useState<Positions>({});
  const [activeImageID, setActiveImageID] = useState<string | undefined>();

  const [open, setOpen] = useState({
    codeDialog: false,
    copySnackbar: false,
    deleteDialog: false,
  });

  const updateOpen = (name: keyof typeof open, newOpen: boolean) =>
    setOpen((prevOpen) => ({ ...prevOpen, [name]: newOpen }));

  useBeforeunload((e) => {
    if (images.length) {
      e.preventDefault();
    }
  });

  const onImagesUpload = useCallback((acceptedFiles: File[]) => {
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

  const {
    open: openUpload,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: 'image/*',
    onDrop: onImagesUpload,
    noClick: true,
  });

  const handlePlotHotspot = (
    e: React.MouseEvent<HTMLImageElement>,
    image: Image
  ) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - HOTSPOT_SIZE - rect.left;
    const y = e.clientY - HOTSPOT_SIZE - rect.top;
    const left = +((x / rect.width) * 100).toFixed(2);
    const top = +((y / rect.height) * 100).toFixed(2);
    setPositions((prevPositions) => ({
      ...prevPositions,
      [image.id]: {
        left: e.button === 2 ? 0 : left,
        top: e.button === 2 ? 0 : top,
      },
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

  useHotkeys('ctrl+left', handlePreviousImage, [activeImageID, images]);
  useHotkeys('ctrl+right', handleNextImage, [activeImageID, images]);

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

  const renderCodeDialog = () => {
    const code = `[\n${Object.values(positions)
      .map(
        (position) =>
          `  { "left": ${position.left || 0}, "top": ${position.top || 0} },`
      )
      .join('\n')}\n]`;
    return (
      <Dialog
        scroll="paper"
        fullWidth
        onClose={() => updateOpen('codeDialog', false)}
        open={open.codeDialog}
      >
        <DialogTitle>JSON</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Highlight {...defaultProps} code={code} language="json">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <CodeDialogPre className={className} style={style}>
                {tokens.map((line, i) => (
                  <div {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                      <span {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                ))}
              </CodeDialogPre>
            )}
          </Highlight>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              window.navigator.clipboard.writeText(code);
              updateOpen('copySnackbar', true);
            }}
            color="primary"
          >
            Copy
          </Button>
          <Button
            onClick={() => updateOpen('codeDialog', false)}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleResetPosition = (imageID: string) => {
    setPositions((prevPositions) => ({
      ...prevPositions,
      [imageID]: { left: 0, top: 0 },
    }));
  };

  const renderImageCanvas = (image: Image) => (
    <>
      <ImageCanvasWrapper>
        <ImageCanvasPreviewImg
          alt={image.file.name}
          onMouseDown={(e) => handlePlotHotspot(e, image)}
          onContextMenu={(e) => {
            handleResetPosition(image.id);
            e.preventDefault();
            return false;
          }}
          src={image.imgSrc}
        />
        {isPositionSet(image.id) && (
          <Tooltip title={JSON.stringify(positions[image.id])}>
            <Hotspot
              size={HOTSPOT_SIZE}
              left={positions[image.id].left}
              top={positions[image.id].top}
            />
          </Tooltip>
        )}
      </ImageCanvasWrapper>
      <Divider />
      <ImageCanvasCaptionWrapper>
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
      </ImageCanvasCaptionWrapper>
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
      <ColorThemeProvider>
        <CssBaseline enableColorScheme />
        <AppBar />
        <Toolbar />
        <DeleteAllDialog
          open={open.deleteDialog}
          onClose={() => updateOpen('deleteDialog', false)}
          onConfirm={() => {
            updateOpen('deleteDialog', false);
            setImages([]);
            setPositions({});
          }}
        />
        {renderCodeDialog()}
        <CopySnackbar
          open={open.copySnackbar}
          onClose={() => updateOpen('copySnackbar', false)}
        />
        <Container>
          <Paper variant="outlined" sx={{ my: 4 }}>
            {!images.length ? (
              <ImageDropzoneUploader
                {...getRootProps()}
                active={isDragActive}
                inputProps={getInputProps()}
                onOpen={openUpload}
              />
            ) : (
              <Grid container>
                <Grid item xs={12} md={8}>
                  {activeImage ? (
                    renderImageCanvas(activeImage)
                  ) : (
                    <EmptyImageCanvas />
                  )}
                  <Divider />
                  <ImageStack
                    activeImageID={activeImageID}
                    images={images}
                    inputProps={getInputProps()}
                    onChange={(imageID) => setActiveImageID(imageID)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <PositionTable
                    activeImageID={activeImageID}
                    positions={positions}
                    onCodeOpen={() => updateOpen('codeDialog', true)}
                    onDeleteAll={() => updateOpen('deleteDialog', true)}
                    onClearAll={() =>
                      setPositions((prevPositions) =>
                        Object.keys(prevPositions).reduce(
                          (res, key) => ({
                            ...res,
                            [key]: { left: 0, top: 0 },
                          }),
                          {}
                        )
                      )
                    }
                    onSwitchChange={(e) => setActiveImageID(e.target.value)}
                    onInputChange={handleInputChange}
                    onDelete={(e, imageID) => handleDeleteImage(imageID)}
                    onClear={(e, imageID) => handleResetPosition(imageID)}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>
          <ContentSection title="About">
            <Typography variant="subtitle1">
              This little tool is built to ease the process of marking
              "hotspot(s)" for an image sequence. E.g, a hotspot that changes
              its position based on the current frame of the image sequence. The
              computed values are nothing more than plain parent relative with
              children absolute positioning in percentage (%). The position
              array is mapped based on the sequence of the images.
            </Typography>
          </ContentSection>
          <ContentSection title="License">
            <Link
              href={`${process.env.REACT_APP_GITHUB_REPOSITORY_URL}/LICENSE.txt`}
              target="_blank"
              rel="noreferrer noopener"
            >
              MIT
            </Link>
          </ContentSection>
          <Divider />
          <Footer />
        </Container>
      </ColorThemeProvider>
    </main>
  );
}

export default App;

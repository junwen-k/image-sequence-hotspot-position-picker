import React from 'react';

import { ImageOutlined as ImageOutlinedIcon } from '@mui/icons-material';
import { Box, Button, ButtonProps, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ImageDropzoneUploaderProps {
  inputProps: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  active?: boolean;
  onOpen?: ButtonProps['onClick'];
}

const ImageDropzoneUploaderRoot = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));

interface ImageDropzoneUploaderDropzoneProps {
  active?: boolean;
}

const ImageDropzoneUploaderDropzone = styled('div', {
  shouldForwardProp: (prop) => prop !== 'active',
})<ImageDropzoneUploaderDropzoneProps>(({ active, theme }) => ({
  borderRadius: 1,
  border: active
    ? `1.75px dotted ${theme.palette.primary.main}`
    : `1px dotted ${theme.palette.divider}`,
  transition: theme.transitions.create('border'),
  minHeight: 400,
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
}));

const ImageDropzoneUploaderButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ImageDropzoneUploader = React.forwardRef(function ImageDropzoneUploader(
  { active, inputProps, onOpen, ...other }: ImageDropzoneUploaderProps,
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <ImageDropzoneUploaderRoot ref={ref} {...other}>
      <input type="file" hidden {...inputProps} />
      <ImageDropzoneUploaderDropzone active={active}>
        <Box textAlign="center">
          <ImageOutlinedIcon color="action" fontSize="large" />
          <Typography gutterBottom color="text.secondary" variant="subtitle2">
            Drag and drop image(s)
          </Typography>
          <ImageDropzoneUploaderButton
            onClick={onOpen}
            color="primary"
            variant="contained"
          >
            Browse
          </ImageDropzoneUploaderButton>
        </Box>
      </ImageDropzoneUploaderDropzone>
    </ImageDropzoneUploaderRoot>
  );
});

export default ImageDropzoneUploader;

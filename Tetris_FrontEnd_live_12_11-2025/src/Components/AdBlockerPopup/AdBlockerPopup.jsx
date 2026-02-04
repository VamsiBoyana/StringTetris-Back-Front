// components/AdBlockerPopup.js
import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const AdBlockerPopup = ({ onClose }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          background: 'rgba(10, 10, 20, 0.95)',
          border: '1.5px solid #00bfff',
          boxShadow: '0 0 16px #00bfff55',
          Width: "90%",
          padding: '32px 28px 24px 28px',
          position: 'relative',
          borderRadius: '16px',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ color: '#00bfff', fontWeight: 700,fontSize: "20px", letterSpacing: 1 }}  gutterBottom>
          Ad Blocker Detected
        </Typography>
        <Typography variant="body1" sx={{ color: '#ccc', fontSize: 15, }} gutterBottom>
          It looks like you have an ad blocker enabled. Please disable it to continue using our services.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{
            width: '100%',
            padding: '5px',
            fontSize: '15px',
            fontWeight: 500,
            background: 'linear-gradient(90deg, #00bfff 0%, #b266ff 100%)',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 12px #00bfff44',
            mt: 2,
            textTransform: 'none',
            letterSpacing: 1.2,
            '&:hover': {
              background: 'linear-gradient(90deg, #0099cc 0%, #8f3fff 100%)'
            }
          }}
        >
          Retry
        </Button>
      </Box>
    </Box>
  );
};

export default AdBlockerPopup;

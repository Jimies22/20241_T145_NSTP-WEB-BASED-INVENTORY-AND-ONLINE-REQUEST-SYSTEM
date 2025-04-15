import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';
import '../../css/Scanner.css';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const newScanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
      aspectRatio: 1.0,
      formatsToSupport: ['QR_CODE'],
    });

    setScanner(newScanner);

    newScanner.render(
      async (decodedText) => {
        if (isScanning) {
          console.log('Raw QR Code detected:', decodedText);
          const cleanedText = decodedText.trim();
          
          // Disable scanning immediately after first successful scan
          setIsScanning(false);
          
          // Stop the scanner
          try {
            await newScanner.stop();
          } catch (error) {
            console.warn('Error stopping scanner:', error);
          }
          
          console.log('Cleaned QR Code:', cleanedText);
          onScanSuccess(cleanedText);
        }
      },
      (error) => {
        console.warn('QR Scan error:', error);
        onScanError(error);
      }
    );

    return () => {
      if (newScanner) {
        newScanner.clear();
      }
    };
  }, [onScanSuccess, onScanError, isScanning]);

  const stopScanner = () => {
    if (scanner) {
      setIsScanning(false);
      scanner.clear();
    }
  };

  return (
    <div className="qr-scanner-container">
      <div id="reader"></div>
      <button 
        onClick={stopScanner}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Stop Scanner
      </button>
    </div>
  );
};

export default QRScanner;

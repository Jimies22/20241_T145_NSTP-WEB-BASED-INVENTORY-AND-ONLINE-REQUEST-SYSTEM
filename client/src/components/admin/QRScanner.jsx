import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  useEffect(() => {
    // Create instance of scanner
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
      rememberLastUsedCamera: true,
    });

    // Start scanning
    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear();
      },
      (error) => {
        onScanError(error);
      }
    );

    // Cleanup
    return () => {
      scanner.clear();
    };
  }, [onScanSuccess, onScanError]);

  return <div id="reader"></div>;
};

export default QRScanner;

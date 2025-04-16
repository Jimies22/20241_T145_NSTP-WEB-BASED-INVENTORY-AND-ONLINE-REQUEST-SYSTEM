import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';
import '../../css/Scanner.css';

const QRScanner = ({ onScanSuccess, onScanError, onScannerMounted }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Create scanner with better error handling
    try {
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

      // Notify parent component about the scanner instance
      if (onScannerMounted && typeof onScannerMounted === 'function') {
        onScannerMounted(newScanner);
      }

      newScanner.render(
        async (decodedText) => {
          if (isScanning) {
            console.log('Raw QR Code detected:', decodedText);
            const cleanedText = decodedText.trim();
            
            // Disable scanning immediately after first successful scan
            setIsScanning(false);
            
            // Stop the scanner
            try {
              await newScanner.clear();
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
    } catch (initError) {
      console.error("Error initializing QR scanner:", initError);
      onScanError(initError);
    }

    // Improved cleanup function
    return () => {
      if (scanner) {
        try {
          console.log("Cleaning up scanner in useEffect cleanup");
          setIsScanning(false);
          scanner.clear();
          
          // Remove any remaining elements
          setTimeout(() => {
            try {
              const elementsToRemove = document.querySelectorAll('.html5-qrcode-element');
              elementsToRemove.forEach(el => el.remove());
            } catch (e) {
              console.warn("Error in final cleanup:", e);
            }
          }, 100);
        } catch (cleanupError) {
          console.warn('Error cleaning up scanner:', cleanupError);
        }
      }
    };
  }, [onScanSuccess, onScanError, onScannerMounted, isScanning]);

  const stopScanner = () => {
    try {
      if (scanner) {
        setIsScanning(false);
        scanner.clear();
        
        // Close the Swal modal if this button is clicked
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          Swal.close();
        }
      }
    } catch (error) {
      console.warn("Error stopping scanner:", error);
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

QRScanner.defaultProps = {
  onScanSuccess: () => {},
  onScanError: () => {},
  onScannerMounted: () => {}
};

export default QRScanner;

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanner, setScanner] = useState(null);
  const [lastScanned, setLastScanned] = useState('');
  const [scanTimeout, setScanTimeout] = useState(null);

  // Create success sound
  const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2220/2220-preview.mp3');

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
        console.log('Raw QR Code detected:', decodedText);
        const cleanedText = decodedText.trim();
        
        if (cleanedText !== lastScanned) {
          setLastScanned(cleanedText);
          
          if (scanTimeout) {
            clearTimeout(scanTimeout);
          }
          
          const timeout = setTimeout(() => {
            setLastScanned('');
          }, 2000);
          
          setScanTimeout(timeout);
          
          // Play success sound
          try {
            await successSound.play();
          } catch (error) {
            console.warn('Could not play success sound:', error);
          }

          // Show success message with longer duration and close button
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'QR Code Successfully Scanned!',
            text: 'The item has been processed.',
            showConfirmButton: true,
            confirmButtonText: 'Close',
            confirmButtonColor: '#28a745',
            timer: 5000, // Stays for 5 seconds if not closed
            timerProgressBar: true, // Shows a progress bar
            toast: true,
            background: '#a5dc86',
            color: '#fff',
            customClass: {
              popup: 'animated slideInRight',
              confirmButton: 'btn btn-success'
            },
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });

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
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, []);

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
    }
    if (scanTimeout) {
      clearTimeout(scanTimeout);
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

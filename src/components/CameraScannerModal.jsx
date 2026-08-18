import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
import { X, Camera, SwitchCamera, AlertCircle, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';

const mapZXingFormatToAppFormat = (formatId) => {
  if (formatId === BarcodeFormat.UPC_A || formatId === 14 || formatId === 'upc_a') return 'UPC';
  if (formatId === BarcodeFormat.EAN_13 || formatId === 6 || formatId === 'ean_13') return 'EAN13';
  if (formatId === BarcodeFormat.CODE_128 || formatId === 4 || formatId === 'code_128') return 'CODE128';
  if (formatId === BarcodeFormat.CODE_39 || formatId === 3 || formatId === 'code_39') return 'CODE39';
  if (formatId === BarcodeFormat.EAN_8 || formatId === 7 || formatId === 'ean_8') return 'EAN8';
  if (formatId === BarcodeFormat.QR_CODE || formatId === 11 || formatId === 'qr_code') return 'QR';
  return 'AUTO';
};

export const CameraScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const codeReaderRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  const stopCameraStream = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    stopCameraStream();
    setErrorMessage('');
    setScannedResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or requires HTTPS.');
      }

      // Request stream directly from browser
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);

        // Start ZXing decoding from the active video element
        const reader = new BrowserMultiFormatReader();
        codeReaderRef.current = reader;

        reader.decodeFromVideoElement(videoRef.current, (result, err) => {
          if (result) {
            const text = result.getText();
            const formatEnum = result.getBarcodeFormat();
            const appFormat = mapZXingFormatToAppFormat(formatEnum);

            // Haptic vibration feedback
            try {
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }
            } catch (e) {}

            setScannedResult({ text, format: appFormat });

            // Stop scanner immediately on success
            stopCameraStream();

            // Return result after short animation
            setTimeout(() => {
              onScanSuccess({ codeNumber: text, barcodeType: appFormat });
              onClose();
            }, 650);
          }
        });
      }
    } catch (err) {
      console.warn('Camera launch error:', err);
      let msg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings to scan live.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode]);

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white animate-fadeIn overflow-hidden">
      {/* Header */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6344F5] flex items-center justify-center text-white font-bold shadow-md shadow-[#6344F5]/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold leading-none">Live Camera Scanner</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Point camera at barcode</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFacingMode}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Switch Front/Back Camera"
          >
            <SwitchCamera className="w-4 h-4" />
            <span className="hidden sm:inline">{facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover max-h-[85vh]"
        />

        {/* Viewfinder Target Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-10">
          <div className="relative w-full max-w-xs aspect-[4/3] rounded-3xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] flex flex-col items-center justify-center overflow-hidden">
            
            {/* Animated Laser Scanning Line */}
            {isCameraActive && !scannedResult && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6344F5] to-transparent shadow-[0_0_15px_#6344F5] animate-[bounce_2s_infinite]" />
            )}

            {/* Success Overlay */}
            {scannedResult && (
              <div className="absolute inset-0 bg-[#6344F5]/90 flex flex-col items-center justify-center text-white animate-fadeIn p-4 text-center z-20">
                <CheckCircle className="w-12 h-12 text-emerald-300 mb-2 animate-bounce" />
                <h3 className="text-lg font-bold">Barcode Scanned!</h3>
                <p className="font-mono text-sm bg-black/40 px-3 py-1 rounded-lg mt-1 border border-white/20">
                  {scannedResult.text}
                </p>
              </div>
            )}

            {/* Corner Bracket Details */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-[#6344F5] rounded-tl-xl" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-[#6344F5] rounded-tr-xl" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-[#6344F5] rounded-bl-xl" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-[#6344F5] rounded-br-xl" />
          </div>

          <div className="mt-6 text-center text-slate-300 text-xs bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/60 shadow-lg">
            Hold steady over barcode (Costco, Target, Gym, etc.)
          </div>
        </div>

        {/* Permission / Device Error Screen */}
        {errorMessage && (
          <div className="absolute inset-0 bg-slate-950/95 z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Camera Access Required</h3>
            <p className="text-sm text-slate-400 max-w-xs mb-6">
              {errorMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-[#6344F5] hover:bg-[#5233E0] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

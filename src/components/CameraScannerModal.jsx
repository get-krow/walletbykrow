import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X, Camera, SwitchCamera, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const mapFormatToAppFormat = (fmt) => {
  const str = String(fmt || '').toLowerCase();
  if (str.includes('upc_a') || str.includes('upc') || fmt === BarcodeFormat.UPC_A || fmt === 14) return 'UPC';
  if (str.includes('ean_13') || str.includes('ean13') || fmt === BarcodeFormat.EAN_13 || fmt === 6) return 'EAN13';
  if (str.includes('code_128') || str.includes('code128') || fmt === BarcodeFormat.CODE_128 || fmt === 4) return 'CODE128';
  if (str.includes('code_39') || str.includes('code39') || fmt === BarcodeFormat.CODE_39 || fmt === 3) return 'CODE39';
  if (str.includes('ean_8') || str.includes('ean8') || fmt === BarcodeFormat.EAN_8 || fmt === 7) return 'EAN8';
  if (str.includes('qr') || fmt === BarcodeFormat.QR_CODE || fmt === 11) return 'QR';
  return 'AUTO';
};

export const CameraScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const isScanningRef = useRef(false);

  const [facingMode, setFacingMode] = useState('environment');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  const stopCameraStream = () => {
    isScanningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
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
        isScanningRef.current = true;

        // Initialize ZXing MultiFormatReader with format hints
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.ITF,
          BarcodeFormat.QR_CODE,
        ]);
        const zxingReader = new BrowserMultiFormatReader(hints);

        // Native BarcodeDetector if available in browser
        let nativeDetector = null;
        if ('BarcodeDetector' in window) {
          try {
            nativeDetector = new window.BarcodeDetector({
              formats: ['upc_a', 'upc_e', 'ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'itf'],
            });
          } catch (e) {
            nativeDetector = null;
          }
        }

        // Offscreen canvas for frame capture fallback
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        let lastScanTime = 0;

        const scanFrame = async () => {
          if (!isScanningRef.current || !videoRef.current) return;

          const now = Date.now();
          if (now - lastScanTime > 120 && videoRef.current.readyState === 4) {
            lastScanTime = now;
            const video = videoRef.current;

            let detectedText = null;
            let detectedFormat = 'AUTO';

            // Strategy 1: Native BarcodeDetector (Hardware Accelerated)
            if (nativeDetector) {
              try {
                const barcodes = await nativeDetector.detect(video);
                if (barcodes && barcodes.length > 0) {
                  detectedText = barcodes[0].rawValue;
                  detectedFormat = mapFormatToAppFormat(barcodes[0].format);
                }
              } catch (e) {}
            }

            // Strategy 2: Offscreen Canvas Snapshot + ZXing
            if (!detectedText && video.videoWidth > 0 && video.videoHeight > 0) {
              try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const zResult = zxingReader.decodeFromCanvas(canvas);
                if (zResult) {
                  detectedText = zResult.getText();
                  detectedFormat = mapFormatToAppFormat(zResult.getBarcodeFormat());
                }
              } catch (e) {}
            }

            // Trigger success if barcode found
            if (detectedText) {
              isScanningRef.current = false;

              // Vibration feedback
              try {
                if (navigator.vibrate) {
                  navigator.vibrate([100, 50, 100]);
                }
              } catch (e) {}

              setScannedResult({ text: detectedText, format: detectedFormat });
              stopCameraStream();

              setTimeout(() => {
                onScanSuccess({ codeNumber: detectedText, barcodeType: detectedFormat });
                onClose();
              }, 600);
              return;
            }
          }

          if (isScanningRef.current) {
            animFrameRef.current = requestAnimationFrame(scanFrame);
          }
        };

        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.warn('Camera launch error:', err);
      let msg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on your device.';
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
            <p className="text-[11px] text-slate-400 mt-0.5">Point camera directly at barcode</p>
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
            Hold steady 4-8 inches over barcode in good light
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

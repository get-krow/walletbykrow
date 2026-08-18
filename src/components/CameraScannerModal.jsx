import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
import { X, Camera, SwitchCamera, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

// Map ZXing BarcodeFormat enum / strings to our app format IDs
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
  const codeReaderRef = useRef(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const reader = new BrowserMultiFormatReader();
    codeReaderRef.current = reader;

    setErrorMessage('');
    setScannedResult(null);

    // List camera devices
    reader
      .listVideoInputDevices()
      .then((devices) => {
        if (!isMounted) return;
        setVideoDevices(devices);

        // Pick back camera if available, or first device
        const backCam = devices.find(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        );
        const targetId = backCam ? backCam.deviceId : devices[0]?.deviceId || null;
        setSelectedDeviceId(targetId);
      })
      .catch((err) => {
        console.warn('Error enumerating cameras:', err);
        if (isMounted) {
          setErrorMessage('Camera access required. Please allow camera permissions in your browser settings.');
        }
      });

    return () => {
      isMounted = false;
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [isOpen]);

  // Start video scanning when deviceId and video element ready
  useEffect(() => {
    if (!isOpen || !selectedDeviceId || !videoRef.current || !codeReaderRef.current) return;

    let isSubscribed = true;
    setIsScanning(true);

    codeReaderRef.current.decodeFromVideoDevice(
      selectedDeviceId,
      videoRef.current,
      (result, err) => {
        if (!isSubscribed) return;

        if (result) {
          const text = result.getText();
          const formatEnum = result.getBarcodeFormat();
          const appFormat = mapZXingFormatToAppFormat(formatEnum);

          // Haptic vibration feedback
          try {
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          } catch (e) {
            // ignore
          }

          setScannedResult({ text, format: appFormat });
          setIsScanning(false);

          // Stop scanner immediately upon success
          if (codeReaderRef.current) {
            try {
              codeReaderRef.current.reset();
            } catch (e) {}
          }

          // Delay slightly so user sees checkmark animation
          setTimeout(() => {
            if (isSubscribed) {
              onScanSuccess({ codeNumber: text, barcodeType: appFormat });
              onClose();
            }
          }, 600);
        }
      }
    );

    return () => {
      isSubscribed = false;
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {}
      }
    };
  }, [isOpen, selectedDeviceId, onClose, onScanSuccess]);

  const handleSwitchCamera = () => {
    if (videoDevices.length <= 1) return;
    const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setSelectedDeviceId(videoDevices[nextIndex].deviceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white animate-fadeIn">
      {/* Top Header */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6344F5] flex items-center justify-center text-white font-bold shadow-md shadow-[#6344F5]/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold leading-none">Live Camera Scanner</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Align barcode inside the target box</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {videoDevices.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
              title="Switch Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera Viewport Container */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover max-h-[85vh]"
          playsInline
          muted
        />

        {/* Viewfinder Target Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          {/* Dimmed Background Mask */}
          <div className="relative w-full max-w-xs aspect-[4/3] rounded-3xl border-2 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] flex flex-col items-center justify-center overflow-hidden">
            
            {/* Animated Laser Scanning Line */}
            {isScanning && !scannedResult && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6344F5] to-transparent shadow-[0_0_15px_#6344F5] animate-[bounce_2s_infinite]" />
            )}

            {/* Success Overlay */}
            {scannedResult && (
              <div className="absolute inset-0 bg-[#6344F5]/90 flex flex-col items-center justify-center text-white animate-fadeIn p-4 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-300 mb-2 animate-bounce" />
                <h3 className="text-lg font-bold">Barcode Scanned!</h3>
                <p className="font-mono text-sm bg-black/40 px-3 py-1 rounded-lg mt-1 border border-white/20">
                  {scannedResult.text}
                </p>
              </div>
            )}

            {/* Corner Bracket Graphics */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-[#6344F5] rounded-tl-xl" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-[#6344F5] rounded-tr-xl" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-[#6344F5] rounded-bl-xl" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-[#6344F5] rounded-br-xl" />
          </div>

          {/* Subtitle instructions */}
          <div className="mt-6 text-center text-slate-300 text-xs bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/60 shadow-lg">
            Hold steady over barcode (Costco, Target, Gym, etc.)
          </div>
        </div>

        {/* Permission / Device Error Banner */}
        {errorMessage && (
          <div className="absolute inset-x-4 top-4 bg-rose-950/90 border border-rose-800 text-rose-200 p-4 rounded-2xl text-xs flex items-center gap-3 backdrop-blur-md z-20">
            <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
            <div>
              <p className="font-bold">{errorMessage}</p>
              <p className="mt-1 text-slate-300">You can also upload a photo of your card or type the number manually.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

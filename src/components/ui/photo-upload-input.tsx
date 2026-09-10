"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Upload, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PhotoUploadInputProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  disabled?: boolean;
  initialPreview?: string;
}

export function PhotoUploadInput({ value, onChange, disabled, initialPreview }: PhotoUploadInputProps) {
  const [preview, setPreview] = useState<string>(initialPreview || "");
  const [capturedPreview, setCapturedPreview] = useState<string>("");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedFileRef = useRef<File | null>(null);

  // Update preview when initialPreview changes and no new file is selected
  useEffect(() => {
    if (!value && initialPreview) {
      setPreview(initialPreview);
    }
  }, [initialPreview, value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      setIsCameraActive(true); // Set this first so video element renders
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      
      // Wait a tick to ensure video element is in DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((error) => {
              console.error("Error playing video stream:", error);
            });
          };
        }
        setIsCapturing(false);
      }, 0);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
      setIsCapturing(false);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            capturedFileRef.current = file;
            
            const reader = new FileReader();
            reader.onload = (event) => {
              setCapturedPreview(event.target?.result as string);
              setShowPreviewDialog(true);
            };
            reader.readAsDataURL(blob);
          }
        }, "image/jpeg");
      }
    }
  };

  const confirmCapture = () => {
    if (capturedFileRef.current) {
      onChange(capturedFileRef.current);
      setPreview(capturedPreview);
      setShowPreviewDialog(false);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setShowPreviewDialog(false);
    setCapturedPreview("");
    capturedFileRef.current = null;
    // Camera stays active for retake
  };

  const clearPhoto = () => {
    onChange(undefined);
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-md">
          <DialogTitle>Confirm Photo</DialogTitle>
          <DialogDescription>
            Is this photo acceptable? Click Confirm to proceed or Retake to capture again.
          </DialogDescription>
          {capturedPreview && (
            <div className="flex justify-center">
              <img src={capturedPreview} alt="Captured" className="w-full rounded-lg border object-cover" />
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="default"
              onClick={confirmCapture}
              disabled={disabled}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={retakePhoto}
              disabled={disabled}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Retake
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-48 w-48 rounded-lg border object-cover" />
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* File Input */}
      {!isCameraActive && (
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled}
            className="cursor-pointer"
          />
          {value && <div className="text-sm text-muted-foreground">Selected: {value.name}</div>}
        </div>
      )}

      {/* Camera Section */}
      {!isCameraActive && (
        <Button
          type="button"
          variant="outline"
          onClick={startCamera}
          disabled={disabled || isCapturing || isCameraActive}
          className="w-full"
        >
          {isCapturing ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Initializing Camera...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Capture from Camera
            </>
          )}
        </Button>
      )}

      {/* Video Stream */}
      {isCameraActive && (
        <div className="space-y-3 w-full">
          <div className="relative w-full bg-black rounded-lg border overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto block"
              style={{ aspectRatio: "4/3" }}
            />
          </div>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              onClick={capturePhoto}
              disabled={disabled}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              disabled={disabled}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

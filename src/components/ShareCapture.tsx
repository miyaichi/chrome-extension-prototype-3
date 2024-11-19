import { Send, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useConnectionManager } from "../lib/connectionManager";
import {
  DOM_SELECTION_EVENTS,
  ElementInfo,
  UI_EVENTS,
} from "../types/domSelection";
import "./ShareCapture.css";

interface ShareCaptureProps {
  onClose: () => void;
  onShare: (comment: string, imageData: string) => void;
}

interface CaptureInfo {
  selectedElement: ElementInfo | null;
  captureUrl: string | null;
}

export const ShareCapture: React.FC<ShareCaptureProps> = ({
  onClose,
  onShare,
}) => {
  const [comment, setComment] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [captureInfo, setCaptureInfo] = useState<CaptureInfo>({
    selectedElement: null,
    captureUrl: null,
  });
  const { subscribe } = useConnectionManager();

  useEffect(() => {
    const unsubscribeCapture = subscribe(
      UI_EVENTS.CAPTURE_TAB_RESULT,
      (message) => {
        const payload = message.payload as {
          success: boolean;
          imageDataUrl?: string;
          error?: string;
          url?: string;
        };
        if (payload.success) {
          setImageDataUrl(payload.imageDataUrl);
          setCaptureInfo((prev) => ({
            ...prev,
            captureUrl: payload.url || null,
          }));
        } else {
          console.error("Capture failed:", payload.error);
        }
      },
    );

    const unsubscribeSelection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        setCaptureInfo((prev) => ({
          ...prev,
          selectedElement: message.payload.elementInfo,
        }));
      },
    );

    const unsubscribeUnselection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED,
      () => {
        setCaptureInfo((prev) => ({
          ...prev,
          selectedElement: null,
        }));
      },
    );

    return () => {
      unsubscribeCapture();
      unsubscribeSelection();
      unsubscribeUnselection();
    };
  }, [subscribe]);

  const handleClose = () => {
    setImageDataUrl(undefined);
    setComment("");
    setCaptureInfo({
      selectedElement: null,
      captureUrl: null,
    });
    onClose();
  };

  const handleShare = () => {
    if (imageDataUrl) {
      onShare(comment, imageDataUrl);
      setImageDataUrl(undefined);
      setComment("");
      setCaptureInfo({
        selectedElement: null,
        captureUrl: null,
      });
    }
  };

  return (
    <div className="capture-modal">
      <div className="capture-container">
        <div className="capture-header">
          <h2 className="capture-title">Share Capture</h2>
          <button onClick={handleClose} className="capture-close">
            <X size={20} />
          </button>
        </div>

        {imageDataUrl ? (
          <div className="capture-preview">
            <img
              src={imageDataUrl}
              alt="Screen Capture"
              className="capture-image"
            />
          </div>
        ) : (
          <div className="capture-preview">
            <p>Capturing screen...</p>
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="capture-comment"
        />

        {captureInfo.selectedElement && (
          <div className="element-info">
            <p>
              Selected Element Path:{" "}
              {captureInfo.selectedElement.path.join(" > ")}
            </p>
          </div>
        )}

        {captureInfo.captureUrl && (
          <div className="element-info">
            <p>Captured URL: {captureInfo.captureUrl}</p>
          </div>
        )}

        <div className="capture-actions">
          <button
            onClick={handleShare}
            className="share-button"
            disabled={!imageDataUrl}
          >
            <Send size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
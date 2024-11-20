import { Send, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useConnectionManager } from '../lib/connectionManager';
import { useSettings } from '../lib/settings';
import { shareAsPDF } from '../lib/shareAsPDF';
import { shareAsPPT } from '../lib/shareAsPPT';
import { DOM_SELECTION_EVENTS, ElementInfo, UI_EVENTS } from '../types/domSelection';
import './ShareCapture.css';
import { formatElementTag } from './utils/htmlTagFormatter';

interface ShareCaptureProps {
  onClose: () => void;
  initialSelectedElement: ElementInfo | null;
}

interface CaptureInfo {
  selectedElement: ElementInfo | null;
  captureUrl: string | null;
}

export const ShareCapture: React.FC<ShareCaptureProps> = ({ onClose, initialSelectedElement }) => {
  const { settings } = useSettings();
  const [comment, setComment] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [captureInfo, setCaptureInfo] = useState<CaptureInfo>({
    selectedElement: initialSelectedElement,
    captureUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { subscribe } = useConnectionManager();

  useEffect(() => {
    const unsubscribeCapture = subscribe(UI_EVENTS.CAPTURE_TAB_RESULT, (message) => {
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
        console.error('Capture failed:', payload.error);
      }
    });

    const unsubscribeSelection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        setCaptureInfo((prev) => ({
          ...prev,
          selectedElement: message.payload.elementInfo,
        }));
      }
    );

    const unsubscribeUnselection = subscribe(DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED, () => {
      setCaptureInfo((prev) => ({
        ...prev,
        selectedElement: null,
      }));
    });

    return () => {
      unsubscribeCapture();
      unsubscribeSelection();
      unsubscribeUnselection();
    };
  }, [subscribe]);

  const handleClose = () => {
    setImageDataUrl(undefined);
    setComment('');
    setCaptureInfo({
      selectedElement: null,
      captureUrl: null,
    });
    onClose();
  };

  const handleShare = async () => {
    if (!imageDataUrl) {
      return;
    }

    setIsLoading(true);
    try {
      const shareFunction = settings.shareFormat === 'pdf' ? shareAsPDF : shareAsPPT;
      const imageData = imageDataUrl || '';
      const url = captureInfo.captureUrl || '';
      const startTag = captureInfo.selectedElement?.startTag || '';

      await shareFunction(imageData, comment, url, startTag);

      setImageDataUrl(undefined);
      setComment('');
      setCaptureInfo({
        selectedElement: null,
        captureUrl: null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
            <img src={imageDataUrl} alt="Screen Capture" className="capture-image" />
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

        {captureInfo.captureUrl && (
          <div className="element-info">
            <p>{captureInfo.captureUrl}</p>
          </div>
        )}

        {captureInfo.selectedElement && (
          <div className="element-info">
            <p>[ {captureInfo.selectedElement.path.join(' > ')} ]</p>
            <p>
              {formatElementTag(captureInfo.selectedElement.startTag, {
                showFullContent: true,
                maxLength: 50,
              })}
            </p>
          </div>
        )}

        <div className="capture-actions">
          <button onClick={handleShare} className="share-button" disabled={!imageDataUrl}>
            <Send size={16} />
            {isLoading ? 'Sharing...' : `Share as ${settings.shareFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

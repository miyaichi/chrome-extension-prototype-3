import React, { useEffect, useRef, useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (tooltipRef.current && targetRef.current) {
        const targetRect = targetRef.current.getBoundingClientRect();
        tooltipRef.current.style.left = `${targetRect.left}px`;
        tooltipRef.current.style.top = `${targetRect.bottom + 5}px`;
      }
    };

    if (isVisible) {
      updatePosition();
    }
  }, [isVisible]);

  return (
    <div
      ref={targetRef}
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div ref={tooltipRef} className="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};

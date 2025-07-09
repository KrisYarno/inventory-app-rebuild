"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SwipeableAdjustmentProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  className?: string;
  role?: string;
  'aria-label'?: string;
  tabIndex?: number;
}

export function SwipeableAdjustment({
  onSwipeLeft,
  onSwipeRight,
  children,
  className,
  role,
  'aria-label': ariaLabel,
  tabIndex,
}: SwipeableAdjustmentProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);

  // Minimum swipe distance (in px) to trigger action
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setSwipeDistance(currentTouch - touchStart);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    // Reset
    setSwiping(false);
    setSwipeDistance(0);
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && onSwipeLeft) {
      e.preventDefault();
      onSwipeLeft();
    } else if (e.key === 'ArrowRight' && onSwipeRight) {
      e.preventDefault();
      onSwipeRight();
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
        className
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onKeyDown={handleKeyDown}
      role={role}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
    >
      {/* Swipe indicators */}
      {swiping && (
        <>
          {swipeDistance > 0 && (
            <div 
              className="absolute inset-y-0 left-0 bg-green-500/20 flex items-center px-4"
              style={{ width: Math.min(swipeDistance, 100) }}
              aria-hidden="true"
            >
              <span className="text-green-600 font-medium">+1</span>
            </div>
          )}
          {swipeDistance < 0 && (
            <div 
              className="absolute inset-y-0 right-0 bg-red-500/20 flex items-center justify-end px-4"
              style={{ width: Math.min(Math.abs(swipeDistance), 100) }}
              aria-hidden="true"
            >
              <span className="text-red-600 font-medium">-1</span>
            </div>
          )}
        </>
      )}
      
      {/* Content */}
      <div
        className={cn(
          "relative transition-transform",
          swiping && "transition-none"
        )}
        style={{
          transform: swiping ? `translateX(${swipeDistance * 0.3}px)` : "translateX(0)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
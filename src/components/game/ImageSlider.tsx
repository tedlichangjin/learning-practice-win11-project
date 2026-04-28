"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  images: readonly string[];
  interval?: number;
  showDots?: boolean;
}

const ImageSlider = React.forwardRef<HTMLDivElement, ImageSliderProps>(
  (
    { images, interval = 5000, showDots = true, className, ...props },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
      if (images.length <= 1) return;

      const timer = window.setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);

      return () => window.clearInterval(timer);
    }, [images.length, interval]);

    if (images.length === 0) {
      return (
        <div
          ref={ref}
          className={cn("relative h-full w-full overflow-hidden", className)}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-full w-full overflow-hidden bg-stone-100",
          className
        )}
        {...props}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={images[currentIndex]}
            src={images[currentIndex]}
            alt={`角色照片 ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.03, x: 28 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: -28 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        {showDots && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentIndex === index
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/55 hover:bg-white"
                )}
                aria-label={`切换到第 ${index + 1} 张角色照片`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

ImageSlider.displayName = "ImageSlider";

export { ImageSlider };

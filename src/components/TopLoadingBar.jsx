import { useEffect, useState } from "react";
export const TopLoadingBar = ({ active }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let interval;
    let fadeTimeout;
    if (active) {
      setVisible(true);
      setProgress(15);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 70) return prev + Math.floor(Math.random() * 15) + 8;
          if (prev < 90) return prev + Math.floor(Math.random() * 6) + 2;
          return prev;
        });
      }, 150);
    } else if (visible) {
      setProgress(100);
      fadeTimeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
    }
    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [active, visible]);
  if (!visible && progress === 0) return null;
  return <div
    id="global-top-loading-bar"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      zIndex: 9999999,
      pointerEvents: "none",
      background: "transparent"
    }}
  >
      <div
    style={{
      height: "100%",
      width: `${progress}%`,
      background: "var(--bright-green)",
      transition: progress === 100 ? "width 0.15s ease-out, opacity 0.25s ease-out" : "width 0.2s ease-out",
      opacity: progress === 100 && !active ? 0 : 1,
      borderRadius: "0 1px 1px 0"
    }}
  />
    </div>;
};

import React, { useRef, useState, useEffect } from 'react';
import styles from './ScrollBar.module.css';

function ScrollBar ({ children }) {
  const contentRef = useRef(null);
  const timeRef = useRef(null);
  const [state, setState] = useState({
    thumbHeight: 0,
    thumbTop: 0,
    visible: false,
    isScrollable: false,
  });

  const updateScrollBar = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollHeight <= clientHeight) {
      setState(prev => ({ ...prev, isScrollable: false, visible: false }));
      return;
    }
    const trackHeight = clientHeight * 0.85;
    const heightRatio = clientHeight / scrollHeight;
    const thumbHeight = Math.max(heightRatio * trackHeight, 30);
    const maxScroll = scrollHeight - clientHeight;
    const scrollPer = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const maxThumb = trackHeight - thumbHeight;
    const thumbTop = scrollPer * maxThumb;

    setState(prev => ({
      ...prev,
      thumbHeight,
      thumbTop,
      isScrollable: true,
      visible: true,
    }));
    if (timeRef.current) clearTimeout(timeRef.current);
    timeRef.current = setTimeout(() => {
      setState(prev => ({...prev, visible: false }));
    }, 2000);
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const resize = new ResizeObserver(() => {
      updateScrollBar();
    });
    resize.observe(content);
    if (content.firstElementChild) {
      resize.observe(content.firstElementChild);
    }
    return () => {
      resize.disconnect();
      if (timeRef.current) clearTimeout(timeRef.current);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div 
        className={styles.scrollContent} 
        ref={contentRef} 
        onScroll={updateScrollBar}
      >
        {children}
      </div>
      {state.isScrollable && (
        <div className={`${styles.scrollTrack} ${state.visible ? styles.visible : ''}`}>
          <div 
            className={styles.scrollThumb} 
            style={{ 
              height: `${state.thumbHeight}px`,
              transform: `translateY(${state.thumbTop}px)`
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default ScrollBar;
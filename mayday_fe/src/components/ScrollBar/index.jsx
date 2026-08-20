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
      setState
    }
  }
}
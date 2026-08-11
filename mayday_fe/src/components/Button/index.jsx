import React from 'react';
import styles from "./Button.module.css";

function Button({ text, onClick, disabled = false, style }) {
  return (
    <button onClick={onClick} disabled={disabled} className={styles.defaultStyle} style={style}>
      {text}
    </button>
  );
}

export default Button;
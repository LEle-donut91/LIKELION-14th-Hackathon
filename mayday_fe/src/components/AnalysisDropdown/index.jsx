import React, { useState, useRef, useEffect } from "react";
import styles from "./AnalysisDropdown.module.css";
import AnalysisDropdownIcon from "../../assets/images/AnalysisDropdown.svg";
import AnalysisDropdownCheck from "../../assets/images/AnalysisDropdownCheck.svg";

function AnalysisDropdown({
  placeholder = "선택해주세요",
  items = [],
  selectedValue,
  onSelect,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false); 
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.button} ${isOpen ? styles.active : ""}`}
        onClick={toggleDropdown}
      >
        <span className={styles.selectedText}>
          {selectedValue || placeholder}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.rotate : ""}`} />
      </button>

      {isOpen && (
        <ul className={styles.menuList}>
          {items.map((item, index) => {
            const isSelected = item === selectedValue;
            return (
              <li
                key={index}
                className={`${styles.menuItem} ${isSelected ? styles.selected : ""}`}
                onClick={() => handleSelect(item)}
              >
                <span className={styles.itemText}>{item}</span>
                {isSelected && (
                  <img
                    className={styles.icon}
                    alt="selected"
                    src={AnalysisDropdownCheck}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AnalysisDropdown;
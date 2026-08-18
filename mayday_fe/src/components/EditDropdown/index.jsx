import React, { useState, useRef, useEffect } from "react";
import styles from "./EditDropdown.module.css";
import EditDropdownIcon from "../../assets/images/EditDropdownIcon.svg";

function EditDropdown({
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
    setIsOpen(false); // 선택 후 닫기
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
      {/* 드롭다운 헤더 (현재 선택된 값 표시) */}
      <button
        type="button"
        className={`${styles.button} ${isOpen ? styles.active : ""}`}
        onClick={toggleDropdown}
      >
        <span className={styles.selectedText}>
          {selectedValue || placeholder}
        </span>
      </button>

      {/* 드롭다운 목록 (열렸을 때만 표시) */}
      {isOpen && (
        <ul className={styles.menuList}>
          {items.map((item, index) => {
            const isSelected = item === selectedValue;

            return (
              <li
                key={index}
                /* 선택된 항목이면 selected 클래스만 추가! */
                className={`${styles.menuItem} ${isSelected ? styles.selected : ""}`}
                onClick={() => handleSelect(item)}
              >
                <span className={styles.itemText}>{item}</span>
                {/* 선택되었을 때만 우측 체크 아이콘 표시 */}
                {isSelected && (
                  <img
                    className={styles.icon}
                    alt="selected"
                    src={EditDropdownIcon}
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

export default EditDropdown;

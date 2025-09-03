import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronDown, BsCheck } from 'react-icons/bs'; // 1. เพิ่มไอคอน BsCheck
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 2. สร้าง Array ของภาษาทั้งหมดที่มีให้เลือก
  const languages = [
    { code: 'th', name: 'TH' },
    { code: 'en', name: 'EN' },
  ];

  // 3. หา object ของภาษาที่กำลังใช้งานอยู่
  const currentLanguage = languages.find(lang => i18n.language.startsWith(lang.code));

  const toggleDropdown = () => setIsOpen(!isOpen);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="glass-lang-switcher" ref={dropdownRef}>
      <button className="glass-lang-button" onClick={toggleDropdown}>
        <span>{currentLanguage ? currentLanguage.name : 'TH'}</span>
        <BsChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="glass-lang-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`dropdown-item ${currentLanguage?.code === lang.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span>{lang.name}</span>
              {currentLanguage?.code === lang.code && <BsCheck className="check-icon" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
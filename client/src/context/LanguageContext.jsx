import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const t = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.id || item.en || '';
  };

  return (
    <LanguageContext.Provider value={{ lang: 'id', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// src/context/SearchContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults(null);
  }, []);
  const toggleSearch = useCallback(() => setOpen(v => !v), []);
  const setSearchResults = useCallback((r) => setResults(r), []);
  const setSearchQuery = useCallback((q) => setQuery(q), []);

  return (
    <SearchContext.Provider value={{
      open,
      query,
      results,
      openSearch,
      closeSearch,
      toggleSearch,
      setSearchResults,
      setSearchQuery,
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider');
  return ctx;
};

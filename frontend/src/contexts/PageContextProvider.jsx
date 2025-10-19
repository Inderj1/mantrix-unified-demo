import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const PageContext = createContext();

// Custom hook to use the page context
export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within PageContextProvider');
  }
  return context;
};

// PageContextProvider component
export const PageContextProvider = ({ children }) => {
  const [context, setContext] = useState({
    moduleName: null,
    moduleId: null,
    tabName: null,
    tabId: null,
    filters: {},
    dateRange: null,
    visibleData: null,
    chartData: null,
    metadata: {},
  });

  // Update the entire context
  const updateContext = useCallback((newContext) => {
    setContext((prev) => ({
      ...prev,
      ...newContext,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  // Update specific context fields
  const updateModule = useCallback((moduleName, moduleId) => {
    setContext((prev) => ({
      ...prev,
      moduleName,
      moduleId,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  const updateTab = useCallback((tabName, tabId) => {
    setContext((prev) => ({
      ...prev,
      tabName,
      tabId,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  const updateFilters = useCallback((filters) => {
    setContext((prev) => ({
      ...prev,
      filters,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  const updateDateRange = useCallback((dateRange) => {
    setContext((prev) => ({
      ...prev,
      dateRange,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  const updateVisibleData = useCallback((visibleData) => {
    setContext((prev) => ({
      ...prev,
      visibleData,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  const updateChartData = useCallback((chartData) => {
    setContext((prev) => ({
      ...prev,
      chartData,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  const updateMetadata = useCallback((metadata) => {
    setContext((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, ...metadata },
      timestamp: new Date().toISOString(),
    }));
  }, []);

  // Clear context (useful when leaving a screen)
  const clearContext = useCallback(() => {
    setContext({
      moduleName: null,
      moduleId: null,
      tabName: null,
      tabId: null,
      filters: {},
      dateRange: null,
      visibleData: null,
      chartData: null,
      metadata: {},
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Generate a context key for chat storage
  const getContextKey = useCallback(() => {
    const parts = [];

    if (context.moduleName) parts.push(context.moduleName);
    if (context.tabName) parts.push(context.tabName);
    if (context.dateRange) {
      parts.push(`${context.dateRange.from}_${context.dateRange.to}`);
    }

    return parts.length > 0 ? parts.join('_') : 'general';
  }, [context]);

  // Get human-readable context description
  const getContextDescription = useCallback(() => {
    const parts = [];

    if (context.moduleName) parts.push(context.moduleName);
    if (context.tabName) parts.push(context.tabName);

    return parts.length > 0 ? parts.join(' > ') : 'General';
  }, [context]);

  const value = {
    context,
    updateContext,
    updateModule,
    updateTab,
    updateFilters,
    updateDateRange,
    updateVisibleData,
    updateChartData,
    updateMetadata,
    clearContext,
    getContextKey,
    getContextDescription,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};

export default PageContextProvider;

import { useState, useEffect } from 'react';

export const useCustomTypes = (storageKey) => {
  const [customTypes, setCustomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load custom types from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCustomTypes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load custom types:', error);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  // Save to localStorage whenever customTypes changes
  const saveTypes = (types) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(types));
      setCustomTypes(types);
    } catch (error) {
      console.error('Failed to save custom types:', error);
    }
  };

  const addType = (type) => {
    const newType = {
      ...type,
      id: `custom-${Date.now()}`,
      name: type.name || `custom_${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...customTypes, newType];
    saveTypes(updated);
    return newType;
  };

  const updateType = (id, updates) => {
    const updated = customTypes.map((type) =>
      type.id === id ? { ...type, ...updates, updatedAt: new Date().toISOString() } : type
    );
    saveTypes(updated);
  };

  const deleteType = (id) => {
    const updated = customTypes.filter((type) => type.id !== id);
    saveTypes(updated);
  };

  const getType = (id) => {
    return customTypes.find((type) => type.id === id);
  };

  return {
    customTypes,
    loading,
    addType,
    updateType,
    deleteType,
    getType,
  };
};

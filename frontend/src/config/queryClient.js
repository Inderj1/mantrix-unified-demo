import { QueryClient } from 'react-query';
import localforage from 'localforage';

// Configure localforage for better performance
localforage.config({
  driver: localforage.LOCALSTORAGE,
  name: 'mantrix-stox-cache',
  version: 1.0,
  storeName: 'stox_data',
  description: 'STOX.AI data persistence layer'
});

// Create query client with optimized cache settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 24 hours
      cacheTime: 1000 * 60 * 60 * 24,
      // Consider data stale after 5 minutes
      staleTime: 1000 * 60 * 5,
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data exists
      refetchOnMount: false,
      // Retry failed requests
      retry: 1,
    },
  },
});

// Persist query cache to localforage
export const persistCache = async () => {
  try {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const serializedQueries = queries.map(query => ({
      queryKey: query.queryKey,
      queryHash: query.queryHash,
      state: {
        data: query.state.data,
        dataUpdateCount: query.state.dataUpdateCount,
        dataUpdatedAt: query.state.dataUpdatedAt,
        error: query.state.error,
        errorUpdateCount: query.state.errorUpdateCount,
        errorUpdatedAt: query.state.errorUpdatedAt,
        fetchFailureCount: query.state.fetchFailureCount,
        fetchMeta: query.state.fetchMeta,
        isFetching: false,
        isInvalidated: query.state.isInvalidated,
        status: query.state.status,
      },
    }));

    await localforage.setItem('REACT_QUERY_CACHE', serializedQueries);
  } catch (error) {
    console.error('Failed to persist cache:', error);
  }
};

// Restore query cache from localforage
export const restoreCache = async () => {
  try {
    const serializedQueries = await localforage.getItem('REACT_QUERY_CACHE');

    if (serializedQueries && Array.isArray(serializedQueries)) {
      const cache = queryClient.getQueryCache();

      serializedQueries.forEach(({ queryKey, state }) => {
        cache.build(queryClient, {
          queryKey,
          queryHash: JSON.stringify(queryKey),
        }).setState(state);
      });
    }
  } catch (error) {
    console.error('Failed to restore cache:', error);
  }
};

// Clear all cached data (for logout)
export const clearCache = async () => {
  try {
    queryClient.clear();
    await localforage.removeItem('REACT_QUERY_CACHE');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

// Subscribe to cache changes and persist automatically
queryClient.getQueryCache().subscribe(() => {
  persistCache();
});

// Initialize cache restoration on module load
restoreCache();

export default queryClient;

import { useCallback, useEffect, useRef } from 'react';
import { handleContainerError } from '@/core/errors/error-handler';
import { useGetAllData } from '@/shared/hooks/use-get-all-data';
import type { Container } from '@/shared/types/container';
import { databasesApi } from '../api/databases.api';

/**
 * Hook to manage the list of database containers
 * Responsibility: State and periodic synchronization
 */
export function useDatabaseList() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: containers,
    loading,
    fetch: load,
    setData,
  } = useGetAllData<Container>({
    request: databasesApi.getAll,
    initialData: [],
    onError: handleContainerError,
  });

  /**
   * Synchronize database containers with Docker
   */
  const sync = useCallback(async () => {
    try {
      const data = await databasesApi.sync();
      setData(data);
    } catch (error) {
      console.error('Error syncing containers:', error);
    }
  }, [setData]);

  /**
   * Update a container in the local list
   */
  const updateLocal = useCallback(
    (updatedContainer: Container) => {
      setData((prev) =>
        prev.map((c) => (c.id === updatedContainer.id ? updatedContainer : c)),
      );
    },
    [setData],
  );

  /**
   * Remove a container from the local list
   */
  const removeLocal = useCallback(
    (containerId: string) => {
      setData((prev) => prev.filter((c) => c.id !== containerId));
    },
    [setData],
  );

  /**
   * Add a container to the local list
   */
  const addLocal = useCallback(
    (newContainer: Container) => {
      setData((prev) => [...prev, newContainer]);
    },
    [setData],
  );

  /**
   * Start periodic synchronization (every 5 seconds)
   */
  const startSync = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      void sync();
    }, 5000);
  }, [sync]);

  /**
   * Stop periodic synchronization
   */
  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-start sync on mount
  useEffect(() => {
    startSync();
    return () => stopSync();
  }, [startSync, stopSync]);

  return {
    containers,
    loading,
    load,
    sync,
    updateLocal,
    removeLocal,
    addLocal,
    startSync,
    stopSync,
  };
}

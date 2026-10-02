import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useGetOneData } from '@/shared/hooks/use-get-one-data';
import type { DockerStatus } from '../../../shared/types/docker';
import { dockerApi } from '../api/docker.api';

/**
 * Hook to manage Docker status
 * Responsibility: Polling Docker daemon status
 */
export function useDockerStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shouldShowOverlay, setShouldShowOverlay] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkDockerStatusRef = useRef<
    (showNotifications?: boolean) => Promise<void>
  >(async () => {});

  const {
    data: dockerStatus,
    fetch: fetchStatus,
    setData: setDockerStatus,
  } = useGetOneData<DockerStatus | null>({
    request: dockerApi.getStatus,
    initialData: null,
  });

  /**
   * Check Docker status
   */
  const checkDockerStatus = useCallback(
    async (showNotifications = false) => {
      const status = await fetchStatus();

      if (!status) {
        setDockerStatus({
          status: 'error',
          error: 'Could not connect to Docker',
        });
        setShouldShowOverlay(true);

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(() => {
          void checkDockerStatusRef.current(false);
        }, 10000);
        return;
      }

      if (status.status !== 'running') {
        setShouldShowOverlay(true);
      } else {
        setShouldShowOverlay(false);
        if (showNotifications) {
          toast.success('Docker is available');
        }
      }
    },
    [fetchStatus, setDockerStatus],
  );

  useEffect(() => {
    checkDockerStatusRef.current = checkDockerStatus;
  }, [checkDockerStatus]);

  /**
   * Manually refresh status
   */
  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);
    await checkDockerStatus(true);
    setIsRefreshing(false);
  }, [checkDockerStatus]);

  /**
   * Start periodic check (every 30 seconds)
   */
  const startPeriodicCheck = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      void checkDockerStatus();
    }, 30000);
  }, [checkDockerStatus]);

  /**
   * Stop periodic check
   */
  const stopPeriodicCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Initial check and setup
  useEffect(() => {
    void checkDockerStatus();
    startPeriodicCheck();

    return () => {
      stopPeriodicCheck();
    };
  }, [checkDockerStatus, startPeriodicCheck, stopPeriodicCheck]);

  // Pause polling while tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPeriodicCheck();
      } else {
        void checkDockerStatus();
        startPeriodicCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkDockerStatus, startPeriodicCheck, stopPeriodicCheck]);

  return {
    dockerStatus,
    isRefreshing,
    shouldShowOverlay,
    refreshStatus,
    isDockerAvailable: dockerStatus ? dockerStatus.status === 'running' : false,
  };
}

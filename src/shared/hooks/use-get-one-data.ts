import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface UseGetOneDataOptions<T> {
  request: () => Promise<T>;
  initialData: T;
  isCall?: 'auto';
  refetch?: readonly unknown[];
  onError?: (error: unknown) => void;
}

export interface UseGetOneDataResult<T> {
  data: T;
  loading: boolean;
  fetch: () => Promise<T | null>;
  setData: Dispatch<SetStateAction<T>>;
}

/**
 * Single resource hook based on digital-univ-student fetch pattern.
 */
export function useGetOneData<T>({
  request,
  initialData,
  isCall,
  refetch = [],
  onError,
}: UseGetOneDataOptions<T>): UseGetOneDataResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);

    try {
      const response = await request();
      setData(response);
      return response;
    } catch (error) {
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [request, onError]);

  useEffect(() => {
    if (isCall === 'auto') {
      void fetch();
    }
  }, [isCall, fetch, ...refetch]);

  return {
    data,
    loading,
    fetch,
    setData,
  };
}

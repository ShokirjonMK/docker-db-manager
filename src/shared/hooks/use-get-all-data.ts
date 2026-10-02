import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface UseGetAllDataOptions<T> {
  request: () => Promise<T[]>;
  isCall?: 'auto';
  refetch?: readonly unknown[];
  initialData?: T[];
  onError?: (error: unknown) => void;
}

export interface UseGetAllDataResult<T> {
  data: T[];
  loading: boolean;
  fetch: () => Promise<T[] | null>;
  setData: Dispatch<SetStateAction<T[]>>;
}

/**
 * Data hook based on digital-univ-student fetch pattern.
 */
export function useGetAllData<T>({
  request,
  isCall,
  refetch = [],
  initialData = [],
  onError,
}: UseGetAllDataOptions<T>): UseGetAllDataResult<T> {
  const [data, setData] = useState<T[]>(initialData);
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

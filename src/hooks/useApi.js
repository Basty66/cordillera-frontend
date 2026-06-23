import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export function useApi(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await client.get(url);
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export function useMutation(url, method = 'POST') {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (body) => {
        try {
            setLoading(true);
            setError(null);
            const response = await client[method.toLowerCase()](url, body);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { execute, loading, error };
}

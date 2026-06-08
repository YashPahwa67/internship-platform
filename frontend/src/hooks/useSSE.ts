import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectUser } from '../features/auth/authSlice';
import { baseApi } from '../api/baseApi';

export function useSSE() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const esRef = useRef<EventSource | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Read access token from localStorage (set by authSlice)
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    tokenRef.current = token;

    const url = `/api/notifications/stream?_t=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('notification', () => {
      dispatch(baseApi.util.invalidateTags(['Notifications']));
    });

    // Reconnect silently — EventSource does this automatically
    es.onerror = () => {};

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [user?.id, dispatch]);
}

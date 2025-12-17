'use client';

import { useEffect } from 'react';
import { moviesApi } from '@/modules/movies/api/movies.api';

interface MovieViewTrackerProps {
  movieId: string;
}

export default function MovieViewTracker({ movieId }: MovieViewTrackerProps) {
  useEffect(() => {
    if (!movieId) return;

    moviesApi.incrementView(movieId);
  }, [movieId]);

  return null;
}



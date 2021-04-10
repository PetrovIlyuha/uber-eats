import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'


export const ScrollToTopControlller = (): null => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    try {

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
};

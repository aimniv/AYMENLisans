import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextValue {
  pathname: string;
  search: string;
  searchParams: URLSearchParams;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  pathname: '/',
  search: '',
  searchParams: new URLSearchParams(),
  navigate: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locationState, setLocationState] = useState(() => ({
    pathname: typeof window !== 'undefined' ? window.location.pathname || '/' : '/',
    search: typeof window !== 'undefined' ? window.location.search || '' : '',
  }));

  useEffect(() => {
    const handlePopState = () => {
      setLocationState({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window === 'undefined') return;
    if (to.startsWith('http://') || to.startsWith('https://')) {
      window.location.href = to;
      return;
    }
    const url = new URL(to, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    setLocationState({
      pathname: url.pathname || '/',
      search: url.search || '',
    });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const searchParams = new URLSearchParams(locationState.search);

  return (
    <RouterContext.Provider
      value={{
        pathname: locationState.pathname,
        search: locationState.search,
        searchParams,
        navigate,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  return useContext(RouterContext);
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, onClick, children, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      rest.target === '_blank'
    ) {
      return;
    }
    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

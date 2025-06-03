'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProviderInternal } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

export function NextThemesProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children directly on the server to avoid rendering mismatch
    // The theme will be applied on the client after hydration
    return <>{children}</>;
  }

  return (
    <NextThemesProviderInternal {...props}>
      {children}
    </NextThemesProviderInternal>
  );
}

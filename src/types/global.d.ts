// React 19 JSX compatibility
import { ReactElement } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Extend React module to fix JSX component compatibility
declare module 'react' {
  // Make ForwardRefExoticComponent more permissive for JSX usage
  interface ForwardRefExoticComponent<P> {
    (props: P): ReactElement | null;
  }

  // Make FunctionComponent more permissive for JSX usage
  interface FunctionComponent<P = Record<string, unknown>> {
    (props: P): ReactElement | null;
  }
}

export {};

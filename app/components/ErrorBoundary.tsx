import { Component, type ReactNode, type ErrorInfo } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React class-based error boundary.
 * Catches rendering errors in the subtree and shows a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev; swap with your error reporting service in prod
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-4xl">⚠️</div>
          <h2 className="font-display text-xl font-bold">Something went wrong</h2>
          <p className="max-w-sm text-sm opacity-50">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-gold !px-6 !py-2"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Route-level error component used as the `errorComponent` prop in TanStack Router routes.
 */
export function RouteErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-[68px] text-center">
      <div className="text-5xl">💥</div>
      <h1 className="font-display text-2xl font-bold">Page Error</h1>
      <p className="max-w-md text-sm opacity-50">
        {error?.message || "An unexpected error occurred."}
      </p>
      <Link href="/" className="btn-gold !px-6 !py-2">
        Go Home
      </Link>
    </div>
  );
}

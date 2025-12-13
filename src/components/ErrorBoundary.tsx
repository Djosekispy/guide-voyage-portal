import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Show error in console for debugging
    console.error("[ErrorBoundary] Caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
          <h1 className="text-2xl font-bold">Erro inesperado</h1>
          <p className="text-muted-foreground">Ocorreu um erro nesta página. Veja o console para mais detalhes.</p>
          <div className="w-full max-w-3xl bg-gray-100 p-4 rounded shadow-inner overflow-auto">
            <details>
              <summary className="cursor-pointer font-medium">Detalhes do erro</summary>
              <pre className="whitespace-pre-wrap mt-2 text-sm">
                {this.state.error?.toString()}
                {"\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children as JSX.Element;
  }
}

export default ErrorBoundary;

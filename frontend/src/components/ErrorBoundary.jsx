import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <div className="text-8xl mb-6">⚠️</div>
              <h1 className="text-4xl font-heading text-neutral-900 mb-4">
                Something went wrong
              </h1>
              <p className="text-lg text-neutral-600 mb-8">
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={this.handleReset}
                className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-700 transition-colors font-medium"
              >
                Return to Home
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="block w-full border-2 border-neutral-300 text-neutral-700 px-8 py-3 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <summary className="cursor-pointer font-medium text-neutral-900 mb-4">
                  Error Details (Development Only)
                </summary>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Error Message:</h3>
                    <pre className="text-sm text-red-600 bg-white p-4 rounded border border-red-200 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-2">Component Stack:</h3>
                      <pre className="text-sm text-neutral-600 bg-white p-4 rounded border border-neutral-200 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

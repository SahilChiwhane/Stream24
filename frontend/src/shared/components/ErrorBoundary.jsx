import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-3xl font-bold text-red-500">
              Something went wrong.
            </h1>
            <p className="text-gray-400">
              We're sorry, an unexpected error occurred. Please try refreshing
              the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && (
              <pre className="text-left bg-gray-900 p-4 rounded text-xs overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

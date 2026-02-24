import React from "react";

class LazyBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      retrying: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("LazyBoundary caught error:", error, info);

    // Detect chunk loading error
    const isChunkError =
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("ChunkLoadError") ||
      error?.message?.includes("dynamically imported module");

    if (isChunkError && !sessionStorage.getItem("lazy-reloaded")) {
      sessionStorage.setItem("lazy-reloaded", "true");

      this.setState({ retrying: true });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  handleManualReload = () => {
    sessionStorage.removeItem("lazy-reloaded");
    window.location.reload();
  };

  render() {
    if (this.state.retrying) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
          Recovering application…
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            The app failed to load properly. This can happen due to a network
            issue or an outdated version.
          </p>

          <button
            onClick={this.handleManualReload}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyBoundary;

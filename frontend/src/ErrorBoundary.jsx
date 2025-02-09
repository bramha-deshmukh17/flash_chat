import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "20px", color: "red", backgroundColor: "#fdd" }}>
                    <h2>Something went wrong.</h2>
                    {this.state.error && <p><b>Error:</b> {this.state.error.toString()}</p>}
                    {this.state.errorInfo && (
                        <details style={{ whiteSpace: 'pre-wrap', marginTop: "10px" }}>
                            <summary>Details</summary>
                            {this.state.errorInfo.componentStack}
                        </details>
                    )}
                </div>
            );
        }

        // If no error, render children normally
        return this.props.children;
    }
}

export default ErrorBoundary;

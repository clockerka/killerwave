import React from 'react';
interface State {
  hasError: boolean;
  error?: Error | null;
}
class ErrorBoundary extends React.Component<React.PropsWithChildren<Record<string, unknown>>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-black text-white p-4'>
          <div className='max-w-2xl'>
            <h2 className='text-2xl font-bold mb-2'>something went wrong</h2>
            <pre className='whitespace-pre-wrap text-sm bg-zinc-900 p-3 rounded'>{String(this.state.error)}</pre>
            <div className='mt-4'>
              <button onClick={() => window.location.reload()} className='px-4 py-2 bg-sky-500 rounded'>reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
import React from 'react';

export const ErrorBanner = ({ error, onRetry, onNavigateToDiagnostics }) => {
  if (!error) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mb-6 text-rose-900 shadow-xs animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-100 text-rose-600 flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-rose-900">
            Backend Connection Notice
          </h3>
          <p className="text-sm text-rose-700 mt-1 leading-relaxed">
            {error.message || 'Unable to retrieve student records from the Express backend.'}
          </p>

          <div className="mt-3 bg-white/80 backdrop-blur-xs rounded-lg p-3 border border-rose-200 text-xs text-rose-800 space-y-1 font-mono">
            <div>
              <span className="font-semibold text-rose-950">Target API Endpoint: </span>
              {error.endpoint || 'Configured via VITE_API_URL'}
            </div>
            {error.status && (
              <div>
                <span className="font-semibold text-rose-950">HTTP Status: </span>
                {error.status}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry API Connection</span>
            </button>

            {onNavigateToDiagnostics && (
              <button
                onClick={onNavigateToDiagnostics}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Inspect Cloud Diagnostics & Solutions →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;

'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { TestResponse } from '@/lib/api/test-client';

interface OutputConsoleProps {
  outputs: TestResponse[];
  onClear: () => void;
}

export function OutputConsole({ outputs, onClear }: OutputConsoleProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [outputs]);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status === 0) return 'text-gray-400';
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 300 && status < 400) return 'text-yellow-400';
    if (status >= 400 && status < 500) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#1e293b] rounded-lg h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Output Console</h2>
        <button
          onClick={onClear}
          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors flex items-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear Output
        </button>
      </div>

      <div
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm"
      >
        {outputs.length === 0 ? (
          <p className="text-green-400">Click a test button to see results...</p>
        ) : (
          outputs.map((output, index) => (
            <div
              key={index}
              className="bg-[#0f172a] rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getStatusColor(output.status)}`}>
                    {output.status} {output.statusText}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {output.duration}ms
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(output.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(output.data, null, 2), index)}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Copy response"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="mt-3">
                <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(output.data, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useRef, useEffect } from "react";

export default function LogTerminal({ logs }: { logs: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black border border-gray-800 rounded-xl w-full max-w-3xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 border-b border-gray-700">
        <span className="h-3 w-3 rounded-full bg-red-500"></span>
        <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
        <span className="h-3 w-3 rounded-full bg-green-500"></span>
        <p className="text-gray-400 text-xs ml-auto font-mono">SkyCode Terminal</p>
      </div>

      <div className="p-4 font-mono text-green-400 text-sm max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
        {logs.length === 0 && (
          <p className="text-gray-500 animate-pulse">Waiting for logs...</p>
        )}
        {logs.map((log, idx) => (
          <p key={idx} className="whitespace-pre-wrap leading-relaxed">
            {log}
          </p>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

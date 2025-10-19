'use client';
import * as React from 'react';

export default function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  React.useEffect(() => {
    const id = setTimeout(() => onClose?.(), 4000);
    return () => clearTimeout(id);
  }, [onClose]);
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-lg bg-red-600 text-white shadow-lg px-4 py-3 text-sm">
      {message}
    </div>
  );
}


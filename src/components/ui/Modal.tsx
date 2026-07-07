"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="animate-[modal-in_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-strong/45 bg-surface/95 p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="text-lg font-black tracking-tight text-fg bg-gradient-to-r from-accent to-[#6366f1] bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-faint transition-all duration-200 hover:bg-surface-2 hover:text-fg hover:scale-105 active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}


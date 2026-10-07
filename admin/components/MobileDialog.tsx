"use client";

import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type MobileDialogProps = {
  open: boolean;
  id: string;
  label: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: ReactNode;
  className: string;
};

export default function MobileDialog({
  open,
  id,
  label,
  triggerRef,
  onClose,
  children,
  className,
}: MobileDialogProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const root = document.createElement("div");
    root.dataset.mobileDialogRoot = id;
    document.body.appendChild(root);
    setPortalRoot(root);

    return () => {
      root.remove();
      setPortalRoot(null);
    };
  }, [id]);

  useEffect(() => {
    if (!open || !portalRoot) return;

    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const bodySiblings = Array.from(document.body.children).filter(
      (element) => element !== portalRoot,
    ) as HTMLElement[];
    const previousInert = bodySiblings.map((element) => ({
      element,
      inert: element.inert,
    }));
    const previousOverflow = document.body.style.overflow;

    bodySiblings.forEach((element) => {
      element.inert = true;
    });
    document.body.style.overflow = "hidden";

    const focusDialog = () => {
      const firstFocusable =
        dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? dialogRef.current)?.focus();
    };
    const focusFrame = window.requestAnimationFrame(focusDialog);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      previousInert.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      document.body.style.overflow = previousOverflow;

      const restoreTarget = triggerRef.current ?? activeElement;
      if (restoreTarget?.isConnected) restoreTarget.focus();
    };
  }, [open, portalRoot, triggerRef]);

  if (!open || !portalRoot) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`${className} relative`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="閉じる"
          title="閉じる"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {children}
      </div>
    </>,
    portalRoot,
  );
}

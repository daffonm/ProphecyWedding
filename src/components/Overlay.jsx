"use client";

export default function Overlay({
  isOpen,
  onClose,
  children,
  contentClassName = "",
  overlayClassName = "",
}) {
  if (!isOpen) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-9999",                  // full screen + high z
        "bg-gray-900/30 backdrop-blur-[2px]",      // slight blur grey
        overlayClassName,
      ].join(" ")}
      onClick={onClose}                            // click outside -> close
      role="presentation"
    >
      <div
        className={contentClassName}
        onClick={(e) => e.stopPropagation()}      // click inside -> DON'T close
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

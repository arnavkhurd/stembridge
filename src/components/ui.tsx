"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowUpRight, Cpu, Orbit, Search } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import type { DomainId } from "@/lib/types";

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "lime" | "danger";
}) {
  return (
    <button className={cn("button", `button-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("badge", className)}>{children}</span>;
}
export function Avatar({
  name,
  domain = "data-ai",
  size = "normal",
}: {
  name: string;
  domain?: DomainId;
  size?: "small" | "normal" | "large";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("avatar", `avatar-${domain}`, `avatar-${size}`)}
    >
      {initials(name)}
    </span>
  );
}
export function DomainIcon({
  domain,
  className,
}: {
  domain: DomainId;
  className?: string;
}) {
  return domain === "data-ai" ? (
    <Orbit className={className} aria-hidden="true" />
  ) : (
    <Cpu className={className} aria-hidden="true" />
  );
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={cn("modal", wide && "modal-wide")}>
          <div className="modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description className={cn(!description && "sr-only")}>
                {description || title}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
}
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="search-field">
      <Search size={20} aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        autoComplete="off"
        maxLength={160}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          className="icon-button"
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={() => onChange("")}
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

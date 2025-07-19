import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <h1>{title}</h1>
      {actions && (
        <div className="flex gap-5 items-center">
          {actions}
        </div>
      )}
    </header>
  );
} 
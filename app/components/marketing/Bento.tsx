import type { ReactNode } from "react";

export function Bento({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        "grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[auto_auto] md:gap-5 " + className
      }
    >
      {children}
    </div>
  );
}

type BentoItemProps = {
  size?: "large" | "medium" | "small";
  children: ReactNode;
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<BentoItemProps["size"]>, string> = {
  large: "md:col-span-3 md:row-span-2 min-h-[360px]",
  medium: "md:col-span-3 min-h-[170px]",
  small: "md:col-span-2 min-h-[150px]",
};

export function BentoItem({ size = "small", children, className = "" }: BentoItemProps) {
  return (
    <div className={"card-premium relative isolate overflow-hidden p-6 " + SIZE_CLASSES[size] + " " + className}>
      {children}
    </div>
  );
}

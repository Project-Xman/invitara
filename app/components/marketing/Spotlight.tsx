type SpotlightProps = {
  origin?: "top" | "tl" | "tr" | "bl" | "br" | "center";
  intensity?: number;
  className?: string;
};

const ORIGIN_GRADIENTS: Record<NonNullable<SpotlightProps["origin"]>, string> = {
  top: "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(var(--primary) / VAR), transparent 70%)",
  tl: "radial-gradient(ellipse 60% 60% at 0% 0%, oklch(var(--primary) / VAR), transparent 60%)",
  tr: "radial-gradient(ellipse 60% 60% at 100% 0%, oklch(var(--primary) / VAR), transparent 60%)",
  bl: "radial-gradient(ellipse 60% 60% at 0% 100%, oklch(var(--primary) / VAR), transparent 60%)",
  br: "radial-gradient(ellipse 60% 60% at 100% 100%, oklch(var(--primary) / VAR), transparent 60%)",
  center: "radial-gradient(ellipse 70% 50% at 50% 50%, oklch(var(--primary) / VAR), transparent 65%)",
};

export function Spotlight({
  origin = "top",
  intensity = 0.12,
  className = "",
}: SpotlightProps) {
  const gradient = ORIGIN_GRADIENTS[origin].replace("VAR", intensity.toString());
  return (
    <div
      aria-hidden="true"
      className={"pointer-events-none absolute inset-0 " + className}
      style={{ background: gradient }}
    />
  );
}

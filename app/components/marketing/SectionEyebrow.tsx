type SectionEyebrowProps = {
  number?: string;
  label: string;
  className?: string;
};

export function SectionEyebrow({ number, label, className = "" }: SectionEyebrowProps) {
  return (
    <p className={"section-eyebrow " + className}>
      {number && <span className="chapter-num">{number}</span>}
      {number && <span className="h-px w-6 bg-primary/40" />}
      <span>{label}</span>
    </p>
  );
}

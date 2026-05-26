type TestimonialProps = {
  quote: string;
  author?: string;
  context?: string;
  className?: string;
};

export function Testimonial({ quote, author, context, className = "" }: TestimonialProps) {
  return (
    <figure className={"mx-auto max-w-[800px] text-center " + className}>
      <blockquote className="font-display text-3xl md:text-4xl font-light italic leading-[1.2] tracking-[-0.01em] text-foreground">
        <span className="text-primary/60">&ldquo;</span>
        {quote}
        <span className="text-primary/60">&rdquo;</span>
      </blockquote>
      {(author || context) && (
        <figcaption className="mt-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          {author && <span>{author}</span>}
          {author && context && <span className="h-px w-6 bg-muted-foreground/40" />}
          {context && <span className="text-muted-foreground/70">{context}</span>}
        </figcaption>
      )}
    </figure>
  );
}

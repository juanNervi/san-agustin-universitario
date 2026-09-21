type ClubMarkProps = {
  className?: string;
  decorative?: boolean;
};

export function ClubMark({ className, decorative = false }: ClubMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/media/escudo.png"
      alt={decorative ? "" : "Escudo de San Agustín Universitario"}
      width={260}
      height={355}
      className={className}
      aria-hidden={decorative}
    />
  );
}

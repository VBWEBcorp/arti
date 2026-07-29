type ReservationContent = {
  title: string
  intro1: string
  intro2?: string
  zenchefUrl: string
}

/**
 * Bloc de réservation en ligne : texte d'intro + module de booking Zenchef
 * (iframe). L'identifiant/URL Zenchef est éditable via l'admin (Infos pratiques).
 */
export function ReservationWidget({ content }: { content: ReservationContent }) {
  return (
    <div className="mx-auto max-w-2xl px-6 sm:px-10">
      <h2 className="text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
        {content.title}
      </h2>

      <div className="mx-auto mt-6 max-w-xl space-y-4 text-center text-sm leading-relaxed text-foreground/85">
        <p>{content.intro1}</p>
        {content.intro2 && <p>{content.intro2}</p>}
      </div>

      <div className="mt-10">
        <iframe
          src={content.zenchefUrl}
          title="Réservation en ligne — ARTI"
          loading="lazy"
          className="mx-auto block w-full"
          style={{ maxWidth: 600, height: 630, border: 0, borderRadius: 10 }}
        />
      </div>
    </div>
  )
}

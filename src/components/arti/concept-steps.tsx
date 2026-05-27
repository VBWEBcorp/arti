import Image from 'next/image'

const steps = [
  {
    n: '1',
    title: 'Choisissez',
    icon: '/brand/tasse-icone.png',
    body:
      "En arrivant, l'équipe d'Arti prendra quelques minutes pour vous donner toutes les explications nécessaires sur la peinture, les techniques et le matériel puis c'est parti ! Vous pourrez choisir la céramique de votre choix parmi une large sélection de pièces : bol, tasse, vase, assiette, coquetier…",
  },
  {
    n: '2',
    title: 'Décorez',
    icon: '/brand/pot-icone.png',
    body:
      "A vos pinceaux ! Choisissez vos couleurs et laissez libre court à votre créativité. Si les idées venaient à vous manquer, un carnet d'inspiration sera à votre disposition pour vous permettre de réaliser les plus jolies des créations.",
  },
  {
    n: '3',
    title: 'Patientez',
    icon: '/brand/verre-icone.png',
    body:
      "A la fin de votre atelier, nous récupérons votre pièce afin de l'émailler et la cuire dans notre four à haute température (1 000°C). Cela révèlera les couleurs et la rendra étanche !",
  },
  {
    n: '4',
    title: 'Récupérez',
    icon: '/brand/potettasse-icone.png',
    body:
      'Environ 3 semaines plus tard, vous pourrez passer au café pour découvrir et récupérer votre création.',
  },
] as const

export function ConceptSteps({ title = 'Le concept' }: { title?: string }) {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <h2 className="text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
          {title}
        </h2>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {steps.map(({ n, title: t, icon, body }) => (
            <div key={n} className="flex flex-col items-center text-center">
              <Image
                src={icon}
                alt={t}
                width={180}
                height={180}
                className="mb-8 h-28 w-auto object-contain sm:h-32"
              />
              <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">
                {n}. {t}
              </h3>
              <p className="mt-4 text-justify text-sm leading-relaxed text-foreground/70">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Link } from "@tanstack/react-router";
import { ArrowRight, Activity, Landmark } from "lucide-react";
import { AppShell } from "@/components/nodes/AppShell";
import { Logo, SimBadge } from "@/components/nodes/Logo";
import maratonImg from "@/assets/maraton.jpg";
import mascletaImg from "@/assets/mascleta.jpg";
import { maraton } from "@/scenarios/maraton";

export function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:py-12">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between lg:hidden">
          <Logo className="text-4xl sm:text-5xl lg:hidden" />
          <SimBadge className="lg:hidden" />
        </div>
        <h1 className="mt-4 max-w-xl font-display text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl lg:mt-0 lg:text-5xl">
          Datos para decidir a tiempo en eventos de calle
        </h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          Nodos LiDAR temporales que cuentan personas por zona. Sin caras: solo recuentos y densidades.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:gap-6">
          <EventCard
            to="/map"
            img={maratonImg}
            icon={<Activity className="h-8 w-8" strokeWidth={1.8} />}
            title={maraton.name}
            subtitle={`${maraton.schedule.start}–${maraton.schedule.end} · ${maraton.nodes.length} nodos`}
            nodes={maraton.nodes}
          />
          <EventCard
            img={mascletaImg}
            icon={<Landmark className="h-8 w-8" strokeWidth={1.8} />}
            title="Mascletà · plaza del Ayuntamiento"
            subtitle="12:30–15:30 · 4 nodos · próximamente"
          />
        </div>
      </div>
    </AppShell>
  );
}

function EventCard({ to, img, icon, title, subtitle, nodes }: { to?: "/map"; img: string; icon: React.ReactNode; title: string; subtitle: string; nodes?: typeof maraton.nodes }) {
  const body = (
    <div className="group relative h-52 overflow-hidden rounded-3xl shadow-card sm:h-60 lg:h-72">
      <img src={img} alt="" width={1024} height={640} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-photo-fade" />
      <div className="absolute inset-x-0 top-0 p-5 text-primary">{icon}</div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div className="min-w-0 text-on-photo">
          <h2 className="font-display text-xl font-bold leading-tight sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm opacity-85">{subtitle}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
  return <div>
    {to ? <Link to={to}>{body}</Link> : <div className="cursor-not-allowed opacity-90">{body}</div>}
    {nodes && <ul aria-label="Nodos del Medio Maratón" className="mt-3 divide-y divide-border">
      {nodes.map((node) => <li key={node.id}><Link to="/node/$id" params={{ id: node.id }} search={{ t: undefined }} className="flex items-center justify-between gap-3 py-2 text-sm hover:text-primary"><span><span className="mr-2 text-xs font-semibold text-muted-foreground">{node.short}</span>{node.name}</span><ArrowRight className="h-4 w-4 shrink-0" /></Link></li>)}
    </ul>}
  </div>;
}

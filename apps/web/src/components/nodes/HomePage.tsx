import { Link } from "@tanstack/react-router";
import { ArrowRight, Activity, Landmark } from "lucide-react";
import { AppShell } from "@/components/nodes/AppShell";
import { Logo } from "@/components/nodes/Logo";
import maratonImg from "@/assets/maraton.jpg";
import mascletaImg from "@/assets/mascleta.jpg";
import { maraton } from "@/scenarios/maraton";
import { mascleta } from "@/scenarios/mascleta";

export function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:py-12">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between lg:hidden">
          <Logo className="text-4xl sm:text-5xl lg:hidden" />
        </div>
        <h1 className="mt-4 max-w-xl font-display text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl lg:mt-0 lg:text-5xl">
          Datos para decidir a tiempo en eventos de gran afluencia de personas.
        </h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          Nodos LiDAR temporales que cuentan personas por zona. Sin caras: solo recuentos y densidades.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:gap-6">
          <EventCard
            scenarioId={maraton.id}
            img={maratonImg}
            icon={<Activity className="h-8 w-8" strokeWidth={1.8} />}
            title={maraton.name}
            subtitle={`${maraton.schedule.start}–${maraton.schedule.end} · ${maraton.nodes.length} nodos`}
          />
          <EventCard
            scenarioId={mascleta.id}
            img={mascletaImg}
            icon={<Landmark className="h-8 w-8" strokeWidth={1.8} />}
            title={mascleta.name}
            subtitle={`${mascleta.schedule.start}–${mascleta.schedule.end} · ${mascleta.nodes.length} nodos`}
          />
        </div>
      </div>
    </AppShell>
  );
}

function EventCard({ scenarioId, img, icon, title, subtitle }: { scenarioId?: string; img: string; icon: React.ReactNode; title: string; subtitle: string }) {
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
    {scenarioId ? <Link to="/map" search={scenarioId === "maraton" ? {} : { scenario: scenarioId }}>{body}</Link> : <div className="cursor-not-allowed opacity-90">{body}</div>}
  </div>;
}

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Ambulance, TestTube, Heart, Stethoscope } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-secondary/30 to-background py-8 md:py-20 px-4 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-row items-center gap-2 md:gap-12">
          <div className="flex-1 space-y-2 md:space-y-6">
            <h1 className="text-sm sm:text-lg md:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-tight">
              Your Health, <br />
              <span className="text-foreground">Our Priority</span>
            </h1>
            <p className="text-[8px] sm:text-[10px] md:text-xl text-muted-foreground max-w-xl leading-relaxed line-clamp-2 md:line-clamp-none">
              At Wellness Hospital, your health is our greatest priority. Our dedicated team is committed to providing compassionate, expert care.
            </p>
            <div className="flex flex-row gap-1.5 md:gap-4 pt-1 md:pt-4">
              <Link
                href="/appointments"
                className="inline-flex items-center justify-center h-9 md:h-12 px-4 md:px-6 rounded-lg md:rounded-xl bg-primary text-primary-foreground text-xs md:text-base font-semibold shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Book Appointment
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center h-9 md:h-12 px-4 md:px-6 rounded-lg md:rounded-xl border border-border bg-card text-foreground text-xs md:text-base font-medium shadow-sm hover:bg-muted transition-colors whitespace-nowrap"
              >
                Explore Services
              </Link>
            </div>
          </div>
          <div className="flex-[0.6] md:flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full aspect-square md:aspect-[4/3] max-w-[100px] sm:max-w-[150px] md:max-w-xl group">
              <div className="absolute -inset-2 md:-inset-4 bg-primary/10 blur-xl md:blur-3xl rounded-full hidden md:block" />
              <Image
                src="/images/hospital-building.jpg"
                alt="Wellness Hospital"
                fill
                className="object-cover rounded-lg md:rounded-[2rem] shadow-lg md:shadow-2xl relative z-10 border border-white/20"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Banner */}
      <section className="w-full py-3 md:py-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-2 md:px-8">
          <div className="grid grid-cols-5 gap-1 md:gap-4 text-center">
            <Link href="/emergency" className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg hover:bg-white/10 transition-colors">
              <Phone className="w-4 h-4 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-medium">Emergency</span>
            </Link>
            <Link href="/ambulance" className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg hover:bg-white/10 transition-colors">
              <Phone className="w-4 h-4 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-medium">Ambulance</span>
            </Link>
            <Link href="/doctors" className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg hover:bg-white/10 transition-colors">
              <Stethoscope className="w-4 h-4 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-medium">Find Doctors</span>
            </Link>
            <Link href="/blood-collection" className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg hover:bg-white/10 transition-colors">
              <TestTube className="w-4 h-4 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-medium">Lab@Home</span>
            </Link>
            <Link href="/health-packages" className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg hover:bg-white/10 transition-colors">
              <Heart className="w-4 h-4 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-sm font-medium">Health Packs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview Grid */}
      <section className="w-full py-8 md:py-20 px-4 md:px-16 bg-background">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-12">
          <div className="text-center space-y-1 md:space-y-4">
            <h2 className="text-sm md:text-3xl font-bold text-foreground">Expert Care for Every Member</h2>
            <p className="text-[8px] md:text-base text-muted-foreground max-w-xl mx-auto">From regular check-ups to specialized treatments, we offer a range of services.</p>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-6">
            <ServiceCard image="/images/cardiology-v2.png" title="Cardiology" description="Advanced heart care and diagnostics." href="/services#cardiology" />
            <ServiceCard image="/images/pediatrics.png" title="Pediatrics" description="Specialized care for infants, children." href="/services#pediatrics" />
            <ServiceCard image="/images/orthopedics.png" title="Orthopedics" description="Comprehensive bone and joint treatment." href="/services#orthopedics" />
            <ServiceCard image="/images/cardiac-emergency-v3.png" title="Emergency" description="24/7 urgent care for critical medical situations." href="/emergency" />
          </div>

          <div className="text-center">
            <Link href="/services" className="inline-flex items-center gap-1 text-primary text-[10px] md:text-base font-medium hover:underline">
              View All Services <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({ icon: Icon, image, title, description, href }: { icon?: any, image?: string, title: string, description: string, href: string }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <Link href={href} className="flex flex-col rounded-lg md:rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all group block overflow-hidden h-full">
      <div className="w-full aspect-square md:aspect-[4/3] relative overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center transition-colors group-hover:from-primary/10 group-hover:to-primary/30">
            <Icon className="w-6 h-6 md:w-12 md:h-12 text-primary/40 group-hover:text-primary transition-colors" />
          </div>
        )}
      </div>

      <div className="p-1.5 md:p-6 flex flex-col flex-1">
        <h3 className="text-[10px] md:text-xl font-bold mb-0.5 md:mb-2 group-hover:text-primary transition-colors truncate">{title}</h3>
        <p className="text-muted-foreground text-[8px] md:text-sm leading-tight mb-1 md:mb-4 line-clamp-1 md:line-clamp-2">{description}</p>
        <div className="mt-auto flex items-center gap-1 text-primary text-[8px] md:text-sm font-medium">
          More <ArrowRight className="w-2 h-2 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

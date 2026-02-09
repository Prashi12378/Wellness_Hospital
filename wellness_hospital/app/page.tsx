import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Ambulance, TestTube, Heart, Stethoscope, ChevronRight } from "lucide-react";
import BookingButton from "@/components/BookingButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">

      {/* 1. APP HEADER HERO */}
      {/* Deep Blue Gradient - "Premium App" Feel */}
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-b from-primary to-blue-800 pt-32 pb-40 px-4 md:px-16 overflow-hidden">
        {/* Background Pattern/Image */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image
            src="/images/hospital-building.jpg"
            alt="Hospital Background"
            fill
            className="object-cover animate-zoom-slow"
            priority
          />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-40 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float-medium pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto text-center md:text-left">
          <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 leading-tight whitespace-nowrap animate-fade-in-up">
            Your Health, Our Priority
          </h1>
          <p className="text-blue-100 text-sm md:text-xl mb-6 max-w-lg mx-auto md:mx-0 opacity-90 animate-fade-in-up delay-100">
            Expert care with a personal touch. Wellness Hospital is committed to your well-being.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 animate-fade-in-up delay-200">
            <div className="animate-pulse-glow rounded-xl">
              <BookingButton className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95" />
            </div>
            <Link href="/services" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/20 transition-all">
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FLOATING QUICK ACTIONS */}
      {/* Overlaps the Heron Section for 3D Depth */}
      <section className="relative w-full -mt-12 px-4 z-20 md:mt-0 md:py-8 md:bg-white md:static">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 md:shadow-none md:p-0 md:bg-transparent border border-slate-100/50 md:border-none">

            {/* Mobile: Horizontal Scrollable List */}
            <div className="flex md:grid md:grid-cols-5 overflow-x-auto hide-scrollbar gap-4 md:gap-6 snap-x snap-mandatory pb-2 md:pb-0">

              {/* Book Appointment (Mobile Only Primary Action) */}
              <Link href="/appointments" className="min-w-[85px] snap-center flex flex-col items-center gap-2 group md:hidden">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 group-active:scale-95 transition-transform">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">Book Now</span>
              </Link>

              <QuickAction icon={Phone} label="Emergency" href="/emergency" color="text-red-500" bg="bg-red-50" />
              <QuickAction icon={Ambulance} label="Ambulance" href="/ambulance" color="text-blue-500" bg="bg-blue-50" />
              <QuickAction icon={Stethoscope} label="Doctors" href="/doctors" color="text-teal-500" bg="bg-teal-50" />
              <QuickAction icon={TestTube} label="Lab Tests" href="/blood-collection" color="text-purple-500" bg="bg-purple-50" />
              <QuickAction icon={Heart} label="Packages" href="/health-packages" color="text-pink-500" bg="bg-pink-50" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES CAROUSEL */}
      <section className="w-full py-8 md:py-20 px-4 md:px-16">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg md:text-3xl font-bold text-slate-800">Our Services</h2>
            <Link href="/services" className="text-xs font-semibold text-primary flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Horizontal Scroll on Mobile */}
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-0">
            <ServiceCard title="Cardiology" desc="Heart Care" icon={Heart} image="/images/cardiology-v2.png" href="/services#cardiology" />
            <ServiceCard title="Pediatrics" desc="Child Care" icon={Stethoscope} image="/images/pediatrics.png" href="/services#pediatrics" />
            <ServiceCard title="Orthopedics" desc="Bone & Joint" icon={UserIconPlaceholder} image="/images/orthopedics.png" href="/services#orthopedics" />
            <ServiceCard title="Emergency" desc="24/7 Support" icon={Phone} image="/images/cardiac-emergency-v3.png" href="/emergency" />
          </div>
        </div>
      </section>

      {/* 4. EXCLUSIVE PACKAGES (New Content) */}
      <section className="w-full py-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg md:text-3xl font-bold text-slate-800">Health Packages</h2>
            <Link href="/health-packages" className="text-xs font-semibold text-primary flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 -mx-4 px-4 snap-x snap-mandatory">
            <PackageCard
              title="Full Body Checkup"
              price="₹2,999"
              color="bg-white border-l-4 border-primary"
              textColor="text-slate-800"
              items={["Blood Test", "ECG", "X-Ray", "Consultation"]}
            />
            <PackageCard
              title="Heart Health"
              price="₹1,499"
              color="bg-white border-l-4 border-sky-400"
              textColor="text-slate-800"
              items={["Lipid Profile", "TMT", "Echo", "Cardiologist"]}
            />
            <PackageCard
              title="Diabetes Care"
              price="₹999"
              color="bg-white border-l-4 border-blue-300"
              textColor="text-slate-800"
              items={["HbA1c", "Sugar Fasting", "Diet Chart"]}
            />
          </div>
        </div>
      </section>



    </main >
  );
}

// Helper Components for Cleaner Code

function QuickAction({ icon: Icon, label, href, color, bg }: { icon: any, label: string, href: string, color: string, bg: string }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <Link href={href} className="min-w-[75px] md:w-auto snap-center flex flex-col items-center gap-2 group">
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
        <Icon className={`w-5 h-5 md:w-7 md:h-7 ${color}`} />
      </div>
      <span className="text-[10px] md:text-sm font-semibold text-slate-600 text-center leading-tight group-hover:text-primary transition-colors">{label}</span>
    </Link>
  )
}

function ServiceCard({ title, desc, image, href, icon: Icon }: { title: string, desc: string, image?: string, href: string, icon: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <Link href={href} className="min-w-[160px] md:w-auto snap-center relative aspect-[3/4] md:aspect-[4/3] rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all">
      {image ? (
        <Image src={image} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
      ) : (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Icon className="w-8 h-8 text-slate-400" /></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
        <h3 className="text-white font-bold text-sm md:text-lg">{title}</h3>
        <p className="text-white/80 text-xs md:text-sm font-medium">{desc}</p>
      </div>
    </Link>
  )
}

function PackageCard({ title, price, color, textColor, items }: { title: string, price: string, color: string, textColor: string, items: string[] }) {
  return (
    <div className={`min-w-[260px] snap-center rounded-2xl p-5 ${color} shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow`}>
      {/* Background Icon (Decorative) */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

      <h3 className={`text-lg font-bold mb-1 ${textColor}`}>{title}</h3>
      <div className={`text-2xl font-bold mb-3 text-primary`}>{price}</div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="text-xs font-medium bg-slate-50 text-slate-600 w-fit px-2 py-0.5 rounded-md inline-block mr-1 mb-1 border border-slate-100">{item}</div>
        ))}
      </div>
      <div className="mt-4 text-xs font-semibold text-primary flex items-center gap-1 opacity-90 group-hover:opacity-100">
        Book Now <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  )
}

function DoctorAvatar({ name, dept }: { name: string, dept: string }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px] snap-center group">
      <div className={`w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-primary ring-2 ring-white shadow-sm group-hover:ring-primary/20 transition-all`}>
        {name.charAt(4)}
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-slate-700">{name}</div>
        <div className="text-[10px] text-slate-500">{dept}</div>
      </div>
    </div>
  )
}

const UserIconPlaceholder = Stethoscope; // Fallback icon

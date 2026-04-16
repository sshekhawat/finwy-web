import Image from "next/image";

export function HomeTestimonial() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          className="object-cover blur-sm brightness-[0.35]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#071229]/85" />
      </div>
      <div className="relative z-[1] mx-auto max-w-3xl px-4 text-center text-white">
        <div className="mx-auto mb-8 size-24 overflow-hidden rounded-full border-4 border-orange-400/80 shadow-xl">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
            alt="Client"
            width={96}
            height={96}
            className="size-full object-cover"
          />
        </div>
        <span className="font-serif text-6xl leading-none text-orange-400 opacity-90 md:text-7xl">
          “
        </span>
        <blockquote className="-mt-4 text-lg leading-relaxed text-white/95 md:text-xl">
          Finwy gave us a credible demo for investors overnight—real wallets, real audit
          logs, and a dashboard that actually looks like a product. We replaced slides with
          working software.
        </blockquote>
        <p className="mt-8 font-semibold">Priya Sharma</p>
        <p className="text-sm text-white/70">CFO, Northwind Labs</p>
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === 0 ? "bg-orange-400" : "bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

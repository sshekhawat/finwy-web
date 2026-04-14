import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    title: "Bigger runway on the road to product–market fit",
    date: "15 Apr 2026",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    href: "/about",
  },
  {
    title: "Why we chose double-entry for every wallet movement",
    date: "02 Apr 2026",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    href: "/about",
  },
  {
    title: "JWT + refresh rotation without losing your mind",
    date: "22 Mar 2026",
    img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
    href: "/about",
  },
];

export function HomeBlog() {
  return (
    <section id="blog" className="scroll-mt-24 bg-slate-50 py-16 dark:bg-slate-950/40 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-serif text-3xl font-bold text-[#0c1e45] dark:text-white md:text-4xl">
          Latest from our blog
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Notes from building a production-shaped fintech stack on Next.js and PostgreSQL.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {posts.map((p) => (
            <article
              key={p.title}
              className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={p.href} className="relative block aspect-[16/10] overflow-hidden">
                <Image
                  src={p.img}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute bottom-3 left-3 rounded bg-[#1e4fd6] px-3 py-1 text-xs font-medium text-white shadow">
                  {p.date}
                </span>
              </Link>
              <div className="p-5">
                <h3 className="font-semibold leading-snug text-[#0c1e45] dark:text-white">
                  {p.title}
                </h3>
                <Link
                  href={p.href}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  Learn more
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1531932594968-e5e5e9dee95a?auto=format&fit=crop&w=2200&q=90'
const LOGO = 'https://customer-assets-m6fa6gv7.emergentagent.net/job_himalayan-estates-1/artifacts/eidamywr_HImmm.jpeg'

export default function AuthPageShell({ eyebrow, title, description, Icon, children }) {
  return (
    <main className="min-h-screen bg-[#edf2ed] text-foreground">
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <a href="/" aria-label="HimBhumi home" className="group flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#f6efe1] shadow-sm ring-1 ring-[#c9a86a]/70">
            <img src={LOGO} alt="" className="h-full w-full object-cover" style={{ transform: 'scale(2.1)', objectPosition: '50% 30%' }} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-2xl tracking-tight">Him<span className="italic text-[#c9a86a]">Bhumi</span></span>
            <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Real Estates</span>
          </span>
        </a>
        <a href="/" className="rounded-full border border-teal-900/15 bg-white/70 px-4 py-2.5 text-sm font-semibold text-teal-950 transition hover:border-teal-900/30 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
          Return to website
        </a>
      </header>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 pb-10 pt-5 sm:pb-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-10 lg:pb-20 lg:pt-8">
        <section className="relative hidden min-h-[570px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-[0_30px_80px_-36px_rgba(10,42,32,.5)] lg:block">
          <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,23,29,.08)_15%,rgba(6,23,29,.88)_100%)]" />
          <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e6c887]" />
            North India · curated living
          </div>
          <div className="absolute inset-x-0 bottom-0 p-8 text-white lg:p-10">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#e6c887]"><span className="h-px w-9 bg-[#e6c887]" /> A higher standard</p>
            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.08] tracking-tight lg:text-5xl">Rooted in the <span className="italic text-[#e6c887]">extraordinary.</span></h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75">Thoughtful spaces, considered guidance, and a more personal way to find your place in the hills.</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <div className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0_24px_70px_-32px_rgba(16,54,48,.3)] sm:p-9 lg:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2ed] text-teal-900 ring-1 ring-teal-900/5">
              <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-800">{eyebrow}</p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-slate-600">A considered experience, by HimBhumi Real Estates.</p>
        </section>
      </div>
    </main>
  )
}

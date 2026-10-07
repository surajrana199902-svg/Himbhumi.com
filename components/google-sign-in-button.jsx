export default function GoogleSignInButton({ role = 'user', label = 'Continue with Google' }) {
  return (
    <a
      href={`/api/auth/google?role=${encodeURIComponent(role)}`}
      className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
    >
      <span aria-hidden="true" className="font-bold text-lg text-[#4285f4]">G</span>
      {label}
    </a>
  )
}

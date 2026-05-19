import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="h-14 bg-[#1c2b3a] flex items-center px-5 gap-3 shrink-0">
      <div className="w-9 h-9 rounded-md bg-[#2d7a4f] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
          <path d="M10 2C6 2 3 5.5 3 9c0 2.8 1.6 5.2 4 6.5V17h6v-1.5c2.4-1.3 4-3.7 4-6.5 0-3.5-3-7-7-7zm0 2c2.8 0 5 2.5 5 5 0 1.8-.9 3.4-2.3 4.4L12 14H8l-.7-.6C5.9 12.4 5 10.8 5 9c0-2.5 2.2-5 5-5z" />
        </svg>
      </div>
      <Link
        to="/"
        className="text-sm text-white/90 bg-white/10 hover:bg-white/15 px-4 py-1.5 rounded font-medium transition-colors"
      >
        Dashboard
      </Link>
    </nav>
  );
}

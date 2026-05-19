import { Link } from "react-router-dom";
import logoUrl from "../assets/logo.svg";

export function Navbar() {
  return (
    <nav className="h-14 bg-[#1c2b3a] flex items-center px-5 gap-3 shrink-0">
      <img src={logoUrl} alt="Dossche Mills" className="h-7 w-auto" />
      <Link
        to="/"
        className="text-sm text-white/90 bg-white/10 hover:bg-white/15 px-4 py-1.5 rounded font-medium transition-colors"
      >
        Dashboard
      </Link>
    </nav>
  );
}

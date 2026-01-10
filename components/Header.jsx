import Link from "next/link";
import { t } from "../lib/i18n";
import ConnectionStatus from "./ConnectionStatus";
import WorldClock from "./WorldClock";
import WeatherDisplay from "./WeatherDisplay";

export default function Header({ className = "" }) {
  return (
    <header className={`border-b border-matrix border-matrix-green border-opacity-30 bg-matrix-panel px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-matrix-green text-matrix-glow tracking-wider">
          {t("title")}
        </h1>
        <div className="flex items-center gap-6 flex-wrap">
          <ConnectionStatus />
          <WorldClock />
          <WeatherDisplay />
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-matrix-green border-opacity-20 text-xs text-matrix-green-dim">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse" />
          <span className="font-mono">{t("footer.live")}</span>
        </div>
        <div className="h-4 w-px bg-matrix-green bg-opacity-30 hidden sm:block" />
        <div className="flex items-center gap-3 sm:gap-4 font-mono flex-wrap">
          <Link
            href="/about"
            className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
          >
            {t("footer.about")}
          </Link>
          <a
            href="https://github.com/ayberkenis/matrix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
          >
            {t("footer.github")}
          </a>
          <Link
            href="/why"
            className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
          >
            {t("footer.why")}
          </Link>
          <Link
            href="/faq"
            className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
          >
            {t("footer.faq")}
          </Link>
          <Link
            href="/docs"
            className="text-matrix-green-dim hover:text-matrix-green hover:text-matrix-glow transition-all cursor-pointer"
          >
            {t("footer.docs")}
          </Link>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 px-4 sm:px-6 lg:px-12">
        <Link
          href="/"
          className="flex min-h-16 items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-sm bg-black text-lg font-semibold text-white"
          >
            K
          </span>

          <span className="text-xl font-semibold tracking-tight">
            KulüpKart
          </span>

          <span className="ml-1 rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            Beta
          </span>
        </Link>

        <nav
          aria-label="Öğrenci menüsü"
          className="order-last flex w-full items-center gap-6 overflow-x-auto text-sm md:order-none md:w-auto"
        >
          <Link
            href="/dashboard"
            aria-current="page"
            className="flex min-h-12 shrink-0 items-center border-b-2 border-gray-900 font-medium focus-visible:outline-2 focus-visible:outline-offset-[-4px] md:min-h-16"
          >
            Kartlarım
          </Link>

          <span
            aria-disabled="true"
            className="flex min-h-12 shrink-0 items-center text-gray-500 md:min-h-16"
          >
            Kampanyalar
          </span>

          <span
            aria-disabled="true"
            className="flex min-h-12 shrink-0 items-center text-gray-500 md:min-h-16"
          >
            Kulüpler
          </span>
        </nav>

        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
          Önizleme
        </span>
      </div>
    </header>
  );
}
import type { Metadata } from "next";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import MembershipSelector from "@/components/memberships/membership-selector";

export const metadata: Metadata = {
  title: "Kartlarım",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-gray-900">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Kartlarım</h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Kulüp üyeliklerini ve başvuru durumlarını takip et.
        </p>

        <p className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
          DEMO — Bu ekran henüz hesap ve üyelik verilerine bağlı değildir.
        </p>

        <section aria-labelledby="membership-title" className="mt-8">
          <h2 id="membership-title" className="sr-only">
            Kulüp üyeliklerim
          </h2>

          <MembershipSelector />
        </section>
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:gap-3 sm:px-6 lg:px-12">
          <span className="font-semibold tracking-tight">KulüpKart</span>

          <span className="text-sm text-gray-600">
            Üniversite Kulüp Üyelik Sistemi
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-12">
      <p className="text-sm font-semibold tracking-wide text-indigo-700">
        KulüpKart
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Kampüs hayatın, tek kartta.
      </h1>

      <p className="mt-5 text-base leading-7 text-slate-600">
        Üniversite kulüplerine katıl, üyelik kartlarını görüntüle ve
        kulübüne özel indirimleri keşfet.
      </p>

      <p className="mt-8 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
        KulüpKart hazırlanıyor. Üyelik başvuruları henüz açılmadı.
      </p>
    </main>
  );
}
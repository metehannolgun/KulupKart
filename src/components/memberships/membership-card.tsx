export type MembershipCardData = {
  id: string;
  clubName: string;
  studentName: string;
  status: "active" | "pending" | "expired" | "revoked";
  expiresAt: string | null;
};

type MembershipCardProps = {
  membership: MembershipCardData;
};

const statusLabels: Record<MembershipCardData["status"], string> = {
  active: "Aktif Üye",
  pending: "Onay Bekliyor",
  expired: "Süresi Dolmuş",
  revoked: "İptal Edilmiş",
};

export default function MembershipCard({
  membership,
}: MembershipCardProps) {
  const expirationLabel = membership.expiresAt
    ? new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
      }).format(new Date(membership.expiresAt))
    : membership.status === "active"
      ? "Süresiz"
      : "Henüz belirlenmedi";

  return (
    <article className="flex flex-col gap-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="break-words text-xl font-semibold tracking-tight">
              {membership.clubName}
            </h3>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                membership.status === "active"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {statusLabels[membership.status]}
            </span>
          </div>

          <p className="mt-7 break-words text-2xl font-semibold tracking-tight">
            {membership.studentName}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Kulüp üyelik kartı
          </p>
        </div>

        <dl className="mt-10 border-t border-gray-200 pt-4">
          <dt className="text-xs font-medium text-gray-600">
            Geçerlilik sonu
          </dt>

          <dd className="mt-1 text-sm font-medium">
            {expirationLabel}
          </dd>
        </dl>
      </div>

      <div className="flex flex-col items-center justify-center border-t border-gray-200 pt-6 md:w-56 md:shrink-0 md:border-t-0 md:border-l md:pt-0 md:pl-8">
        <div className="flex size-44 items-center justify-center rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-sm leading-6 text-gray-600">
            QR doğrulaması henüz kullanıma açık değil.
          </p>
        </div>

        <p className="mt-3 text-xs text-gray-600">
          DEMO — Doğrulama yapılamaz
        </p>
      </div>
    </article>
  );
}
"use client";

import { useState } from "react";
import MembershipCard, { type MembershipCardData } from "./membership-card";

const demoMemberships: MembershipCardData[] = [
  {
    id: "cinema",
    clubName: "Sinema Kulübü",
    studentName: "Örnek Öğrenci",
    status: "active",
    expiresAt: "2027-07-01T00:00:00+03:00",
  },
  {
    id: "entrepreneurship",
    clubName: "Girişimcilik Kulübü",
    studentName: "Örnek Öğrenci",
    status: "pending",
    expiresAt: null,
  },
  {
    id: "design",
    clubName: "Tasarım Topluluğu",
    studentName: "Örnek Öğrenci",
    status: "active",
    expiresAt: null,
  },
];

export default function MembershipSelector() {
  const [selectedId, setSelectedId] = useState(demoMemberships[0].id);

  const selectedMembership = demoMemberships.find(
    (membership) => membership.id === selectedId,
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Görüntülenecek kulüp üyeliği"
        className="flex flex-wrap gap-2"
      >
        {demoMemberships.map((membership) => {
          const isSelected = membership.id === selectedId;

          return (
            <button
              key={membership.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedId(membership.id)}
              className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900 ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {membership.clubName}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {selectedMembership ? (
          <MembershipCard membership={selectedMembership} />
        ) : (
          <p className="text-sm text-gray-600">
            Görüntülenecek üyelik bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}

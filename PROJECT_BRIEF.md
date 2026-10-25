# KulüpKart — MVP Product Brief (v1.4)

**Source of truth:** This file defines product scope, business rules, security requirements, and acceptance criteria. `AGENTS.md` defines Codex collaboration rules; `CODEX_START_PROMPT.md` starts the first session. Avoid duplicating this brief in those files.

## 1. Product and scope

KulüpKart is a **mobile-first web app / PWA** replacing physical university club membership cards in Türkiye. Students join clubs, show digital cards, and discover discounts negotiated by their clubs. A business may **optionally** scan a card QR with its own phone to check live membership validity. **No business account or integration is required.**

**No revenue target in the MVP.** Exclude payments, subscriptions, ads, sponsored placements, business dashboards, and POS integrations. **Club-managed campaigns and student campaign discovery ARE included.**

**End-to-end success:** A student signs up with and verifies a university email, applies to a club, gets approved by its administrator, sees an active card and eligible campaigns, and optionally has membership checked through a public QR verification page.

## 2. Roles and club onboarding

| Role | Capabilities |
| --- | --- |
| Platform Super Admin | Manage universities/verified email domains, review club applications, create/suspend clubs, assign/revoke club administrators via `/admin`. |
| Club Admin | For **authorized club(s) only**, review member applications, manage memberships and duration settings, and create/edit/unpublish campaigns via `/club-admin`. Explicitly select the active club if managing several. |
| Student | Sign in, apply to clubs **at their verified university**, view multiple membership cards and eligible campaigns via `/dashboard`. |
| Club applicant | Submit a club onboarding request at `/clubs/apply`; a **verified account** is required to submit. Submitting does not create a club or grant privileges. |
| Business staff | Without login, view a **read-only, privacy-minimized** verification result via `/verify` after optionally scanning a student's QR. |

**Club onboarding:**
1. The applicant supplies university, club name, contact information, and minimum evidence of authority; store `club_applications.status = pending`.
2. Super Admin **manually verifies** that the club exists and the applicant is authorized. Verified email alone does not prove club leadership.
3. Rejection marks the application `rejected` without creating a club or admin role.
4. Approval is an **atomic, idempotent server-side operation** that checks duplicates, creates the club, marks the application approved, and grants the verified applicant a club-scoped admin role. Repeat clicks must not create duplicates.
5. Clubs are `active` or `suspended`. While suspended, cards cannot verify as active and campaigns are hidden. On reinstatement, only unrevoked and unexpired memberships can become valid again.
6. In the MVP, only Super Admin can assign/revoke club admins and reinstate clubs. Revoked access must stop immediately.
7. Prevent duplicate active clubs with the same normalized name within a university; handle duplicate pending requests and rejected resubmissions explicitly.

**Authority:** Store Super Admin records in a protected DB table such as `platform_admins`; store club-scoped admins in `club_admins(user_id, club_id)`. Never derive privileges from user-editable profile fields, route parameters, or UI state. Bootstrap the first Super Admin manually using a known authenticated user ID through a protected setup procedure. Verify identity and permissions server-side on every privileged action.

## 3. Student identity and university eligibility

- Use Supabase Auth with email confirmation. Match the **verified email domain** against a Super Admin-maintained `university_email_domains` allowlist (multiple domains per university; normalize case).
- A student's university selection must match that verified domain. Students may apply only to clubs at their eligible university; enforce this on the server and in DB policies, not just the UI.
- On email change, require reverification and university re-evaluation before new applications. For the MVP, suspend existing card validity if university eligibility becomes invalid until Super Admin review. Test this explicitly.
- Email ownership does **not** prove current enrollment; club approval remains mandatory. Students without a matching university email have no automatic bypass in the MVP; provide a support path.
- Configure confirmation redirects / allowlists and review mail delivery limits, abuse prevention, and rate limits.

## 4. Applications, memberships, and status transitions

Prefer **one membership source of truth**, e.g. `memberships(student_id, club_id, status, applied_at, reviewed_by, reviewed_at, activated_at, expires_at, revoked_at)`, with a unique `(student_id, club_id)` constraint. Concurrent submissions must not create multiple records.

- Stored statuses: `pending -> active | rejected`; `active -> revoked` when an admin cancels membership. Define controlled reapplication after rejection with an audit trail. Students cannot reactivate revoked memberships by themselves.
- **Expired** is a *derived* state: `status = active` but `expires_at <= server_now`; do not rely on a scheduled database status mutation.
- A membership is **currently valid** only if the user's verified email/university eligibility is valid, the club is active, the membership status is active, and `expires_at` is null or later than trusted server time.
- Club administrators approve renewals/extensions. Server-side state transitions must reject invalid or repeated operations and log important changes (approval, rejection, revocation, renewal, role changes) to `audit_events` or equivalent without leaking secrets.
- A user may be a student of one club and admin of another; all authorization is club-scoped.

## 5. Per-club membership duration

Each club configures **indefinite**, **academic-year end** (explicit date), or **custom duration/end date**. Resolve and persist each member's `expires_at` **at approval**. Joining late in an academic year still uses that chosen end date. Changing club policy must **not retroactively alter existing memberships**; bulk renewals are separate deliberate operations.

Store instants as UTC-aware PostgreSQL `timestamptz`; display in `Europe/Istanbul`. Specify an unambiguous inclusive/exclusive boundary for dates such as “valid through 31 August”; never trust device clocks.

## 6. Digital cards and optional QR verification

- Cards display student's name, club name/logo, membership status, and expiration if any. The visible card or screenshot is **not guaranteed identity proof**.
- Only the authenticated card owner may request a QR for a currently valid membership. Use a **signed, unpredictable, short-lived token** (initial target: 60 seconds), renewed while the card is open. The QR points to `/verify` with a token, never raw email, phone, national ID, or name.
- The publicly accessible `/verify` page validates signature and expiry **and rechecks the current membership/club/university eligibility in the database**, every time. It is read-only, requires no business login, and must not expose an enumerable membership lookup.
- Use clear localized statuses: active, expired, revoked, suspended club, invalid/expired QR. Invalid QR responses reveal no unnecessary personal data. Show the **minimum** needed to verify membership (typically club and status); any name display requires a deliberate privacy decision.
- A live-shared QR can still be abused; short expiry mainly limits stale screenshots. Offline verification is **not** supported and must never report an offline result as confirmed active.
- All member-specific pages/APIs, QR issuance, and `/verify` results must use `Cache-Control: no-store`; exclude them from PWA service-worker caching and shared CDN/ISR caches. Avoid token exposure in access logs, analytics, or referrers (`Referrer-Policy: no-referrer`, redaction). Apply reasonable public endpoint rate limits.

## 7. Club campaigns — included in the MVP

- Only admins authorized for the specific club can create, edit, activate, or unpublish that club's campaigns. **Businesses have no accounts.**
- Fields: `club_id`, business name, title, discount value/text, description, category, conditions, optional address/location/image, start/end instants, publication status.
- Students see only **published, date-valid** campaigns belonging to their **currently valid memberships in active clubs**. Enforce through trusted queries and RLS, not only front-end filtering. Direct ID/API access must not expose other clubs' member-only campaigns.
- Present all eligible campaigns in **one feed** with a **club filter**; category filter is optional. A business may have separate agreements with several clubs; do not automatically share those campaigns.
- Admins manage campaign content and terms; Super Admin can remove inappropriate content. No checkout or discount redemption tracking in the MVP.

## 8. Routes and stack

| Route | Purpose |
| --- | --- |
| `/dashboard` | Student applications, cards, unified campaign feed |
| `/club-admin` | Club-scoped membership and campaign management |
| `/admin` | Platform Super Admin operations |
| `/clubs/apply` | Club onboarding request form |
| `/verify` | Public, minimal, read-only QR verification |

**Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL/RLS, mobile-first PWA; one Next.js application. Use current supported `@supabase/ssr` patterns. Never use unverified `getSession()` data alone as proof of authorization; use verified user/claims plus DB permissions.

**Security invariants:**
- Apply both PostgreSQL **GRANTs and RLS** to each exposed table. Student and club access must be strictly scoped; test direct queries and APIs for cross-club and cross-university leaks.
- Critical changes must be authorized server-side and, where appropriate, **atomic and idempotent**. Keep any privileged DB key strictly server-side, separate from cookie-bound user clients. Never expose secret/service-role keys to the browser, `NEXT_PUBLIC_*`, or git.
- Restrict `SECURITY DEFINER` functions: fixed `search_path`, schema-qualified tables, narrow `EXECUTE` privileges, explicit per-user/per-club checks. Test RLS recursion and privilege escalation.
- Suggested entities: `universities`, `university_email_domains`, `profiles`, `club_applications`, `clubs`, `platform_admins`, `club_admins`, `memberships`, `campaigns`, `audit_events`. Propose keys, FKs, uniqueness, indexes, roles, and policies **before** creating migrations.
- Use `.env.local` (gitignored) for secrets and `.env.example` for names only. Explicitly distinguish mock/demo UI from real Auth/DB behavior.
- Apply data minimization and prepare a privacy notice, retention/deletion policy, and data access/deletion request workflow. Review KVKK compliance before real deployment.

## 9. Explicitly out of scope

Payments, subscriptions, monetization, sponsored ads, business login/admin, POS, native apps, Apple/Google Wallet, advanced analytics, CRM, chat, notifications, and offline QR verification.

## 10. Build phases

1. Inspect repository and plan routes, schema/keys, permissions, threat cases; bootstrap Next.js, initial UI skeletons, `.env.example`.
2. Supabase Auth, verified university email/domain mapping, profile and eligibility controls.
3. Club application + Super Admin approval/role assignment; student application + Club Admin approval; RLS and transactional tests.
4. Digital cards + 60-second QR issuance + live public verification + cache/privacy protections.
5. Campaign CRUD + unified filtered student feed + membership-aware access tests.
6. PWA, responsive testing, multi-club tests, privacy essentials, pilot deployment.

Build **small, verifiable vertical slices**; do not implement all phases at once. Mentoring and task ownership rules live in `AGENTS.md`.

## 11. Acceptance and adversarial tests

- Unverified or mismatched email cannot apply; a student cannot join a different university's club by editing requests.
- Two concurrent applications to the same club produce one membership; the same student may join different clubs.
- Applying to onboard a club never creates a club or grants admin access; double-approving does not create duplicate clubs/roles.
- A regular user cannot become Super Admin; a club admin cannot read/write another club's applications, memberships, campaigns, or roles, including through direct APIs.
- One user's different roles across multiple clubs remain isolated.
- Email changes cannot bypass university eligibility rules.
- Pending/rejected/revoked/expired memberships and suspended clubs never verify as active. State changes take effect on the **next verification request**.
- Tampered or older-than-TTL QR tokens fail; verification does not return cached success or claim offline confirmation.
- A public QR cannot enumerate personal profiles or other memberships and cannot mutate data.
- Membership-ineligible students cannot access campaigns through direct URLs/API calls. Ended or unpublished campaigns remain hidden.
- Duration-policy changes do not silently change existing memberships; academic-year deadlines obey Istanbul time boundaries.
- Sensitive pages, cookies, QR tokens, and verification results never enter shared caches or client logs.
- PWA can be installed to a supported mobile home screen; card, applications, and campaigns remain usable on mobile.

## 12. Language and UX

- **Documentation, code, identifiers, comments, and commit messages: English.**
- **Codex's explanations, mentoring, and reviews to the developer: Turkish**, brief and practical; preserve English technical terms.
- **All user-facing UI copy: natural Turkish**. Prefer accessible labels, visible errors, and clear empty/pending states.

## References

- Supabase SSR: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API key safety: https://supabase.com/docs/guides/getting-started/api-keys
- Next.js PWA: https://nextjs.org/docs/app/guides/progressive-web-apps

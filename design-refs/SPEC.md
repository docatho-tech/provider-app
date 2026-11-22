# Provider app — design reference

The 26 PNGs in this folder are the contract for the provider ("partner") app UI.
They are Figma-canvas screenshots at roughly 1.3–1.4× device scale, so treat the
colours and the ordering as exact and the pixel offsets as proportional.

`pixel.py probe <png> --row N` prints a scanline as colour runs, which is how the
palette below was measured.

## Files

| File | Screen |
|---|---|
| `doctor-dashboard.png` | Doctor — Dashboard tab |
| `doctor-all-appointments.png` | Doctor — All Appointments |
| `doctor-appointment-pending.png` | Doctor — appointment detail, awaiting accept |
| `doctor-appointment-scheduled.png` | Doctor — appointment detail, accepted, not started |
| `doctor-appointment-join.png` | Doctor — appointment detail, patient waiting in session |
| `lab-dashboard.png` | Lab / Diagnostic Centre — Dashboard tab |
| `lab-all-tests.png` | Lab — All Tests |
| `lab-booking-pending.png` | Lab — booking detail, awaiting accept |
| `lab-booking-accepted.png` | Lab — booking detail, accepted |
| `pharmacy-dashboard-new.png` | Pharmacy — Dashboard, "New" tab |
| `pharmacy-dashboard-inprogress.png` | Pharmacy — Dashboard, "In Progress" tab |
| `pharmacy-dashboard-completed.png` | Pharmacy — Dashboard, "Completed" tab |
| `pharmacy-order-new.png` | Pharmacy — order detail, new order |
| `pharmacy-order-intransit.png` | Pharmacy — order detail, in transit |
| `pharmacy-order-delivered.png` | Pharmacy — order detail, delivered |
| `notifications-all.png` | Notifications — "All" filter |
| `notifications-inclinic.png` | Notifications — "In clinic Visits" filter |
| `notifications-online.png` | Notifications — "Online Consults" filter |
| `doctor-insights.png` | Insights — doctor (2 charts) |
| `lab-insights.png` | Insights — lab (3 charts) |
| `pharmacy-insights.png` | Insights — pharmacy (3 charts) |
| `lab-tests-catalog.png` | Tests Catalog — lab |
| `pharmacy-medicines-catalog.png` | Medicines Catalog — pharmacy |
| `earnings-empty.png` | My Earnings — nothing earned yet |
| `earnings-no-bank.png` | My Earnings — earned, no account on file |
| `earnings-scheduled.png` | My Earnings — payout scheduled |

## Palette (measured, not guessed)

| Token | Hex | Used for |
|---|---|---|
| `primary` | `#204BB6` | Header band, primary buttons, links, active tab text, icons |
| `page` | `#F3F3F3` | Screen background behind the cards |
| `cardHeader` | `#F7F7F7` | The titled strip at the top of every card |
| `iconPill` | `#E7EDF7` | The rounded square behind a list-row icon |
| `text` | `#313131` | Primary text |
| `textSecondary` | `#444444` | Secondary text |
| `textMuted` | `#989898` | Timestamps, "23 y • M" metadata |
| `successBg` / `successText` | `#D5EAD8` / `#3A633B` | "Delivered" chip |
| `successAction` | `#52A831` | "Mark Delivered" button |
| `warnBg` / `warnBorder` / `warnText` | `#EDE8DC` / `#D4B879` / `#BB892E` | Auto-accept countdown banner |
| `danger` | `#EA3323` | "Reject" outline button and its label |
| `neutralChipBg` | `#313131` @ 80% | "In Transit" / "New Order" status chip |
| `tabTrack` | `#E9E9E9` | Segmented-control track |
| `surfaceAlt` | `#F3F5F9` | Inner tinted panel on the lab detail cards |

| `star` | `#F3B13E` | Filled star on a rating notification |
| `noticeBg` / `noticeBorder` / `noticeText` | `#FEFCEC` / `#DCD1B7` / `#7A4F21` | "Add bank account" notice on My Earnings |
| `chartBlue` / `chartGreen` / `chartOrange` | `#204BB6` / `#509E2D` / `#E36940` | Insights lines, in card order |

Card geometry: 16 px page gutter, 16 px card radius, 1 px `#0000001A` border,
white body, `#F7F7F7` header strip with the section icon + title, hairline
`#3131311A` separators between rows. The separator is **inset by the row's own
16 px padding**, not run card-edge to card-edge — measured on
`pharmacy-order-delivered.png`, where the card spans x=27–504 and the hairline
x=56–476.

## Personas and tab bars

`Provider.provider_type` selects the persona. The tab bar differs per persona —
this is the thing to get right first, everything else hangs off it.

| Persona | `provider_type` | Tabs |
|---|---|---|
| Doctor | `Doctor` | Dashboard · Appointments · Catalog · Profile |
| Lab | `Lab`, `Diagnostic Center` | Dashboard · Bookings · Earnings · Profile |
| Pharmacy | `Chemist` | Dashboard · Orders · Earnings · Profile |

## Shared page furniture

- **Blue header** (dashboard tabs only): `#204BB6`, rounded bottom 20 px,
  `Hey! {name} 👋` on the first line, `📍 {location}, {city}` truncated on the
  second, bell with unread dot and avatar on the right.
- **Plain header** (every pushed screen): back chevron + title, no blue band.
- **Search bar**: white, 1 px `#0000001A`, magnifier, placeholder
  "Search for appointments".
- **Overview card**: two columns split by a vertical hairline; big number over a
  label. The right-hand number is `#A5352F` when it counts upcoming work.
- **Sticky footer**: white, sits above the home indicator, one or two buttons.
  Two buttons split 50/50 with a 12 px gap.

## Screen notes

### Doctor
- Dashboard: Overview (Today's / Upcoming) → "Today's Appointments" card with a
  centred blue `View all Appointments` link as its last row → "Upcoming
  Appointments" card.
- All Appointments: Overview counts In-Clinic visits vs Online Consult., then one
  card per day group (`Today(3)`, `Tomorrow (2)`).
- Appointment row: mode icon in a pill, name • age • sex, mode label underneath,
  day + time right-aligned.
- Detail: patient card (name, `28 y • Female`, photo) → appointment date → mode
  chip with a live status to its right. Then Contact details, then Payment
  Summary (pending only) or Previous consultations (accepted).
- Footer by state: pending `Reject | Accept`; accepted-but-early a disabled
  outlined `Starts in 02:30hrs`; patient waiting `Join Consultation`.
- Pending also shows the amber banner `Consultation get auto accept in 02:30mins`.

### Lab
- Dashboard mirrors the doctor's with "Tests Overview" and `View all Tests`.
- All Tests: Overview counts Walk-ins vs Home pickup; rows show `🧪 24 tests` and
  the slot time; the leading pill icon is a house for home pickup, a flask for a
  walk-in.
- Detail: patient card → "Tests" card, one row per test with the test name and
  two chips (category filled, sample type outlined) → "Contact Patient".
- Footer by state: pending `Reject | Accept` under the banner
  `Order get auto accept in 02:30mins`; accepted `Upload Reports`.

### Pharmacy
- Dashboard is a segmented control — New / In Progress / Completed — with the
  count beside each label in green. Card content changes per bucket:
  - New: items, address, phone, then `Total bill`.
  - In Progress: dark `In Transit` chip, items, rider + ETA, `View Order` and a
    green `Mark Delivered`.
  - Completed: green `Delivered` chip, items, delivered-by + rider,
    `Paid • Prepaid` with the total, and `Download invoice`.
- Order detail: `Order details` card (new orders prefix each row with a blue
  checkbox), `Customer details` (avatar, name, placed-at, address with a
  navigate button, phone with a call button), then `Order status` — or `Rider
  details` while in transit.
- Footer by state: new `Reject | Accept`; in transit `Reject | Mark as
  delivered`; delivered `Raise a concern | Download invoice`.

### Notifications (all personas)

Reached from the bell in the blue header. Plain header, then a horizontally
scrolling filter strip — **All · Unread · In clinic Visits · Online Consults** —
as 34 px, 8 px-radius pills: filled `#204BB6` with white text for the one in
force, white with the card border for the rest. Below it, plain bold headings
`Today` / `Last week` / `Other`, each over one card of rows.

A row is an icon pill (video for an online consult, house for in-clinic, calendar
for a reminder), the text column, and the time top-right. The text column varies
by what the notification is:

| Notification | Row |
|---|---|
| New request | blue `New appointment` eyebrow, title, "for Today 12:00 PM", then `Reject` (outlined) and `Approve` (green) |
| Reminder | muted "Reminder: Starts in 30 minutes." **above** the bold title — the only row that leads with the body |
| Patient waiting | title, "Please join to start consultation", blue `Join consultation` with a camera |
| Completed | title, "Upload notes if required.", outlined `Add notes` |
| Rating | "You received a new rating", "from {patient}", five `#F3B13E` stars |

The filters are server-side (`?is_read=false`, `?mode=online|in_clinic`): a page
of twenty narrowed in the app shows whatever of the twenty matched and then
stops paginating, which reads as "that is all of them".

### Insights (all personas)

Plain header, a period picker and an `Export` button on one row, the heading
`Earnings History`, then one card per metric: title, the figure in the metric's
own colour, and a seven-point line — solid for this window, dotted for the one
before it, with a fade under the solid line and the weekday initials below.

Which metrics is the persona's business and the server's answer:

| Persona | Cards |
|---|---|
| Doctor | Net Earnings (blue) · Total Consultations (green) |
| Lab | Net Earnings · Tests Booked · Avg, Order Value (orange) |
| Pharmacy | Net Sales · Orders Delivered · Avg, Order Value |

The average card is the period's average, not the sum of the daily averages.

### Catalog (lab and pharmacy)

One screen, two nouns — `Tests Catalog` and `Medicines Catalog` — under a
search field and a category filter strip. Each card: icon and name, a green
`Available` chip, the category and a second outlined chip (sample type, or pack
unit), `Code LAB-CT · TAT 24 hours`, `MRP ₹800 • Partner Price ₹600`, and the
availability switch. Sticky `Save changes` footer — the switches are batched,
because a partner going down the list is making one decision about a morning.

A shared-catalogue test (`provider` null) is listed but cannot be switched off:
that would take it off every other centre.

### My Earnings

Three shapes, three answers to "where is my money":

- **Nothing earned** — a centred card: icon, `No earnings yet`, `Start
  consulting to see your earnings here`, outlined `Go to dashboard`.
- **Earned, no account** — the week's total in a card, then `Next Payout` over a
  card reading `₹12,300.00 will be credited on Aug 30, 2025` / `No Bank details
  found` and a cream notice with `+ Add bank now`. Heading below is `Earnings
  breakdown`.
- **Payout scheduled** — `Next Payout` over amount + green `Scheduled` chip,
  `Will be credited on **Aug 30, 2025**`, `HDFC • • • • 1234`, and the pair
  `Update Bank Details` (blue outline) / `Download Statement` (grey outline).
  Heading below is `Earnings History`.

A line is `Consultation • Aarav` bold, then `₹500 • 🏠 In-clinic consultation`
with the mode in primary, then a muted `Today 12:00 PM`; right-aligned, a red
`-₹100 Platform fee` over a bold `₹400 Net pay`.

Money has three forms in this design and `getFormattedPrice` takes both
options: `₹2,313` in list rows, `₹12,300.00` for a headline, and `41,345.00`
with no symbol on an Insights card whose title already says what it is.

## Backend fields added for these screens

`User.gender`, `User.profile_picture`, `User.age` (derived),
`Appointment.platform_fee`, `DiagnosticTest.sample_type`,
`DiagnosticBooking.reports`, `Order.rider_name`, `Order.rider_code`, plus the
provider-facing diagnostic-booking endpoints under
`/api/healthcare/provider/diagnostic-bookings/`.

For the notifications screen and the pharmacy tabs: `Medicine.pack_unit` (so a
line reads "30 Caps", not "30 Nos"), `?bucket=` and a `counts` block on
`/api/providers/chemist-order-list/`, `?mode=` on `/api/notifications/`, the
`appointment_reminder` / `appointment_waiting` / `appointment_rated`
notification types, `consultation_mode` + `patient_name` + `scheduled_at` in an
appointment notification's `data`, and the `send_appointment_reminders`
management command.

For Insights, Catalog and My Earnings: `/api/providers/insights/` and
`/api/providers/catalog/`; `week_total`, `next_payout` and `lines` added to
`/api/providers/earnings/`; `Medicine.code`, the `ProviderMedicine` join
(a pharmacy's price and availability for a shared catalogue medicine), and
`DiagnosticTest.code` / `turnaround` / `partner_price`.

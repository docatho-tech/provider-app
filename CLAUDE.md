# provider-app (`decatho_provider_app`) — Provider ("partner") mobile app

React Native + Expo + NativeWind (Tailwind classes) + TypeScript. Source in `src/`.
The doctor / lab / pharmacy counterpart to `customer-app`.

## The design this app is built to

**`design-refs/` is the contract, not Figma.** The 26 PNGs there are the client's
provider-app screens; `design-refs/SPEC.md` writes down the palette, the card
geometry, the per-persona tab bars and the per-screen notes. Read it before
changing any screen. `design-refs/pixel.py probe <png> --row N` prints a scanline
as colour runs, which is how the palette was measured.

The "Provider app" page of the Figma file (`rHKJH65oGtamnJM748MbJo`) is *not*
indexed and the account cannot read it over the MCP anyway — see the
`docatho-pixel-match-workflow` note. Do not spend calls trying.

### Palette

Declared twice and deliberately: `src/constants/Colors.ts` for anything passed
as a prop, and `tailwind.config.js` for anything addressed as a class. NativeWind
reads the config at build time and cannot import the TypeScript, so **a colour
added to one must be added to the other** or the class silently resolves to
nothing.

Primary is `#204BB6`. Page background `#F3F3F3`, card header strip `#F7F7F7`,
icon pill `#E7EDF7`. Full table in `design-refs/SPEC.md`.

## Personas

`Provider.provider_type` selects one of three personas, via `useProviderType`:

| Persona | `provider_type` | Tabs | Dashboard component |
|---|---|---|---|
| Doctor | `Doctor` | Dashboard · Appointments · Catalog · Profile | `DoctorHomePage` |
| Lab | `Lab`, `Diagnostic Center` | Dashboard · Bookings · Earnings · Profile | `LabHomePage` |
| Pharmacy | `Chemist` (and anything unrecognised) | Dashboard · Orders · Earnings · Profile | `ChemistHomePage` |

`Lab` and `Diagnostic Center` are two backend values for one persona — they take
the same bookings, work the same queue and upload the same reports. The tab bar
is one router tree with `href: null` on the routes that do not belong to the
signed-in partner, so notification deep links still resolve.

## Building a screen

Compose from `src/components/ui/` rather than restyling a `View`:

- `Card` / `CardSection` / `CardRow` — the white box with a tinted titled strip
  and hairline-separated rows that every screen is made of. `CardRow` draws its
  own separator unless you pass `first`.
- `OverviewCard`, `PersonRow`, `CardLinkRow`, `EmptyRow` — the list furniture.
- `ActionButton`, `StickyFooter`, `Chip`, `IconPill`, `CircleIcon`, `Avatar`,
  `CountdownBanner`, `SearchField`, `SegmentedTabs`.
- `ScreenHeader` for pushed screens; `HomeHeader` is the blue band, dashboards only.
- `FilterChip` and `Stars` are the notifications screen's; `ActionButton size='sm'`
  is the in-row button those rows use, against the footer's `lg`.
- `Sparkline` is the Insights line chart — hand-rolled on `react-native-svg`
  (Catmull-Rom through the points, dotted comparison, gradient fill) rather than
  a chart dependency, because it is one series and no axes.

`CardRow`'s separator is inset by the row's own 16 px padding, because that is
what the design draws — see the measurement in `design-refs/SPEC.md`.

Detail screens (`orders/[orderId]`, `appointments/[appointmentId]`,
`bookings/[bookingId]`) draw their own `ScreenHeader` and set
`headerShown: false` in `(withheader)/_layout.tsx`, because their titles — a
patient's name, an order number and its status chip — are things they have to
fetch first.

Dates go through `src/utils/schedule.ts` (`dayLabel`, `timeLabel`, `slotLabel`,
`countdownLabel`, `groupByDay`). Every list in the design puts a day word over a
clock time; that is one rule, so it lives in one place.

## Auto-accept

Both the appointment and the booking screens show "…get auto accept in 02:30mins"
above an unanswered request. That is a promise to the patient, and the backend
keeps it: `healthcare/auto_accept.py` sweeps overdue requests whenever a partner's
queue is read, `AUTO_ACCEPT_MINUTES` sets the window, and the serializers expose
`auto_accept_at` (null once answered) for the countdown. There is also a
`auto_accept_requests` management command if ops wants it on a schedule.

## Earnings, Insights and the Catalog

`MyEarnings` lives in `src/components/earnings/` and is mounted twice: as the
Earnings **tab** a lab or pharmacy signs in to, and as a screen pushed from
Profile, which is how a doctor reaches it — their tab bar spends that slot on
the Catalog. The only difference is where Back goes, so it is one component with
a `backRoute`, not two screens.

The Catalog screen is likewise one screen over two nouns: the server answers
`kind: "tests" | "medicines"` and the screen titles itself from that. Its
switches are batched behind "Save changes" — a partner marking what they are out
of is making one decision, and a request per flick half-applies it on a bad
connection. A shared-catalogue test (`DiagnosticTest.provider` null) is listed
but cannot be switched off; it belongs to every centre.

Insights asks the server which metrics it has — a doctor counts consultations,
a centre counts tests, a pharmacy counts orders — and each metric carries its
own comparison series, because every card draws the dotted line behind the solid
one and fetching them apart would ask twice for one picture.

## Notifications

The list is the shortest route to the action a notification is about, so a
request is answered from it and a waiting patient is joined from it.
`src/utils/notificationUi.ts` maps `notification_type` + `data` to the row shape;
nothing about the row is carried on the record itself.

The filter strip is server-side (`?is_read=false`, `?mode=online|in_clinic`).
Filtering a loaded page instead would show whatever of those twenty rows matched
and then stop paginating. The same reasoning fixed the pharmacy dashboard's
"In Progress" tab, which is now `?bucket=in_progress` with a `counts` block for
all three tabs rather than a client-side filter over page one.

`appointment_reminder` is sent by `send_appointment_reminders` (30 minutes out,
deduped by asking whether a reminder for that `data.appointment_id` already
exists — no `reminder_sent_at` column). `appointment_waiting` fires on the
patient's *first* video-token mint; the check has to read `video_started_at`
before `mint_video_token` stamps it.

## Gotchas

- Install native deps with `npx expo install <pkg> -- --legacy-peer-deps`. Plain
  `npm install` fails on the 100ms room-kit peer set, and a caret range will float
  an Expo package to SDK 54 and break the Android build.
- `expo-document-picker` (report uploads) is a native module — the dev client
  needs a rebuild, `npx expo start` alone will not pick it up.
- Auth header is `Token <access>`, not `Bearer` — see `useAxios`. `useFileUpload`
  posts multipart by hand and has to send the same scheme.
- expo-router's typed route union is regenerated by the dev server. A route added
  without starting Metro needs `as RelativePathString` until it is.

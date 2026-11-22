/**
 * The partner app's palette, measured out of the design exports in
 * `design-refs/` rather than eyeballed — `design-refs/pixel.py probe` prints a
 * scanline as colour runs, and these are the runs it found.
 *
 * Anything added here must also be added to `tailwind.config.js`, because the
 * screens address colours as NativeWind classes (`bg-page`, `text-muted`) and
 * only the ones declared there resolve.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },

  /** Header band, primary buttons, links, active tab, most icons. */
  primary: '#204BB6',

  primaryTextColor: '#313131',
  secondaryTextColor: '#444444',
  /** Timestamps and the "23 y • M" metadata — a step lighter than secondary. */
  mutedTextColor: '#989898',

  /** The screen background the cards sit on. */
  page: '#F3F3F3',
  /** The titled strip at the top of a card. */
  cardHeader: '#F7F7F7',
  /** The rounded square behind a list-row icon. */
  iconPill: '#E7EDF7',
  /** Tinted inner panel on the lab detail cards. */
  surfaceAlt: '#F3F5F9',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  separator: 'rgba(49, 49, 49, 0.10)',

  successBg: '#D5EAD8',
  successText: '#3A633B',
  /** "Mark Delivered" — a brighter green than the chip it sits beside. */
  successAction: '#52A831',

  /** The auto-accept countdown banner. */
  warnBg: '#EDE8DC',
  warnBorder: '#D4B879',
  warnText: '#BB892E',

  danger: '#EA3323',
  /** The "Upcoming" figure on the overview cards. */
  alert: '#A5352F',

  /** The filled star on a rating notification. */
  star: '#F3B13E',

  /**
   * The cream "add a bank account" notice on the earnings screen. Paler than
   * `warnBg` on purpose — that one is a countdown to an automatic decision,
   * this one is a task waiting to be done.
   */
  noticeBg: '#FEFCEC',
  noticeBorder: '#DCD1B7',
  noticeText: '#7A4F21',

  /** Insights chart lines, in the order the cards appear. */
  chartBlue: '#204BB6',
  chartGreen: '#509E2D',
  chartOrange: '#E36940',

  /** Segmented-control track. */
  tabTrack: '#E9E9E9',
  tabTrackBorder: '#DADADA',

  lightTextColor: '#999999',
};

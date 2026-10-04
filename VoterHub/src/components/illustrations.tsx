import type { CSSProperties } from "react";

/*
 * VoteHub brand illustrations — flat geometric SVGs drawn from the
 * design-system palette (ink #101828, accent #2f6feb, softs + grays).
 * Decorative only; hidden from assistive tech by default.
 */

type SvgProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  title?: string;
};

function base(props: SvgProps, viewBox: string) {
  return {
    className: props.className,
    width: props.width ?? 120,
    height: props.height ?? 120,
    style: props.style,
    viewBox,
    role: "img" as const,
    "aria-hidden": props.title ? undefined : true,
  };
}

/** Ballot slipping into a ballot box — landing hero, create-poll, empty states. */
export function BallotBoxSvg(props: SvgProps) {
  return (
    <svg {...base(props, "0 0 120 120")}>
      {props.title ? <title>{props.title}</title> : null}
      {/* ballot paper */}
      <g className="ill-ballot">
        <rect x="52" y="14" width="30" height="38" rx="4" fill="#ffffff" stroke="#2f6feb" strokeWidth="4" transform="rotate(8 67 33)" />
        <path d="M60 34 l5 5 l9 -11" fill="none" stroke="#2f6feb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" transform="rotate(8 67 33)" />
      </g>
      {/* lid + slot */}
      <rect x="24" y="52" width="72" height="10" rx="5" fill="#1c2c4f" />
      {/* box */}
      <rect x="28" y="62" width="64" height="42" rx="8" fill="#101828" />
      <rect x="28" y="82" width="64" height="10" fill="#2f6feb" opacity="0.9" />
      <circle cx="60" cy="95" r="4" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

/** Shield with a check — security, join-poll, login prompts. */
export function ShieldCheckSvg(props: SvgProps) {
  return (
    <svg {...base(props, "0 0 120 120")}>
      {props.title ? <title>{props.title}</title> : null}
      <path
        d="M60 10 L96 24 V56 C96 84 80 100 60 110 C40 100 24 84 24 56 V24 Z"
        fill="#eaf1ff"
        stroke="#2f6feb"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M43 60 L56 73 L79 46"
        fill="none"
        stroke="#2f6feb"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Rising bar chart — results, stats, dashboard. */
export function ChartBarsSvg(props: SvgProps) {
  return (
    <svg {...base(props, "0 0 120 120")}>
      {props.title ? <title>{props.title}</title> : null}
      <line x1="16" y1="102" x2="106" y2="102" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
      <rect x="24" y="70" width="16" height="32" rx="5" fill="#c9d7f5" />
      <rect x="48" y="54" width="16" height="48" rx="5" fill="#9db9ee" />
      <rect x="72" y="36" width="16" height="66" rx="5" fill="#2f6feb" />
      <path d="M24 62 L52 46 L76 30" fill="none" stroke="#101828" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 8" />
      <circle cx="78" cy="28" r="6" fill="#101828" />
      <path d="M75 28 l2.5 2.5 l4.5 -5.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Checkmark bursting with radiating ticks — vote confirmation, success states. */
export function VoteBurstSvg(props: SvgProps) {
  const ticks = [
    "M60 6 v12", "M60 102 v12", "M6 60 h12", "M102 60 h12",
    "M22 22 l8 8", "M90 90 l8 8", "M98 22 l-8 8", "M30 90 l-8 8",
  ];
  return (
    <svg {...base(props, "0 0 120 120")}>
      {props.title ? <title>{props.title}</title> : null}
      {ticks.map((d, i) => (
        <path key={i} d={d} stroke="#2f6feb" strokeWidth="5" strokeLinecap="round" opacity={i % 2 ? 0.45 : 0.9} />
      ))}
      <circle cx="60" cy="60" r="30" fill="#101828" />
      <path d="M47 61 l9 9 l18 -20" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Community of voters — landing "voice" section, get-started. */
export function UsersSvg(props: SvgProps) {
  return (
    <svg {...base(props, "0 0 120 120")}>
      {props.title ? <title>{props.title}</title> : null}
      {/* back-left person */}
      <circle cx="34" cy="44" r="13" fill="#c9d7f5" />
      <path d="M14 92 c0-14 9-22 20-22 s20 8 20 22" fill="#c9d7f5" />
      {/* back-right person */}
      <circle cx="86" cy="44" r="13" fill="#9db9ee" />
      <path d="M66 92 c0-14 9-22 20-22 s20 8 20 22" fill="#9db9ee" />
      {/* front person */}
      <circle cx="60" cy="50" r="16" fill="#101828" />
      <path d="M36 98 c0-16 11-25 24-25 s24 9 24 25" fill="#101828" />
      <circle cx="60" cy="50" r="16" fill="none" stroke="#2f6feb" strokeWidth="4" />
      <path d="M53 50 l5 5 l9 -10" fill="none" stroke="#2f6feb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Connected share nodes — poll-created share step. */
export function ShareLinkSvg(props: SvgProps) {
  return (
    <svg {...base(props, "0 0 120 120")}>
      {props.title ? <title>{props.title}</title> : null}
      <line x1="38" y1="60" x2="82" y2="60" stroke="#2f6feb" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 10" />
      <circle cx="30" cy="60" r="18" fill="#101828" />
      <circle cx="90" cy="60" r="18" fill="#eaf1ff" stroke="#2f6feb" strokeWidth="5" />
      <path d="M22 60 l6 6 l12 -13" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M84 60 h12 M96 54 l6 6 l-6 6" fill="none" stroke="#2f6feb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Empty ballot box — empty states, join-poll. */
export function EmptyBallotSvg(props: SvgProps) {
  return (
    <svg {...base(props, "0 0 120 120")}>
      {props.title ? <title>{props.title}</title> : null}
      <rect x="52" y="12" width="26" height="34" rx="4" fill="none" stroke="#c3cad4" strokeWidth="4" strokeDasharray="6 6" transform="rotate(-8 65 29)" />
      <rect x="24" y="52" width="72" height="10" rx="5" fill="#e5e7eb" />
      <rect x="28" y="62" width="64" height="42" rx="8" fill="#f1f2f4" stroke="#e5e7eb" strokeWidth="3" />
      <circle cx="60" cy="83" r="10" fill="#e5e7eb" />
      <path d="M55 83 l4 4 l7 -8" fill="none" stroke="#9aa1ad" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Concentric dashed rings — decorative backdrop for hero sections. */
export function DecoRingsSvg(props: SvgProps) {
  return (
    <svg {...base(props, "0 0 200 200")}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="100" cy="100" r="88" fill="none" stroke="#2f6feb" strokeWidth="2" strokeDasharray="4 10" opacity="0.5" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#2f6feb" strokeWidth="2" strokeDasharray="4 10" opacity="0.35" />
      <circle cx="100" cy="100" r="36" fill="none" stroke="#2f6feb" strokeWidth="2" strokeDasharray="4 10" opacity="0.22" />
      <circle cx="100" cy="100" r="10" fill="#2f6feb" opacity="0.5" />
    </svg>
  );
}

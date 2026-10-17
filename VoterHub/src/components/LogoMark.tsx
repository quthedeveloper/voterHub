import "./LogoMark.css";

/** VoteHub logo badge — the ballot-box mark on a white rounded square. */
export default function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <span
      className="logo-mark logo-mark-img"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src="/logo.png" alt="" />
    </span>
  );
}

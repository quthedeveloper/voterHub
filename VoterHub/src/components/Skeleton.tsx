import type { CSSProperties } from "react";
import "./Skeleton.css";

/** Shimmer placeholder block. Size it with style (height/width/borderRadius). */
export default function Skeleton({ style, className = "" }: { style?: CSSProperties; className?: string }) {
  return <span className={`sk ${className}`} style={style} aria-hidden="true" />;
}

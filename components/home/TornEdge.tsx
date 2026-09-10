interface TornEdgeProps {
  fill: string;
  className?: string;
}

// Fixed irregular zigzag so the "torn paper" silhouette looks hand-torn, not mechanical.
const JAG_POINTS =
  "0% 35%,3% 60%,7% 15%,11% 55%,15% 25%,19% 65%,23% 10%,27% 45%,31% 70%,35% 20%,39% 50%,43% 5%,47% 40%,51% 65%,55% 15%,59% 55%,63% 25%,67% 60%,71% 10%,75% 45%,79% 70%,83% 20%,87% 50%,91% 5%,95% 40%,100% 30%";

export default function TornEdge({ fill, className = "" }: TornEdgeProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-6 translate-y-1/2 sm:h-9 ${className}`}
      style={{
        backgroundColor: fill,
        clipPath: `polygon(${JAG_POINTS}, 100% 100%, 0% 100%)`,
      }}
    />
  );
}

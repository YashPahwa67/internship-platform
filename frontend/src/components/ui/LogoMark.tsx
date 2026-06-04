/** SVG logo mark — always white, designed for use inside the gradient badge box */
export default function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Rising path connecting the three nodes */}
      <path
        d="M4 20 Q8 14 12 12 Q16 10 20 4"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      {/* Start node — student / origin */}
      <circle cx="4" cy="20" r="3" fill="white" fillOpacity="0.72" />
      {/* Mid node — internship / platform (focal point, largest) */}
      <circle cx="12" cy="12" r="4" fill="white" />
      {/* End node — career goal */}
      <circle cx="20" cy="4" r="3" fill="white" fillOpacity="0.72" />
    </svg>
  );
}

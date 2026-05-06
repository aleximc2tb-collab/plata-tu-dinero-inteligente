import logo from "@/assets/mangox-logo.png";

interface Props {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

export function Logo({ size = 40, className = "", withWordmark = false }: Props) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logo}
        alt="MangoX"
        width={size}
        height={size}
        loading="lazy"
        style={{ width: size, height: size }}
        className="object-contain"
      />
      {withWordmark && (
        <span className="text-xl font-bold tracking-tight">
          Mango<span className="text-primary">X</span>
        </span>
      )}
    </div>
  );
}

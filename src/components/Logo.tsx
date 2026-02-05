import logoImage from "@/assets/fun-ecosystem-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-10",
  md: "h-14",
  lg: "h-24",
};

export function Logo({ size = "md" }: LogoProps) {
  return (
    <img 
      src={logoImage} 
      alt="FUN Ecosystem" 
      className={`${sizeClasses[size]} w-auto object-contain`}
    />
  );
}

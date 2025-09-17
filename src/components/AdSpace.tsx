interface AdSpaceProps {
  position: "top" | "between" | "bottom";
}

export const AdSpace = ({ position }: AdSpaceProps) => {
  const getAdConfig = () => {
    switch (position) {
      case "top":
        return {
          height: "h-24",
          text: "Publicidade - Banner Superior"
        };
      case "between":
        return {
          height: "h-32",
          text: "Publicidade - Banner Interstitial"
        };
      case "bottom":
        return {
          height: "h-28",
          text: "Publicidade - Banner Inferior"
        };
      default:
        return {
          height: "h-24",
          text: "Publicidade"
        };
    }
  };

  const config = getAdConfig();

  return (
    <div className={`${config.height} bg-gradient-secondary border border-border rounded-lg flex items-center justify-center my-6`}>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">PUBLICIDADE</div>
        <div className="text-sm font-medium text-muted-foreground">
          Google AdSense
        </div>
        <div className="text-xs text-muted-foreground opacity-50">
          {config.text}
        </div>
      </div>
    </div>
  );
};
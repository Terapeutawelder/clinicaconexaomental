const mediaLogos = [
  { name: "O Globo", initial: "G" },
  { name: "Terra", initial: "T" },
  { name: "IG", initial: "IG" },
  { name: "Estadão", initial: "E" },
];

const MediaSection = () => {
  return (
    <section className="py-6 sm:py-8 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          Já fomos destaque em
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-16 flex-wrap">
          {mediaLogos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted-foreground/20 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-muted-foreground">{logo.initial}</span>
              </div>
              <span className="text-muted-foreground font-medium hidden sm:block text-sm">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaSection;

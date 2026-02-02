const marqueeItems = [
  "Grupo Exclusivo",
  "Acesso Prioritário",
  "Benefícios Especiais",
  "Vagas Limitadas",
];

const Marquee = () => {
  const items = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {items.map((item, index) => (
          <span
            key={index}
            className="text-foreground font-semibold text-sm md:text-base uppercase tracking-wide flex items-center gap-2"
          >
            {item}
            <span className="text-foreground/60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;

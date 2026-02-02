const allowedLayoutStyles = [
  "classic",
  "centered",
  "split",
  "landing",
  "bold",
  "cards",
  "form",
] as const;

export type AllowedLayoutStyle = (typeof allowedLayoutStyles)[number];

export const normalizeLayoutStyle = (style: unknown): AllowedLayoutStyle => {
  // Backwards compatibility: old removed layout
  if (style === "minimal") return "landing";
  if (allowedLayoutStyles.includes(style as AllowedLayoutStyle)) {
    return style as AllowedLayoutStyle;
  }
  return "classic";
};

export const normalizeSalesPageConfig = <T extends { layout?: any; template?: any }>(
  config: T
): T => {
  const normalizedStyle = normalizeLayoutStyle(config?.layout?.style);

  const normalized: any = {
    ...config,
    layout: {
      ...(config as any).layout,
      style: normalizedStyle,
    },
  };

  // Keep template in sync for UI selection; migrate old 'minimal' template
  if (normalized.template === "minimal") {
    normalized.template = "landing";
  }

  // If template is empty/unknown, align it with the layout style
  if (!normalized.template || typeof normalized.template !== "string") {
    normalized.template = normalizedStyle;
  }

  return normalized as T;
};

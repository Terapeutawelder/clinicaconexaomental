import { 
  ClassicLayout,
  CenteredLayout,
  LandingLayout,
  BoldLayout,
  CardsLayout,
  SplitLayout,
  FormLayout,
} from "./layouts";

import { normalizeLayoutStyle } from "./configNormalization";

export type LayoutStyle = 'classic' | 'centered' | 'split' | 'landing' | 'bold' | 'cards' | 'form';

export interface SalesPageConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  layout?: {
    style: LayoutStyle;
    heroFullWidth?: boolean;
    showStats?: boolean;
    benefitsStyle?: 'grid' | 'list' | 'icons' | 'cards';
    modulesStyle?: 'accordion' | 'cards' | 'timeline';
    ctaStyle?: 'floating' | 'inline' | 'sticky';
    showFloatingBadge?: boolean;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
    showVideo: boolean;
  };
  content: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  cta: {
    mainText: string;
    subText: string;
    buttonText: string;
    urgencyText: string;
    redirectType?: 'checkout' | 'whatsapp' | 'url';
    redirectUrl?: string;
  };
  benefits: {
    enabled: boolean;
    title: string;
    items: string[];
  };
  guarantee: {
    enabled: boolean;
    title: string;
    description: string;
    days: number;
  };
  instructor: {
    showSection: boolean;
    title: string;
  };
  images?: {
    heroImage: string;
    videoThumbnail: string;
  };
  template?: string;
}

export const defaultSalesPageConfig: SalesPageConfig = {
  colors: {
    primary: "262 83% 58%",
    secondary: "262 50% 95%",
    accent: "42 87% 55%",
    background: "220 20% 4%",
  },
  layout: {
    style: 'classic',
    heroFullWidth: false,
    showStats: true,
    benefitsStyle: 'grid',
    modulesStyle: 'accordion',
    ctaStyle: 'floating',
    showFloatingBadge: true,
  },
  hero: {
    badge: "Área de Membros Exclusiva",
    title: "",
    subtitle: "",
    ctaText: "Comprar Agora",
    showVideo: true,
  },
  content: {
    sectionTitle: "Conteúdo do Curso",
    sectionSubtitle: "Veja tudo que você vai aprender",
  },
  cta: {
    mainText: "Garanta seu acesso agora",
    subText: "Acesso imediato após a confirmação do pagamento",
    buttonText: "Quero me Inscrever",
    urgencyText: "Vagas limitadas",
    redirectType: 'checkout',
    redirectUrl: "",
  },
  benefits: {
    enabled: true,
    title: "O que você vai receber",
    items: [
      "Acesso vitalício ao conteúdo",
      "Certificado de conclusão",
      "Suporte exclusivo",
      "Atualizações gratuitas",
    ],
  },
  guarantee: {
    enabled: true,
    title: "Garantia de 7 dias",
    description: "Se você não ficar satisfeito, devolvemos 100% do seu dinheiro.",
    days: 7,
  },
  instructor: {
    showSection: true,
    title: "Conheça seu instrutor",
  },
  images: {
    heroImage: "",
    videoThumbnail: "",
  },
  template: "classic",
};

interface SalesPagePreviewProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    product_config?: Record<string, unknown>;
  };
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    specialty: string | null;
    crp: string | null;
  } | null;
  modules: {
    id: string;
    title: string;
    description: string | null;
    lessons_count: number;
  }[];
  config: SalesPageConfig;
}

const SalesPagePreview = ({ service, profile, modules, config }: SalesPagePreviewProps) => {
  // Apply dynamic colors
  const primaryColor = `hsl(${config.colors.primary})`;
  const secondaryColor = `hsl(${config.colors.secondary})`;
  const accentColor = `hsl(${config.colors.accent})`;

  // Determine if it's a light or dark theme based on background lightness
  const bgParts = config.colors.background.split(' ');
  const bgLightness = parseFloat(bgParts[2] || '5%');
  const isLightTheme = bgLightness > 50;

  // Dynamic text colors based on theme
  const textPrimary = isLightTheme ? 'text-gray-900' : 'text-white';
  const textSecondary = isLightTheme ? 'text-gray-600' : 'text-gray-300';
  const textMuted = isLightTheme ? 'text-gray-500' : 'text-gray-400';
  const borderColor = isLightTheme ? 'border-gray-200' : 'border-white/10';
  const bgOverlay = isLightTheme ? 'bg-white/80' : 'bg-black/30';

  const themeColors = {
    primaryColor,
    secondaryColor,
    accentColor,
    textPrimary,
    textSecondary,
    textMuted,
    borderColor,
    bgOverlay,
    isLightTheme,
  };

  const layoutStyle = normalizeLayoutStyle((config as any)?.layout?.style) as LayoutStyle;

  // Render layout based on style
  const renderLayout = () => {
    const layoutProps = { service, profile, modules, config, themeColors };

    switch (layoutStyle) {
      case 'centered':
        return <CenteredLayout {...layoutProps} />;
      case 'landing':
        return <LandingLayout {...layoutProps} />;
      case 'bold':
        return <BoldLayout {...layoutProps} />;
      case 'cards':
        return <CardsLayout {...layoutProps} />;
      case 'split':
        return <SplitLayout {...layoutProps} />;
      case 'form':
        return <FormLayout {...layoutProps} />;
      case 'classic':
      default:
        return <ClassicLayout {...layoutProps} />;
    }
  };

  // Split layout has its own container structure
  if (layoutStyle === 'split') {
    return (
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: `hsl(${config.colors.background})`,
          '--sp-primary': config.colors.primary,
          '--sp-secondary': config.colors.secondary,
          '--sp-accent': config.colors.accent,
        } as React.CSSProperties}
      >
        {renderLayout()}
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: `hsl(${config.colors.background})`,
        '--sp-primary': config.colors.primary,
        '--sp-secondary': config.colors.secondary,
        '--sp-accent': config.colors.accent,
      } as React.CSSProperties}
    >
      {renderLayout()}
    </div>
  );
};

export default SalesPagePreview;

// Plan types and interfaces
export type PlanType = 'free' | 'pro' | 'plus' | 'premium';

export interface Plan {
    id: PlanType;
    name: string;
    messagesPerMonth: number;
    repositories: number | 'unlimited';
    price: number;
    features: string[];
    color: string;
}

export const PLANS: Record<PlanType, Plan> = {
    free: {
        id: 'free',
        name: 'Free',
        messagesPerMonth: 5,
        repositories: 1,
        price: 0,
        features: [
            '5 mensagens por mês',
            '1 repositório',
            'Suporte da comunidade',
            'Acesso básico ao chat IA'
        ],
        color: '#6B7280'
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        messagesPerMonth: 250,
        repositories: 'unlimited',
        price: 27.90,
        features: [
            '250 mensagens por mês',
            'Repositórios ilimitados',
            'Suporte por email',
            'Análise avançada de código',
            'Histórico completo'
        ],
        color: '#3B82F6'
    },
    plus: {
        id: 'plus',
        name: 'Plus',
        messagesPerMonth: 500,
        repositories: 'unlimited',
        price: 47.90,
        features: [
            '500 mensagens por mês',
            'Repositórios ilimitados',
            'Suporte prioritário',
            'Análise em tempo real',
            'Webhooks customizados',
            'Integrações avançadas'
        ],
        color: '#8B5CF6'
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        messagesPerMonth: 1000,
        repositories: 'unlimited',
        price: 77.90,
        features: [
            '1.000 mensagens por mês',
            'Repositórios ilimitados',
            'Suporte dedicado 24/7',
            'API dedicada',
            'White-label',
            'SLA garantido'
        ],
        color: '#F59E0B'
    }
};

export interface UserUsage {
    date: string; // YYYY-MM
    messagesUsed: number;
    lastReset: string; // ISO date
}

export interface UserData {
    plan: PlanType;
    repository: string;
    githubToken: string;
    githubUser: {
        login: string;
        avatar_url: string;
        name: string;
    } | null;
    usage: UserUsage;
}

export const DEFAULT_USER_DATA: UserData = {
    plan: 'free',
    repository: '',
    githubToken: '',
    githubUser: null,
    usage: {
        date: new Date().toISOString().slice(0, 7), // YYYY-MM
        messagesUsed: 0,
        lastReset: new Date().toISOString()
    }
};

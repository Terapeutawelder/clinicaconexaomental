import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// Configuração do cliente Mercado Pago com a chave de acesso fornecida
const ACCESS_TOKEN = "TEST-8396088315798725-071921-b8d4f48f8a3f4b0caa208fa1b4b5d5f9-1080796287";

export const client = new MercadoPagoConfig({ 
  accessToken: ACCESS_TOKEN,
  options: {
    timeout: 5000,
  }
});

export const payment = new Payment(client);
export const preference = new Preference(client);

// Tipos para pagamentos
export interface PaymentData {
  token: string;
  transaction_amount: number;
  description: string;
  installments: number;
  payment_method_id: string;
  issuer_id?: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
    first_name?: string;
    last_name?: string;
  };
  additional_info?: {
    items: Array<{
      id: string;
      title: string;
      description?: string;
      picture_url?: string;
      category_id?: string;
      quantity: number;
      unit_price: number;
    }>;
    payer?: {
      first_name?: string;
      last_name?: string;
      phone?: {
        area_code?: string;
        number?: string;
      };
      address?: {
        street_name?: string;
        street_number?: number;
        zip_code?: string;
      };
    };
  };
}

export interface PreferenceData {
  items: Array<{
    id?: string;
    title: string;
    description?: string;
    picture_url?: string;
    category_id?: string;
    quantity: number;
    currency_id?: string;
    unit_price: number;
  }>;
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: number;
      zip_code?: string;
      city?: string;
      state?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  notification_url?: string;
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  external_reference?: string;
  statement_descriptor?: string;
}

// Função para processar pagamento com cartão
export const processCardPayment = async (paymentData: PaymentData) => {
  try {
    const result = await payment.create({ body: paymentData });
    return result;
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
};

// Função para criar preferência de pagamento (PIX, boleto, etc.)
export const createPaymentPreference = async (preferenceData: PreferenceData) => {
  try {
    const result = await preference.create({ body: preferenceData });
    return result;
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    throw error;
  }
};

// Função para obter detalhes de um pagamento
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const result = await payment.get({ id: paymentId });
    return result;
  } catch (error) {
    console.error('Erro ao obter detalhes do pagamento:', error);
    throw error;
  }
};
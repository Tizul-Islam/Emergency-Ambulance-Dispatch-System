import axios from 'axios';

const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
const BKASH_APP_KEY = process.env.BKASH_APP_KEY || '';
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET || '';
const BKASH_USERNAME = process.env.BKASH_USERNAME || '';
const BKASH_PASSWORD = process.env.BKASH_PASSWORD || '';

interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface BkashPaymentRequest {
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
}

interface BkashPaymentResponse {
  paymentID: string;
  createTime: string;
  transactionStatus: string;
  orgLogo: string;
  orgName: string;
  merchantInvoiceNumber: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

const getBkashToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const authString = Buffer.from(`${BKASH_USERNAME}:${BKASH_PASSWORD}`).toString('base64');

  const response = await axios.post<BkashTokenResponse>(
    `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    },
    {
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  const tokenData = response.data;
  cachedToken = {
    token: tokenData.id_token,
    expiresAt: Date.now() + (tokenData.expires_in - 60) * 1000, // 1 minute buffer
  };

  return cachedToken.token;
};

export const initiateBkashPayment = async (
  amount: number,
  merchantInvoiceNumber: string,
  callbackUrl: string
): Promise<{ paymentUrl: string; paymentId: string }> => {
  const token = await getBkashToken();

  const paymentRequest: BkashPaymentRequest = {
    amount: amount.toString(),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber,
  };

  const response = await axios.post<{ bkashURL: string; paymentID: string }>(
    `${BKASH_BASE_URL}/tokenized/checkout/create`,
    paymentRequest,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-APP-Key': BKASH_APP_KEY,
      },
      params: {
        callbackURL: callbackUrl,
      },
    }
  );

  return {
    paymentUrl: response.data.bkashURL,
    paymentId: response.data.paymentID,
  };
};

export const executeBkashPayment = async (paymentId: string): Promise<BkashPaymentResponse> => {
  const token = await getBkashToken();

  const response = await axios.post<BkashPaymentResponse>(
    `${BKASH_BASE_URL}/tokenized/checkout/execute`,
    { paymentID: paymentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-APP-Key': BKASH_APP_KEY,
      },
    }
  );

  return response.data;
};

export const queryBkashPayment = async (paymentId: string): Promise<BkashPaymentResponse> => {
  const token = await getBkashToken();

  const response = await axios.post<BkashPaymentResponse>(
    `${BKASH_BASE_URL}/tokenized/checkout/payment/query`,
    { paymentID: paymentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-APP-Key': BKASH_APP_KEY,
      },
    }
  );

  return response.data;
};

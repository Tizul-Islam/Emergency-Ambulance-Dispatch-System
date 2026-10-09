import SSLCommerzPayment from 'sslcommerz-lts';
import { config } from 'dotenv';
config();

const sslcz = new SSLCommerzPayment(
  process.env.SSLCOMMERZ_STORE_ID || '',
  process.env.SSLCOMMERZ_STORE_PASSWORD || '',
  process.env.SSLCOMMERZ_IS_LIVE === 'true'
);

const data = {
  total_amount: 500,
  currency: 'BDT',
  tran_id: `test-${Date.now()}`,
  success_url: `http://localhost:5000/success`,
  fail_url: `http://localhost:5000/fail`,
  cancel_url: `http://localhost:5000/cancel`,
  ipn_url: `http://localhost:5000/ipn`,
  shipping_method: 'No',
  product_name: `Test Product`,
  product_category: 'Test',
  product_profile: 'general',
  cus_name: 'Test Name',
  cus_email: 'test@example.com',
  cus_add1: 'Dhaka',
  cus_city: 'Dhaka',
  cus_postcode: '1000',
  cus_country: 'Bangladesh',
  cus_phone: '01700000000',
  ship_name: 'N/A',
  ship_add1: 'N/A',
  ship_city: 'N/A',
  ship_postcode: 1000,
  ship_country: 'Bangladesh'
};

sslcz.init(data).then((apiResponse: any) => {
  console.log('SUCCESS:', apiResponse);
}).catch((err: any) => {
  console.error('ERROR:', err);
});

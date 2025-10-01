/**
 * Basic Usage Example
 * Demonstrates simple payment creation and checking
 */

import { MultiChainGateway } from '../src/index.js';

async function basicExample() {
  console.log('=== Basic Usage Example ===\n');

  // Your merchant wallet address
  const merchantAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  // Initialize gateway
  const gateway = new MultiChainGateway(merchantAddress);

  // Create a payment request for $50 USDC on Base
  console.log('Creating payment request...');
  const payment = await gateway.createPayment('BASE', 'USDC', 50.00);

  console.log('\n📄 Payment Details:');
  console.log(`ID: ${payment.id}`);
  console.log(`Amount: ${payment.amount} ${payment.stablecoin}`);
  console.log(`Network: ${payment.network}`);
  console.log(`Status: ${payment.status}`);
  console.log(`Merchant: ${payment.merchantAddress}`);
  console.log(`Token: ${payment.tokenAddress}`);
  console.log(`Expires: ${new Date(payment.expiresAt).toLocaleString()}`);

  // Check payment status
  console.log('\n🔍 Checking payment status...');
  const status = await gateway.checkPayment(payment.id);
  console.log(`Current Status: ${status.status}`);

  // Get all active payments
  console.log('\n📊 Active Payments:');
  const activePayments = gateway.getAllActivePayments();
  console.log(`Total: ${activePayments.length}`);
}

basicExample().catch(console.error);

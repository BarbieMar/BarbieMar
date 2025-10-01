/**
 * Multi-Network Example
 * Demonstrates payment creation across different networks
 */

import { MultiChainGateway } from '../src/index.js';

async function multiNetworkExample() {
  console.log('=== Multi-Network Payment Example ===\n');

  const merchantAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const gateway = new MultiChainGateway(merchantAddress);

  // Get network recommendations for different amounts
  console.log('💡 Network Recommendations:');
  const amounts = [25, 100, 500, 2000];
  amounts.forEach(amount => {
    const recommended = gateway.recommendNetwork(amount);
    console.log(`  $${amount}: ${recommended}`);
  });

  console.log('\n📡 Creating Payments on Different Networks:\n');

  // Base - USDC
  console.log('1. Base Network (USDC)');
  const basePayment = await gateway.createPayment('BASE', 'USDC', 100);
  console.log(`   ID: ${basePayment.id}`);
  console.log(`   Chain: ${basePayment.chainId}`);
  console.log(`   Token: ${basePayment.tokenAddress}\n`);

  // Polygon - USDT
  console.log('2. Polygon Network (USDT)');
  const polyPayment = await gateway.createPayment('POLYGON', 'USDT', 250);
  console.log(`   ID: ${polyPayment.id}`);
  console.log(`   Chain: ${polyPayment.chainId}`);
  console.log(`   Token: ${polyPayment.tokenAddress}\n`);

  // Lightning Network
  console.log('3. Lightning Network');
  const lnPayment = await gateway.createPayment('BTC_LIGHTNING', 'USDC', 30);
  console.log(`   ID: ${lnPayment.id}`);
  console.log(`   Invoice: ${lnPayment.lightningInvoice}\n`);

  // Summary
  console.log('📊 Payment Summary:');
  const active = gateway.getAllActivePayments();
  console.log(`Total Active Payments: ${active.length}`);
  active.forEach(p => {
    console.log(`  - ${p.gatewayNetwork}: $${p.amount} (${p.status})`);
  });
}

multiNetworkExample().catch(console.error);

/**
 * WEB3 POS Gateway - Main Entry Point
 * Point of Sale integration for WEB3 payments
 * Supports: Base, Polygon, BTC Lightning Network
 * Stablecoins: USDC, USDT
 */

import { PaymentGateway } from './PaymentGateway.js';
import { MultiChainGateway } from './MultiChainGateway.js';
import { NETWORKS, STABLECOINS } from './config.js';

// Export main classes
export { PaymentGateway, MultiChainGateway, NETWORKS, STABLECOINS };

// Example usage demonstration
async function demonstrateUsage() {
  console.log('='.repeat(60));
  console.log('WEB3 POS Gateway - Demonstration');
  console.log('='.repeat(60));
  console.log('');

  // Example merchant address (in production, use your actual wallet)
  const merchantAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  console.log('📍 Merchant Address:', merchantAddress);
  console.log('');

  // Initialize multi-chain gateway
  console.log('🚀 Initializing Multi-Chain Gateway...');
  const gateway = new MultiChainGateway(merchantAddress);
  console.log('');

  // Display available networks
  console.log('📡 Available Networks:');
  const networks = gateway.getAvailableNetworks();
  networks.forEach(network => {
    console.log(`  - ${network.name}: ${network.info.config.name}`);
    console.log(`    Supported: ${network.info.supportedStablecoins.join(', ')}`);
  });
  console.log('');

  // Create payment requests on different networks
  console.log('💳 Creating Payment Requests...');
  console.log('');

  try {
    // Base payment with USDC
    console.log('1️⃣  Base Network - USDC Payment');
    const basePayment = await gateway.createPayment('BASE', 'USDC', 50.00);
    console.log(`   Payment ID: ${basePayment.id}`);
    console.log(`   Amount: ${basePayment.amount} ${basePayment.stablecoin}`);
    console.log(`   Token Address: ${basePayment.tokenAddress}`);
    console.log(`   Status: ${basePayment.status}`);
    console.log('');

    // Polygon payment with USDT
    console.log('2️⃣  Polygon Network - USDT Payment');
    const polygonPayment = await gateway.createPayment('POLYGON', 'USDT', 150.00);
    console.log(`   Payment ID: ${polygonPayment.id}`);
    console.log(`   Amount: ${polygonPayment.amount} ${polygonPayment.stablecoin}`);
    console.log(`   Token Address: ${polygonPayment.tokenAddress}`);
    console.log(`   Status: ${polygonPayment.status}`);
    console.log('');

    // Lightning Network payment
    console.log('3️⃣  Lightning Network Payment');
    const lightningPayment = await gateway.createPayment('BTC_LIGHTNING', 'USDC', 25.00);
    console.log(`   Payment ID: ${lightningPayment.id}`);
    console.log(`   Amount: ${lightningPayment.amount}`);
    console.log(`   Invoice: ${lightningPayment.lightningInvoice}`);
    console.log(`   Status: ${lightningPayment.status}`);
    console.log('');

    // Show all active payments
    console.log('📊 Active Payments Summary:');
    const activePayments = gateway.getAllActivePayments();
    console.log(`   Total Active: ${activePayments.length}`);
    activePayments.forEach(payment => {
      console.log(`   - ${payment.id} (${payment.gatewayNetwork}): ${payment.amount} ${payment.stablecoin || 'BTC'}`);
    });
    console.log('');

    // Network recommendations
    console.log('💡 Network Recommendations:');
    console.log(`   For $50 payment: ${gateway.recommendNetwork(50)}`);
    console.log(`   For $500 payment: ${gateway.recommendNetwork(500)}`);
    console.log(`   For $5000 payment: ${gateway.recommendNetwork(5000)}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('='.repeat(60));
  console.log('✅ Demonstration Complete');
  console.log('='.repeat(60));
}

// Run demonstration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateUsage().catch(console.error);
}

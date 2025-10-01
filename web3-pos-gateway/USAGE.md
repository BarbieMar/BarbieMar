# WEB3 POS Gateway - Complete Usage Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Basic Setup](#basic-setup)
3. [Creating Payments](#creating-payments)
4. [Monitoring Payments](#monitoring-payments)
5. [Network Selection](#network-selection)
6. [Integration Examples](#integration-examples)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Installation
```bash
cd web3-pos-gateway
npm install
```

### Run Demo
```bash
npm start
```

## Basic Setup

### Initialize Multi-Chain Gateway
```javascript
import { MultiChainGateway } from './src/index.js';

// Your merchant wallet address (where payments will be received)
const merchantAddress = '0xYourWalletAddressHere';
const gateway = new MultiChainGateway(merchantAddress);
```

### Initialize Single Network Gateway
```javascript
import { PaymentGateway } from './src/PaymentGateway.js';

// For Base network only
const gateway = new PaymentGateway('BASE', merchantAddress);
```

## Creating Payments

### Base Network - USDC
```javascript
const payment = await gateway.createPayment('BASE', 'USDC', 50.00);

console.log('Payment ID:', payment.id);
console.log('Token Address:', payment.tokenAddress);
console.log('Amount:', payment.amount);
console.log('Status:', payment.status);
console.log('Expires:', new Date(payment.expiresAt));
```

### Polygon Network - USDT
```javascript
const payment = await gateway.createPayment('POLYGON', 'USDT', 150.00);
```

### Lightning Network
```javascript
const payment = await gateway.createPayment('BTC_LIGHTNING', 'USDC', 25.00);
console.log('Lightning Invoice:', payment.lightningInvoice);
```

## Monitoring Payments

### Check Single Payment Status
```javascript
const status = await gateway.checkPayment(paymentId);

if (status.status === 'confirmed') {
  console.log('✓ Payment received!');
  console.log('Confirmed at:', status.confirmedAt);
} else if (status.status === 'expired') {
  console.log('⚠ Payment expired');
} else {
  console.log('⏳ Payment pending');
}
```

### Monitor All Active Payments
```javascript
const activePayments = gateway.getAllActivePayments();

activePayments.forEach(payment => {
  console.log(`${payment.id}: ${payment.amount} ${payment.stablecoin}`);
  console.log(`  Network: ${payment.gatewayNetwork}`);
  console.log(`  Status: ${payment.status}`);
});
```

### Poll for Payment Completion
```javascript
function pollPayment(paymentId, callback) {
  const interval = setInterval(async () => {
    const status = await gateway.checkPayment(paymentId);
    
    if (status.status === 'confirmed') {
      clearInterval(interval);
      callback(null, status);
    } else if (status.status === 'expired') {
      clearInterval(interval);
      callback(new Error('Payment expired'), status);
    }
  }, 5000); // Check every 5 seconds
  
  // Set maximum timeout (5 minutes)
  setTimeout(() => {
    clearInterval(interval);
    callback(new Error('Payment timeout'));
  }, 300000);
}

// Usage
pollPayment(payment.id, (error, status) => {
  if (error) {
    console.error('Payment failed:', error.message);
  } else {
    console.log('Payment confirmed:', status);
  }
});
```

## Network Selection

### Automatic Recommendation
```javascript
const amount = 75.00;
const recommendedNetwork = gateway.recommendNetwork(amount);
const payment = await gateway.createPayment(recommendedNetwork, 'USDC', amount);
```

### Recommendation Logic
- **Lightning Network**: Best for amounts < $100 (instant, lowest fees)
- **Base**: Optimal for amounts $100-$1000 (fast, low fees)
- **Polygon**: Best for amounts > $1000 (very low fees, high throughput)

### Manual Selection
```javascript
// Choose based on your requirements
const networks = gateway.getAvailableNetworks();

networks.forEach(network => {
  console.log(`${network.name}:`);
  console.log(`  Supported: ${network.info.supportedStablecoins.join(', ')}`);
  console.log(`  Chain ID: ${network.info.config.chainId || 'N/A'}`);
});
```

## Integration Examples

### Point of Sale Terminal
```javascript
class POSTerminal {
  constructor(merchantAddress) {
    this.gateway = new MultiChainGateway(merchantAddress);
  }

  async processPayment(amount, currency = 'USDC') {
    try {
      // Get recommended network
      const network = this.gateway.recommendNetwork(amount);
      
      // Create payment
      const payment = await this.gateway.createPayment(network, currency, amount);
      
      // Display to customer
      console.log('\n=== Payment Request ===');
      console.log(`Amount: ${amount} ${currency}`);
      console.log(`Network: ${network}`);
      console.log(`Payment ID: ${payment.id}`);
      console.log(`Token Address: ${payment.tokenAddress}`);
      console.log(`Send to: ${payment.merchantAddress}`);
      console.log('=====================\n');
      
      // Wait for payment
      return await this.waitForPayment(payment.id);
    } catch (error) {
      console.error('Payment processing error:', error.message);
      throw error;
    }
  }

  async waitForPayment(paymentId) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        const status = await this.gateway.checkPayment(paymentId);
        
        if (status.status === 'confirmed') {
          clearInterval(checkInterval);
          resolve(status);
        } else if (status.status === 'expired') {
          clearInterval(checkInterval);
          reject(new Error('Payment expired'));
        }
      }, 3000);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Payment timeout'));
      }, 300000);
    });
  }
}

// Usage
const terminal = new POSTerminal('0xYourMerchantAddress');
const result = await terminal.processPayment(99.99, 'USDC');
console.log('Payment completed:', result);
```

### E-commerce Checkout
```javascript
async function processCheckout(orderId, amount) {
  const gateway = new MultiChainGateway(process.env.MERCHANT_ADDRESS);
  
  // Create payment with metadata
  const payment = await gateway.createPayment('BASE', 'USDC', amount);
  
  // Store in database
  await database.savePayment({
    orderId,
    paymentId: payment.id,
    amount: payment.amount,
    network: payment.network,
    tokenAddress: payment.tokenAddress,
    status: payment.status,
    expiresAt: payment.expiresAt
  });
  
  // Return payment info to frontend
  return {
    paymentId: payment.id,
    qrCode: generateQRCode(payment),
    expiresAt: payment.expiresAt
  };
}
```

### Subscription Payment
```javascript
async function processSubscription(userId, monthlyFee) {
  const gateway = new MultiChainGateway(process.env.MERCHANT_ADDRESS);
  
  // Create monthly payment
  const payment = await gateway.createPayment('POLYGON', 'USDT', monthlyFee);
  
  // Log subscription payment
  await logSubscriptionPayment({
    userId,
    paymentId: payment.id,
    amount: monthlyFee,
    month: new Date().toISOString().slice(0, 7)
  });
  
  return payment;
}
```

## Troubleshooting

### Payment Not Confirming
**Issue**: Payment status remains "pending"

**Solutions**:
1. Verify the customer sent the correct amount
2. Check the correct token address was used
3. Confirm transaction on blockchain explorer
4. Wait for required block confirmations (default: 2 blocks)

```javascript
// Check payment details
const payment = await gateway.checkPayment(paymentId);
console.log('Expected amount:', payment.amount);
console.log('Token address:', payment.tokenAddress);
console.log('Merchant address:', payment.merchantAddress);
```

### Network Connection Issues
**Issue**: Cannot connect to RPC endpoint

**Solutions**:
1. Verify internet connection
2. Check RPC URL is accessible
3. Use alternative RPC endpoints

```javascript
// Custom RPC configuration (in config.js)
export const NETWORKS = {
  BASE: {
    rpcUrl: 'https://alternative-rpc-url.com'
  }
};
```

### Payment Expired
**Issue**: Payment expired before customer completed it

**Solutions**:
1. Create new payment request
2. Adjust timeout settings
3. Notify customer earlier

```javascript
// Custom timeout (in config.js)
export const PAYMENT_TIMEOUT = 600000; // 10 minutes
```

### Insufficient Balance
**Issue**: Customer wallet has insufficient balance

**Solutions**:
1. Check customer's token balance
2. Verify correct network is selected
3. Guide customer to acquire tokens

```javascript
// Helper function to check balance (add to PaymentGateway.js)
async checkCustomerBalance(customerAddress, tokenAddress) {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
  const balance = await contract.balanceOf(customerAddress);
  const decimals = await contract.decimals();
  return ethers.formatUnits(balance, decimals);
}
```

## Advanced Features

### Custom Network Configuration
```javascript
// Override network settings
const customGateway = new PaymentGateway('BASE', merchantAddress);
customGateway.provider = new ethers.JsonRpcProvider('https://custom-rpc.com');
```

### Event Listeners (Future Enhancement)
```javascript
// Conceptual implementation
gateway.on('payment:created', (payment) => {
  console.log('New payment:', payment.id);
});

gateway.on('payment:confirmed', (payment) => {
  console.log('Payment confirmed:', payment.id);
  // Fulfill order, update database, etc.
});

gateway.on('payment:expired', (payment) => {
  console.log('Payment expired:', payment.id);
  // Notify customer, cancel order, etc.
});
```

### Webhook Integration (Future Enhancement)
```javascript
// Conceptual implementation
gateway.setWebhook('https://your-server.com/webhook', {
  events: ['payment.confirmed', 'payment.expired'],
  secret: 'your-webhook-secret'
});
```

## Best Practices

1. **Always validate payments on-chain** before fulfilling orders
2. **Store payment IDs** in your database for reconciliation
3. **Set appropriate timeouts** based on your use case
4. **Handle network errors gracefully** with retries and fallbacks
5. **Log all payment operations** for audit trail
6. **Test with small amounts** before production deployment
7. **Keep private keys secure** and never expose them in code
8. **Monitor gas prices** and adjust network selection accordingly
9. **Implement proper error handling** for all payment operations
10. **Provide clear instructions** to customers for payment process

## Security Checklist

- [ ] Merchant wallet is a secure hardware wallet or multi-sig
- [ ] Private keys are stored in secure environment variables
- [ ] Payment amounts are validated server-side
- [ ] All transactions are verified on-chain
- [ ] Customer addresses are validated
- [ ] Network confirmations are awaited before fulfillment
- [ ] Payment expiration is enforced
- [ ] All errors are logged for security monitoring
- [ ] API keys and secrets are not exposed in frontend
- [ ] Regular security audits are performed

## Support and Resources

- GitHub Repository: https://github.com/BarbieMar/BarbieMar
- Discord: @barbiemar30
- Base Documentation: https://docs.base.org
- Polygon Documentation: https://docs.polygon.technology
- Lightning Network: https://lightning.network/docs
- Ethers.js Documentation: https://docs.ethers.org

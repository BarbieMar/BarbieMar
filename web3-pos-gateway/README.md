# WEB3 POS Gateway

A comprehensive Point of Sale (POS) payment gateway for Web3 that supports multiple blockchain networks and stablecoins.

## Features

### Supported Networks
- **Base** - Ethereum L2 with low fees and fast transactions
- **Polygon** - High-speed, low-cost Ethereum sidechain
- **Bitcoin Lightning Network** - Instant, low-fee Bitcoin payments

### Supported Stablecoins
- **USDC** (USD Coin) - Available on Base and Polygon
- **USDT** (Tether) - Available on Base and Polygon

## Installation

```bash
npm install
```

## Quick Start

### Basic Usage

```javascript
import { MultiChainGateway } from './src/index.js';

// Initialize gateway with your merchant wallet address
const merchantAddress = '0xYourWalletAddress';
const gateway = new MultiChainGateway(merchantAddress);

// Create a payment request on Base network
const payment = await gateway.createPayment('BASE', 'USDC', 50.00);
console.log('Payment ID:', payment.id);
console.log('Payment Address:', payment.merchantAddress);

// Check payment status
const status = await gateway.checkPayment(payment.id);
console.log('Payment Status:', status.status);
```

### Single Network Gateway

```javascript
import { PaymentGateway } from './src/PaymentGateway.js';

// Initialize for specific network
const gateway = new PaymentGateway('POLYGON', '0xYourWalletAddress');

// Create payment request
const payment = await gateway.createPaymentRequest('USDT', 100.00);
```

## API Reference

### MultiChainGateway

Main class for managing payments across multiple networks.

#### Methods

##### `constructor(merchantAddress)`
Initialize multi-chain gateway with merchant wallet address.

##### `async createPayment(network, stablecoin, amount)`
Create a new payment request.
- `network`: 'BASE', 'POLYGON', or 'BTC_LIGHTNING'
- `stablecoin`: 'USDC' or 'USDT'
- `amount`: Payment amount in USD

Returns payment object with ID and details.

##### `async checkPayment(paymentId)`
Check status of a payment by ID.

##### `getAllActivePayments()`
Get all active payments across all networks.

##### `getAvailableNetworks()`
Get list of available networks and their configuration.

##### `recommendNetwork(amount)`
Get recommended network based on payment amount.

##### `async cancelPayment(paymentId)`
Cancel a pending payment.

### PaymentGateway

Individual network payment gateway.

#### Methods

##### `constructor(network, merchantAddress)`
Initialize gateway for specific network.

##### `async createPaymentRequest(stablecoin, amount)`
Create payment request on this network.

##### `async checkPaymentStatus(paymentId)`
Check payment status.

##### `getNetworkInfo()`
Get network configuration and details.

## Payment Flow

1. **Create Payment Request**
   ```javascript
   const payment = await gateway.createPayment('BASE', 'USDC', 50);
   ```

2. **Present to Customer**
   - Show payment amount and token address
   - Display QR code (integration needed)
   - Set payment timeout (default: 5 minutes)

3. **Monitor Payment**
   ```javascript
   const status = await gateway.checkPayment(payment.id);
   if (status.status === 'confirmed') {
     // Payment received!
   }
   ```

4. **Handle Result**
   - Confirmed: Complete transaction
   - Expired: Request new payment
   - Cancelled: Abort transaction

## Network Details

### Base Network
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- USDT: `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2`

### Polygon Network
- Chain ID: 137
- RPC: https://polygon-rpc.com
- Explorer: https://polygonscan.com
- USDC: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

### Lightning Network
- Type: Bitcoin Layer 2
- Fast, low-fee payments
- Requires Lightning node connection

## Configuration

Environment variables:
```bash
# Lightning Network node URL (optional)
LN_NODE_URL=http://localhost:8080
```

## Example Demo

Run the included demonstration:

```bash
npm start
```

This will show:
- Gateway initialization
- Payment creation on all networks
- Payment status tracking
- Network recommendations

## Security Considerations

1. **Private Keys**: Never expose private keys in code
2. **Merchant Address**: Use secure wallet for receiving payments
3. **Payment Validation**: Always verify payments on-chain
4. **Timeout Handling**: Implement proper payment expiration
5. **Network Confirmations**: Wait for block confirmations (default: 2 blocks)

## Best Practices

### Network Selection
- **Lightning**: Small payments < $100 (instant, lowest fees)
- **Base**: Medium payments $100-$1000 (fast, low fees)
- **Polygon**: Large payments > $1000 (very low fees)

### Error Handling
```javascript
try {
  const payment = await gateway.createPayment('BASE', 'USDC', 50);
} catch (error) {
  console.error('Payment creation failed:', error.message);
  // Fallback to alternative network
}
```

### Payment Monitoring
```javascript
// Poll for payment status
const interval = setInterval(async () => {
  const status = await gateway.checkPayment(paymentId);
  
  if (status.status === 'confirmed') {
    clearInterval(interval);
    console.log('Payment received!');
  } else if (status.status === 'expired') {
    clearInterval(interval);
    console.log('Payment expired');
  }
}, 5000); // Check every 5 seconds
```

## Future Enhancements

- [ ] QR code generation for payment addresses
- [ ] Webhook notifications for payment events
- [ ] Additional blockchain support (Arbitrum, Optimism)
- [ ] More stablecoins (DAI, BUSD)
- [ ] Advanced payment analytics
- [ ] Multi-signature wallet support
- [ ] Payment splitting/routing
- [ ] Real Lightning Network integration
- [ ] Payment reconciliation tools

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/BarbieMar/BarbieMar/issues)
- Discord: @barbiemar30

## Author

**BarbieMar** - Cybersecurity & AI enthusiast learning Web3 development

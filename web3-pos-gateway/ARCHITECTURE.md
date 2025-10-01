# WEB3 POS Gateway - Architecture Documentation

## System Overview

The WEB3 POS Gateway is a modular payment processing system designed to handle cryptocurrency payments across multiple blockchain networks. It provides a unified interface for merchants to accept stablecoin payments (USDC/USDT) on Base, Polygon, and Bitcoin Lightning Network.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Merchant Application                      │
│                    (POS Terminal, E-commerce)                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Import/Use
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   MultiChainGateway                          │
│  - Manages multiple network gateways                         │
│  - Routes payments to appropriate network                    │
│  - Aggregates payment data across networks                   │
└─────────┬───────────────────┬─────────────────┬─────────────┘
          │                   │                 │
          │                   │                 │
          ▼                   ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ PaymentGateway  │  │ PaymentGateway  │  │ PaymentGateway   │
│     (BASE)      │  │   (POLYGON)     │  │ (BTC_LIGHTNING)  │
│                 │  │                 │  │                  │
│ - USDC/USDT     │  │ - USDC/USDT     │  │ - BTC payments   │
│ - Chain: 8453   │  │ - Chain: 137    │  │ - Lightning Node │
└────────┬────────┘  └────────┬────────┘  └────────┬─────────┘
         │                    │                     │
         │                    │                     │
         ▼                    ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  Ethers.js      │  │  Ethers.js      │  │ Lightning Client │
│  Provider       │  │  Provider       │  │  (Future)        │
└────────┬────────┘  └────────┬────────┘  └────────┬─────────┘
         │                    │                     │
         │                    │                     │
         ▼                    ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  Base Network   │  │ Polygon Network │  │  Lightning       │
│  (RPC)          │  │  (RPC)          │  │  Network         │
└─────────────────┘  └─────────────────┘  └──────────────────┘
```

## Core Components

### 1. Configuration Module (`config.js`)

**Purpose**: Central configuration for all supported networks and tokens

**Key Elements**:
- Network definitions (RPC URLs, chain IDs, explorers)
- Token contract addresses for each network
- ERC20 ABI for token interactions
- Global settings (timeouts, confirmations)

**Data Structures**:
```javascript
NETWORKS = {
  BASE: { name, chainId, rpcUrl, explorer },
  POLYGON: { name, chainId, rpcUrl, explorer },
  BTC_LIGHTNING: { name, type, nodeUrl }
}

STABLECOINS = {
  BASE: { USDC: address, USDT: address },
  POLYGON: { USDC: address, USDT: address }
}
```

### 2. PaymentGateway Class (`PaymentGateway.js`)

**Purpose**: Single-network payment processor

**Responsibilities**:
- Initialize connection to specific blockchain network
- Create payment requests
- Monitor payment status
- Handle payment lifecycle (pending → confirmed/expired/cancelled)

**Key Methods**:

#### `constructor(network, merchantAddress)`
- Initializes gateway for specific network
- Sets up blockchain provider (ethers.js or Lightning client)
- Validates network configuration

#### `createPaymentRequest(stablecoin, amount)`
- Generates unique payment ID
- Creates payment object with all necessary details
- Sets expiration timeout
- Returns payment request to merchant

#### `checkPaymentStatus(paymentId)`
- Queries blockchain for payment confirmation
- Checks token balance or Lightning invoice status
- Updates payment status
- Returns current payment state

#### `checkTokenTransfer(tokenAddress, expectedAmount)`
- Interacts with ERC20 contract
- Verifies merchant wallet balance
- Confirms payment amount matches expected value

**State Management**:
- Maintains Map of active payments
- Tracks payment lifecycle states:
  - `pending`: Payment created, awaiting confirmation
  - `confirmed`: Payment received and verified
  - `expired`: Payment timeout reached
  - `cancelled`: Payment cancelled by merchant

### 3. MultiChainGateway Class (`MultiChainGateway.js`)

**Purpose**: Unified interface for all supported networks

**Responsibilities**:
- Initialize and manage multiple PaymentGateway instances
- Route payment requests to appropriate network
- Aggregate data across all networks
- Provide network recommendations

**Key Methods**:

#### `constructor(merchantAddress)`
- Creates PaymentGateway instance for each supported network
- Initializes connection to all chains
- Handles initialization errors gracefully

#### `createPayment(network, stablecoin, amount)`
- Validates network and stablecoin combination
- Delegates to appropriate PaymentGateway
- Returns unified payment response

#### `checkPayment(paymentId)`
- Searches across all gateways for payment
- Returns first matching payment status
- Throws error if payment not found

#### `getAllActivePayments()`
- Aggregates active payments from all gateways
- Adds network identifier to each payment
- Returns consolidated list

#### `recommendNetwork(amount)`
- Implements network selection logic based on amount
- Returns optimal network name
- Logic:
  - < $100: Lightning (instant, minimal fees)
  - $100-$1000: Base (fast, low fees)
  - > $1000: Polygon (lowest fees, high throughput)

## Data Flow

### Payment Creation Flow

```
Merchant Request
     ↓
MultiChainGateway.createPayment()
     ↓
Validate inputs (network, stablecoin, amount)
     ↓
PaymentGateway.createPaymentRequest()
     ↓
Generate unique payment ID
     ↓
Create payment object with:
  - Payment ID
  - Amount and currency
  - Merchant address
  - Token contract address
  - Expiration timestamp
  - Network details
     ↓
Store in payment Map
     ↓
Return payment details to merchant
```

### Payment Monitoring Flow

```
Merchant Query (payment ID)
     ↓
MultiChainGateway.checkPayment()
     ↓
Search all PaymentGateways
     ↓
PaymentGateway.checkPaymentStatus()
     ↓
Check expiration
     ↓
Query blockchain:
  - EVM: Check token balance
  - Lightning: Check invoice status
     ↓
Update payment status
     ↓
Return status to merchant
```

## Network-Specific Implementation

### EVM Networks (Base, Polygon)

**Provider**: Ethers.js JsonRpcProvider
**Protocol**: JSON-RPC over HTTPS
**Token Standard**: ERC20

**Payment Verification**:
1. Create ERC20 contract instance
2. Call `balanceOf(merchantAddress)`
3. Compare balance with expected amount
4. Optionally query transaction history for specific transfer

**Advantages**:
- Well-established standard
- Wide ecosystem support
- Good tooling and documentation

**Considerations**:
- Gas fees vary by network
- Confirmation times: ~1-2 seconds (Base), ~2-3 seconds (Polygon)
- Requires block confirmations for security

### Lightning Network (Bitcoin L2)

**Provider**: Lightning Network node (placeholder implementation)
**Protocol**: BOLT (Basis of Lightning Technology)
**Currency**: Bitcoin (satoshis)

**Payment Verification**:
1. Create Lightning invoice
2. Monitor invoice status via node API
3. Confirm payment receipt
4. Mark as confirmed

**Advantages**:
- Instant settlement
- Minimal fees
- High scalability

**Considerations**:
- Requires Lightning node infrastructure
- Channel liquidity management
- Different UX from blockchain payments

## Security Considerations

### Payment Validation
- All amounts are validated before processing
- Token contracts are verified against known addresses
- Merchant address is validated for each payment

### Timeout Handling
- Default 5-minute payment window
- Expired payments cannot be confirmed
- Prevents stale payment confirmations

### Network Confirmations
- Default: 2 block confirmations
- Prevents reorganization attacks
- Configurable based on risk tolerance

### Private Key Management
- Gateway never handles private keys
- Merchant wallet managed separately
- Read-only blockchain access

### Error Handling
- Graceful degradation on network errors
- Failed networks don't crash system
- Clear error messages for debugging

## Scalability Considerations

### Horizontal Scaling
- Stateless payment verification
- Can run multiple gateway instances
- Shared payment database recommended

### Performance
- Async/await for non-blocking operations
- Efficient Map-based payment storage
- Minimal blockchain queries

### Future Enhancements

#### Short Term
1. **Real Lightning Network Integration**
   - Integrate LND or c-lightning
   - Implement invoice monitoring
   - Add channel management

2. **Payment Events/Webhooks**
   - Emit events for payment lifecycle
   - HTTP webhook notifications
   - WebSocket real-time updates

3. **QR Code Generation**
   - Generate payment QR codes
   - Include all necessary payment details
   - Support multiple wallet formats

#### Medium Term
1. **Additional Networks**
   - Arbitrum
   - Optimism
   - Avalanche
   - BSC

2. **More Stablecoins**
   - DAI
   - BUSD
   - USDD

3. **Payment Analytics**
   - Transaction history
   - Volume tracking
   - Network performance metrics

4. **Advanced Features**
   - Payment splitting
   - Multi-signature support
   - Recurring payments
   - Partial payments

#### Long Term
1. **Decentralized Infrastructure**
   - IPFS for configuration
   - Distributed payment tracking
   - Censorship resistance

2. **Cross-Chain Swaps**
   - Automatic currency conversion
   - Best rate routing
   - Unified liquidity

3. **Compliance Features**
   - KYC/AML integration
   - Tax reporting
   - Regulatory compliance tools

## Testing Strategy

### Unit Tests
- Configuration validation
- Payment creation logic
- Status checking algorithms
- Network recommendation logic

### Integration Tests
- Multi-gateway coordination
- Cross-network payment tracking
- Error handling scenarios

### End-to-End Tests
- Full payment flow with test networks
- Timeout and expiration handling
- Cancellation workflows

### Performance Tests
- Concurrent payment handling
- High-volume scenarios
- Network latency simulation

## Monitoring and Observability

### Metrics to Track
- Payment creation rate
- Confirmation success rate
- Average confirmation time
- Network availability
- Error rates by type

### Logging
- All payment operations
- Network interactions
- Error conditions
- Performance metrics

### Alerting
- Network connectivity issues
- High error rates
- Payment processing delays
- Security events

## Deployment Recommendations

### Environment Variables
```bash
MERCHANT_ADDRESS=0x...
LN_NODE_URL=http://...
BASE_RPC_URL=https://...  # Optional override
POLYGON_RPC_URL=https://... # Optional override
PAYMENT_TIMEOUT=300000
CONFIRMATION_BLOCKS=2
```

### Infrastructure
- **Compute**: Node.js 18+ environment
- **Networking**: Reliable internet connection
- **Blockchain Access**: Direct RPC endpoints or API services (Alchemy, Infura)
- **Lightning Node**: LND or c-lightning (if using Lightning)

### High Availability
- Multiple RPC providers with failover
- Health checks for all networks
- Automatic retry logic
- Graceful degradation

## Conclusion

The WEB3 POS Gateway provides a robust, extensible foundation for accepting cryptocurrency payments across multiple networks. Its modular architecture allows for easy addition of new networks and features while maintaining a simple, unified interface for merchants.

import { ethers } from 'ethers';
import { NETWORKS, STABLECOINS, ERC20_ABI, PAYMENT_TIMEOUT, CONFIRMATION_BLOCKS } from './config.js';

/**
 * WEB3 POS Payment Gateway
 * Handles payments on Base, Polygon, and Lightning Network
 */
export class PaymentGateway {
  constructor(network, merchantAddress) {
    this.network = network;
    this.merchantAddress = merchantAddress;
    this.provider = null;
    this.payments = new Map();
    
    this.initialize();
  }

  /**
   * Initialize the payment gateway with the appropriate provider
   */
  initialize() {
    const networkConfig = NETWORKS[this.network];
    
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${this.network}`);
    }

    if (networkConfig.type === 'lightning') {
      console.log(`Initializing Lightning Network gateway at ${networkConfig.nodeUrl}`);
      // Lightning Network would require a different client library
      this.isLightning = true;
    } else {
      this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      this.isLightning = false;
      console.log(`Initialized ${networkConfig.name} gateway on chain ${networkConfig.chainId}`);
    }
  }

  /**
   * Create a new payment request
   * @param {string} stablecoin - 'USDC' or 'USDT'
   * @param {number} amount - Payment amount in stablecoin units
   * @returns {Object} Payment request details
   */
  async createPaymentRequest(stablecoin, amount) {
    if (!['USDC', 'USDT'].includes(stablecoin)) {
      throw new Error('Unsupported stablecoin. Use USDC or USDT');
    }

    const paymentId = this.generatePaymentId();
    const timestamp = Date.now();

    const payment = {
      id: paymentId,
      stablecoin,
      amount,
      merchantAddress: this.merchantAddress,
      status: 'pending',
      createdAt: timestamp,
      expiresAt: timestamp + PAYMENT_TIMEOUT
    };

    if (this.isLightning) {
      payment.lightningInvoice = await this.createLightningInvoice(amount);
    } else {
      const tokenAddress = STABLECOINS[this.network][stablecoin];
      payment.tokenAddress = tokenAddress;
      payment.network = this.network;
      payment.chainId = NETWORKS[this.network].chainId;
    }

    this.payments.set(paymentId, payment);
    return payment;
  }

  /**
   * Monitor payment status
   * @param {string} paymentId - Payment identifier
   * @returns {Promise<Object>} Payment status
   */
  async checkPaymentStatus(paymentId) {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (Date.now() > payment.expiresAt) {
      payment.status = 'expired';
      return payment;
    }

    if (this.isLightning) {
      // Check Lightning Network invoice status
      payment.status = await this.checkLightningInvoice(payment.lightningInvoice);
    } else {
      // Check EVM-based payment
      const received = await this.checkTokenTransfer(
        payment.tokenAddress,
        payment.amount
      );
      
      if (received) {
        payment.status = 'confirmed';
        payment.confirmedAt = Date.now();
      }
    }

    return payment;
  }

  /**
   * Check if token transfer has been received
   * @param {string} tokenAddress - Token contract address
   * @param {number} expectedAmount - Expected payment amount
   * @returns {Promise<boolean>} Whether payment was received
   */
  async checkTokenTransfer(tokenAddress, expectedAmount) {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(this.merchantAddress);
      const decimals = await contract.decimals();
      
      const expectedAmountWei = ethers.parseUnits(expectedAmount.toString(), decimals);
      
      // In production, you'd track specific transactions
      // This is a simplified check
      return balance >= expectedAmountWei;
    } catch (error) {
      console.error('Error checking token transfer:', error);
      return false;
    }
  }

  /**
   * Generate unique payment ID
   * @returns {string} Unique payment identifier
   */
  generatePaymentId() {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create Lightning Network invoice
   * @param {number} amount - Amount in satoshis or USD cents
   * @returns {Promise<string>} Lightning invoice string
   */
  async createLightningInvoice(amount) {
    // In production, this would call a Lightning node API
    // This is a placeholder implementation
    console.log(`Creating Lightning invoice for ${amount} units`);
    return `lnbc${amount}n1...`; // Placeholder invoice
  }

  /**
   * Check Lightning Network invoice status
   * @param {string} invoice - Lightning invoice string
   * @returns {Promise<string>} Payment status
   */
  async checkLightningInvoice(invoice) {
    // In production, this would query the Lightning node
    console.log(`Checking Lightning invoice: ${invoice}`);
    return 'pending'; // Placeholder
  }

  /**
   * Get all active payments
   * @returns {Array<Object>} List of active payments
   */
  getActivePayments() {
    const now = Date.now();
    return Array.from(this.payments.values()).filter(
      p => p.status === 'pending' && now < p.expiresAt
    );
  }

  /**
   * Cancel a payment
   * @param {string} paymentId - Payment identifier
   * @returns {Object} Updated payment object
   */
  cancelPayment(paymentId) {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'confirmed') {
      throw new Error('Cannot cancel confirmed payment');
    }

    payment.status = 'cancelled';
    payment.cancelledAt = Date.now();
    
    return payment;
  }

  /**
   * Get network information
   * @returns {Object} Network details
   */
  getNetworkInfo() {
    return {
      network: this.network,
      config: NETWORKS[this.network],
      merchantAddress: this.merchantAddress,
      supportedStablecoins: this.isLightning ? ['BTC'] : ['USDC', 'USDT']
    };
  }
}

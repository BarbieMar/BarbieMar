import { PaymentGateway } from './PaymentGateway.js';
import { NETWORKS } from './config.js';

/**
 * Multi-chain Payment Gateway Manager
 * Manages payment gateways across Base, Polygon, and Lightning Network
 */
export class MultiChainGateway {
  constructor(merchantAddress) {
    this.merchantAddress = merchantAddress;
    this.gateways = new Map();
    this.initializeGateways();
  }

  /**
   * Initialize gateways for all supported networks
   */
  initializeGateways() {
    for (const network of Object.keys(NETWORKS)) {
      try {
        const gateway = new PaymentGateway(network, this.merchantAddress);
        this.gateways.set(network, gateway);
        console.log(`✓ ${network} gateway initialized`);
      } catch (error) {
        console.error(`✗ Failed to initialize ${network} gateway:`, error.message);
      }
    }
  }

  /**
   * Create payment request on specified network
   * @param {string} network - Network name (BASE, POLYGON, BTC_LIGHTNING)
   * @param {string} stablecoin - Stablecoin type (USDC, USDT)
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} Payment request details
   */
  async createPayment(network, stablecoin, amount) {
    const gateway = this.gateways.get(network);
    
    if (!gateway) {
      throw new Error(`Gateway not available for network: ${network}`);
    }

    return await gateway.createPaymentRequest(stablecoin, amount);
  }

  /**
   * Check payment status across all networks
   * @param {string} paymentId - Payment identifier
   * @returns {Promise<Object>} Payment status
   */
  async checkPayment(paymentId) {
    for (const gateway of this.gateways.values()) {
      try {
        const status = await gateway.checkPaymentStatus(paymentId);
        if (status) {
          return status;
        }
      } catch (error) {
        // Payment not found in this gateway, continue
        continue;
      }
    }
    
    throw new Error('Payment not found in any gateway');
  }

  /**
   * Get all active payments across all networks
   * @returns {Array<Object>} List of active payments
   */
  getAllActivePayments() {
    const allPayments = [];
    
    for (const [network, gateway] of this.gateways.entries()) {
      const payments = gateway.getActivePayments();
      payments.forEach(p => {
        p.gatewayNetwork = network;
        allPayments.push(p);
      });
    }
    
    return allPayments;
  }

  /**
   * Get available networks and their status
   * @returns {Array<Object>} Network information
   */
  getAvailableNetworks() {
    const networks = [];
    
    for (const [networkName, gateway] of this.gateways.entries()) {
      networks.push({
        name: networkName,
        info: gateway.getNetworkInfo(),
        isAvailable: true
      });
    }
    
    return networks;
  }

  /**
   * Cancel payment on any network
   * @param {string} paymentId - Payment identifier
   * @returns {Object} Updated payment
   */
  async cancelPayment(paymentId) {
    for (const gateway of this.gateways.values()) {
      try {
        return gateway.cancelPayment(paymentId);
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Payment not found in any gateway');
  }

  /**
   * Get recommended network based on amount and preferences
   * @param {number} amount - Payment amount
   * @returns {string} Recommended network name
   */
  recommendNetwork(amount) {
    // Lightning Network is best for small amounts (< $100)
    if (amount < 100) {
      return 'BTC_LIGHTNING';
    }
    
    // Base for medium amounts (good gas fees)
    if (amount < 1000) {
      return 'BASE';
    }
    
    // Polygon for larger amounts (very low gas fees)
    return 'POLYGON';
  }
}

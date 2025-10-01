/**
 * WEB3 POS Gateway Configuration
 * Supports Base, Polygon, and BTC Lightning networks
 */

export const NETWORKS = {
  BASE: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org'
  },
  POLYGON: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com'
  },
  BTC_LIGHTNING: {
    name: 'Bitcoin Lightning Network',
    type: 'lightning',
    // Lightning Network uses different infrastructure
    nodeUrl: process.env.LN_NODE_URL || 'http://localhost:8080'
  }
};

// USDC and USDT contract addresses on different networks
export const STABLECOINS = {
  BASE: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
  },
  POLYGON: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  }
};

// Standard ERC20 ABI for token interactions
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

export const PAYMENT_TIMEOUT = 300000; // 5 minutes
export const CONFIRMATION_BLOCKS = 2; // Wait for 2 block confirmations

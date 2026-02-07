/**
 * FUN Money Wallet Hook
 * SDK v1.0 - Copy this file to src/hooks/useWallet.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// ===== BSC TESTNET CONFIG =====

const BSC_TESTNET = {
  chainId: '0x61', // 97 in hex
  chainIdNumber: 97,
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com']
};

// ===== TYPES =====

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectChain: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

interface UseWalletReturn extends WalletState {
  isConnecting: boolean;
  error: string | null;
  hasMetaMask: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToBscTestnet: () => Promise<void>;
  clearError: () => void;
}

// ===== HOOK =====

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectChain: false,
    provider: null,
    signer: null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const hasMetaMask = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // Initialize wallet from existing connection
  const initializeWallet = useCallback(async () => {
    if (!hasMetaMask) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        setState({
          isConnected: true,
          address,
          chainId,
          isCorrectChain: chainId === BSC_TESTNET.chainIdNumber,
          provider,
          signer
        });
      }
    } catch (err) {
      console.error('Failed to initialize wallet:', err);
    }
  }, [hasMetaMask]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!hasMetaMask) {
      setError('Please install MetaMask to continue');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setState({
        isConnected: true,
        address,
        chainId,
        isCorrectChain: chainId === BSC_TESTNET.chainIdNumber,
        provider,
        signer
      });
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError('Failed to connect wallet');
      }
      console.error('Connect error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [hasMetaMask]);

  // Switch to BSC Testnet
  const switchToBscTestnet = useCallback(async () => {
    if (!hasMetaMask) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET.chainId }]
      });
    } catch (err: any) {
      // Chain not added, try to add it
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_TESTNET]
          });
        } catch (addErr) {
          setError('Failed to add BSC Testnet');
          console.error('Add chain error:', addErr);
        }
      } else {
        setError('Failed to switch network');
        console.error('Switch chain error:', err);
      }
    }
  }, [hasMetaMask]);

  // Disconnect (just clear state)
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectChain: false,
      provider: null,
      signer: null
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!hasMetaMask) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        initializeWallet();
      }
    };

    const handleChainChanged = () => {
      initializeWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Initialize on mount
    initializeWallet();

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [hasMetaMask, initializeWallet, disconnect]);

  return {
    ...state,
    isConnecting,
    error,
    hasMetaMask,
    connect,
    disconnect,
    switchToBscTestnet,
    clearError
  };
}

// ===== TYPE DECLARATION =====

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// BSC Testnet config
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

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectChain: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

export function useWallet() {
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

  // Initialize provider and check connection
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
      setError('Vui lòng cài đặt MetaMask để tiếp tục');
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
        setError('Người dùng đã từ chối kết nối');
      } else {
        setError('Không thể kết nối ví');
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
          setError('Không thể thêm BSC Testnet');
          console.error('Add chain error:', addErr);
        }
      } else {
        setError('Không thể chuyển mạng');
        console.error('Switch chain error:', err);
      }
    }
  }, [hasMetaMask]);

  // Disconnect (just clear state, MetaMask doesn't have a real disconnect)
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
    clearError: () => setError(null)
  };
}

// Add ethereum type to window
declare global {
  interface Window {
    ethereum?: any;
  }
}

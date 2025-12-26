import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export const useWallet = () => {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  
  const { data: balance } = useBalance({
    address: address,
  });

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      return true;
    }
    return false;
  };

  return {
    address,
    isConnected,
    isConnecting,
    chain,
    balance,
    disconnect,
    openConnectModal,
    formatAddress: address ? formatAddress(address) : '',
    copyAddress,
  };
};
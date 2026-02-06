import { BrowserProvider, Contract } from 'ethers';
import { getFunMoneyAddress, FUN_MONEY_ABI, createActionHash, checkContractExists, BSC_TESTNET_CONFIG } from './web3';

export interface ValidationDetail {
  key: string;
  label: string;
  labelVi: string;
  passed: boolean;
  value: string;
  hint?: string;
}

export interface MintValidation {
  canMint: boolean;
  issues: string[];
  details: ValidationDetail[];
  contractAddress: string;
}

export async function validateBeforeMint(
  provider: BrowserProvider,
  address: string,
  actionType: string
): Promise<MintValidation> {
  const contractAddress = getFunMoneyAddress();
  const actionHash = createActionHash(actionType);
  
  const issues: string[] = [];
  const details: ValidationDetail[] = [];

  try {
    // 0. Check network first
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const correctNetwork = chainId === BSC_TESTNET_CONFIG.chainId;
    
    details.push({
      key: 'network',
      label: 'Network',
      labelVi: 'Mạng blockchain',
      passed: correctNetwork,
      value: correctNetwork ? 'BSC Testnet ✓' : `Chain ID: ${chainId}`,
      hint: !correctNetwork ? `Vui lòng chuyển sang BSC Testnet (Chain ID: ${BSC_TESTNET_CONFIG.chainId})` : undefined
    });
    
    if (!correctNetwork) {
      issues.push(`❌ Sai mạng. Cần BSC Testnet (Chain ID: ${BSC_TESTNET_CONFIG.chainId})`);
      return { canMint: false, issues, details, contractAddress };
    }

    // 1. Check if contract exists at address
    const { exists: contractExists } = await checkContractExists(provider, contractAddress);
    
    details.push({
      key: 'contract',
      label: 'Contract Exists',
      labelVi: 'Contract tồn tại',
      passed: contractExists,
      value: contractExists ? 'Deployed ✓' : 'Not Found',
      hint: !contractExists ? `Không tìm thấy contract tại ${contractAddress.slice(0, 10)}...` : undefined
    });
    
    if (!contractExists) {
      issues.push('❌ Contract chưa được deploy tại địa chỉ này');
      issues.push('💡 Hãy deploy contract hoặc cập nhật địa chỉ trong Settings');
      return { canMint: false, issues, details, contractAddress };
    }

    // Create contract instance after confirming it exists
    const contract = new Contract(contractAddress, FUN_MONEY_ABI, provider);

    // 2. Check if contract transitions are paused (v1.2.1 uses pauseTransitions)
    const isPaused = await contract.pauseTransitions();
    details.push({
      key: 'paused',
      label: 'Contract Active',
      labelVi: 'Contract đang hoạt động',
      passed: !isPaused,
      value: isPaused ? 'Paused' : 'Active ✓',
      hint: isPaused ? 'Contract đang tạm dừng, không thể mint' : undefined
    });
    if (isPaused) {
      issues.push('❌ Contract đang bị PAUSE, không thể mint');
    }

    // 3. Check if wallet is attester
    const isAttester = await contract.isAttester(address);
    details.push({
      key: 'attester',
      label: 'Attester Status',
      labelVi: 'Quyền Attester',
      passed: isAttester,
      value: isAttester ? 'Verified ✓' : 'Not Attester',
      hint: !isAttester ? 'Ví của bạn chưa được đăng ký làm Attester' : undefined
    });
    if (!isAttester) {
      issues.push('❌ Ví chưa được đăng ký làm Attester');
    }

    // 4. Check threshold (v1.2.1 uses attesterThreshold)
    const threshold = await contract.attesterThreshold();
    const thresholdNum = Number(threshold);
    const thresholdOk = thresholdNum === 1;
    details.push({
      key: 'threshold',
      label: 'Signature Threshold',
      labelVi: 'Ngưỡng chữ ký',
      passed: thresholdOk,
      value: `${thresholdNum} signature(s)`,
      hint: !thresholdOk ? `Cần ${thresholdNum} chữ ký, hiện chỉ có 1` : undefined
    });
    if (!thresholdOk) {
      issues.push(`❌ Contract yêu cầu ${thresholdNum} chữ ký (multi-sig)`);
    }

    // 5. Check if action is registered (v1.2.1 uses actions mapping)
    let actionExists = false;
    let actionVersion = 0;
    try {
      const actionInfo = await contract.actions(actionHash);
      // actions(bytes32) returns (bool exists, uint256 version, bool deprecated)
      actionExists = actionInfo[0] === true || actionInfo.exists === true;
      actionVersion = Number(actionInfo[1] || actionInfo.version || 0);
    } catch {
      // Function might not exist or return differently
      actionExists = false;
    }
    details.push({
      key: 'action',
      label: 'Action Registered',
      labelVi: 'Action đã đăng ký',
      passed: actionExists,
      value: actionExists ? `${actionType} (v${actionVersion})` : 'Not Found',
      hint: !actionExists ? `Action "${actionType}" chưa được đăng ký trên contract. Dùng govRegisterAction() để đăng ký.` : undefined
    });
    if (!actionExists) {
      issues.push(`❌ Action "${actionType}" chưa được đăng ký`);
    }

    // 6. Check epoch cap (v1.2.1 uses epochMintCap)
    let epochOk = true;
    let epochInfo = '0M / 5M FUN';
    try {
      // Get current epoch index and mint cap
      const epochDuration = await contract.epochDuration();
      const epochMintCap = await contract.epochMintCap();
      const currentEpoch = Math.floor(Date.now() / 1000 / Number(epochDuration));
      
      // Try to get minted amount for current epoch
      let epochMinted = 0n;
      try {
        epochMinted = await contract.epochs(currentEpoch);
      } catch {
        // epochs mapping might be empty for this epoch
        epochMinted = 0n;
      }
      
      const remaining = epochMintCap - epochMinted;
      epochOk = remaining > 0n;
      const mintedM = (Number(epochMinted) / 1e18 / 1e6).toFixed(2);
      const capM = (Number(epochMintCap) / 1e18 / 1e6).toFixed(2);
      epochInfo = `${mintedM}M / ${capM}M FUN`;
    } catch {
      // If epoch check fails, assume OK but note it
      epochOk = true;
      epochInfo = 'Check skipped';
    }
    
    details.push({
      key: 'epoch',
      label: 'Epoch Cap',
      labelVi: 'Giới hạn Epoch',
      passed: epochOk,
      value: epochInfo,
      hint: !epochOk ? 'Đã đạt giới hạn mint trong epoch này' : undefined
    });
    if (!epochOk) {
      issues.push('❌ Đã đạt giới hạn mint epoch (5M FUN/ngày)');
    }

    return {
      canMint: issues.length === 0,
      issues,
      details,
      contractAddress
    };

  } catch (err: any) {
    console.error('Validation error:', err);
    
    // Detect specific error types
    let errorMessage = err.message || 'Unknown error';
    let errorHint = 'Không thể đọc dữ liệu từ contract';
    
    if (errorMessage.includes('no data present') || errorMessage.includes('BAD_DATA')) {
      errorHint = 'Contract không tương thích với ABI hoặc chưa được deploy';
    } else if (errorMessage.includes('network')) {
      errorHint = 'Lỗi kết nối mạng. Hãy thử lại sau.';
    }
    
    // Return partial results with error
    return {
      canMint: false,
      issues: [`❌ Lỗi kiểm tra: ${errorMessage.slice(0, 80)}`],
      details: [
        ...details,
        {
          key: 'error',
          label: 'Connection Error',
          labelVi: 'Lỗi kết nối',
          passed: false,
          value: 'Failed',
          hint: errorHint
        }
      ],
      contractAddress
    };
  }
}

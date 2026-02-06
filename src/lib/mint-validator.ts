import { BrowserProvider, Contract } from 'ethers';
import { FUN_MONEY_ADDRESS, FUN_MONEY_ABI, createActionHash } from './web3';

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
}

export async function validateBeforeMint(
  provider: BrowserProvider,
  address: string,
  actionType: string
): Promise<MintValidation> {
  const contract = new Contract(FUN_MONEY_ADDRESS, FUN_MONEY_ABI, provider);
  const actionHash = createActionHash(actionType);
  
  const issues: string[] = [];
  const details: ValidationDetail[] = [];

  try {
    // 1. Check if contract is paused
    const isPaused = await contract.paused();
    details.push({
      key: 'paused',
      label: 'Contract Active',
      labelVi: 'Contract đang hoạt động',
      passed: !isPaused,
      value: isPaused ? 'Paused' : 'Active',
      hint: isPaused ? 'Contract đang tạm dừng, không thể mint' : undefined
    });
    if (isPaused) {
      issues.push('❌ Contract đang bị PAUSE, không thể mint');
    }

    // 2. Check if wallet is attester
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

    // 3. Check threshold
    const threshold = await contract.threshold();
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

    // 4. Check if action is registered
    let actionExists = false;
    try {
      const actionInfo = await contract.getActionInfo(actionHash);
      actionExists = actionInfo[0] === true || actionInfo.exists === true;
    } catch {
      // Function might not exist or return differently
      actionExists = false;
    }
    details.push({
      key: 'action',
      label: 'Action Registered',
      labelVi: 'Action đã đăng ký',
      passed: actionExists,
      value: actionExists ? actionType : 'Not Found',
      hint: !actionExists ? `Action "${actionType}" chưa được đăng ký trên contract` : undefined
    });
    if (!actionExists) {
      issues.push(`❌ Action "${actionType}" chưa được đăng ký`);
    }

    // 5. Check epoch cap
    const epochMinted = await contract.epochMinted();
    const epochCap = await contract.epochCap();
    const remaining = epochCap - epochMinted;
    const epochOk = remaining > 0n;
    const mintedM = (Number(epochMinted) / 1e18 / 1e6).toFixed(2);
    const capM = (Number(epochCap) / 1e18 / 1e6).toFixed(2);
    details.push({
      key: 'epoch',
      label: 'Epoch Cap',
      labelVi: 'Giới hạn Epoch',
      passed: epochOk,
      value: `${mintedM}M / ${capM}M FUN`,
      hint: !epochOk ? 'Đã đạt giới hạn mint trong epoch này' : undefined
    });
    if (!epochOk) {
      issues.push('❌ Đã đạt giới hạn mint epoch (5M FUN/ngày)');
    }

    return {
      canMint: issues.length === 0,
      issues,
      details
    };

  } catch (err: any) {
    console.error('Validation error:', err);
    
    // Return partial results with error
    return {
      canMint: false,
      issues: [`❌ Lỗi kiểm tra: ${err.message?.slice(0, 50) || 'Unknown error'}`],
      details: [
        {
          key: 'error',
          label: 'Connection Error',
          labelVi: 'Lỗi kết nối',
          passed: false,
          value: 'Failed',
          hint: 'Không thể đọc dữ liệu từ contract'
        }
      ]
    };
  }
}

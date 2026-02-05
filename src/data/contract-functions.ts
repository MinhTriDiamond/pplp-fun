export interface ContractFunction {
  name: string;
  selector: string;
  type: 'read' | 'write';
  category: 'token' | 'lifecycle' | 'governance' | 'system';
  description: string;
  descriptionVi: string;
  parameters?: {
    name: string;
    type: string;
    description: string;
  }[];
  returns?: {
    name: string;
    type: string;
    description: string;
  }[];
  example?: string;
  note?: string;
}

export const CONTRACT_ADDRESS = "0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2";
export const BSCSCAN_URL = `https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}#code`;

export const readFunctions: ContractFunction[] = [
  {
    name: "MAX_SIGS",
    selector: "0x3a4e2f42",
    type: "read",
    category: "system",
    description: "Maximum number of signatures supported in multisig",
    descriptionVi: "Số lượng chữ ký tối đa được hỗ trợ trong hệ thống multisig (hằng số bất biến = 5)",
    returns: [{ name: "maxSigs", type: "uint256", description: "Giá trị cố định = 5" }],
    example: "const maxSigs = await contract.MAX_SIGS(); // Returns: 5",
    note: "Đây là hằng số, không thể thay đổi"
  },
  {
    name: "PPLP_TYPEHASH",
    selector: "0x8b2c636a",
    type: "read",
    category: "system",
    description: "EIP-712 type hash for PPLP structure",
    descriptionVi: "Hash EIP-712 dùng để xác thực chữ ký off-chain của Attesters. Đảm bảo tính toàn vẹn của dữ liệu PPLP khi ký.",
    returns: [{ name: "typeHash", type: "bytes32", description: "Hash của cấu trúc PPLP theo chuẩn EIP-712" }],
    example: "const typeHash = await contract.PPLP_TYPEHASH();",
    note: "Dùng trong quá trình verify chữ ký Attester"
  },
  {
    name: "actions",
    selector: "0xd281b382",
    type: "read",
    category: "system",
    description: "Look up registered action by keccak256 hash",
    descriptionVi: "Tra cứu thông tin action type đã đăng ký. Mỗi action có version riêng và trạng thái deprecated.",
    parameters: [{ name: "actionHash", type: "bytes32", description: "keccak256 hash của tên action" }],
    returns: [
      { name: "version", type: "uint256", description: "Phiên bản của action" },
      { name: "deprecated", type: "bool", description: "true nếu action đã bị vô hiệu hóa" }
    ],
    example: `const actionHash = ethers.keccak256(ethers.toUtf8Bytes("HELP_COMMUNITY"));
const action = await contract.actions(actionHash);`,
    note: "Chỉ các action được đăng ký mới có thể dùng để mint FUN"
  },
  {
    name: "alloc",
    selector: "0x1c4b774b",
    type: "read",
    category: "lifecycle",
    description: "View token allocation for an address",
    descriptionVi: "Xem chi tiết phân bổ token của một địa chỉ: bao nhiêu đang Locked (mới mint), bao nhiêu đã Activated (sẵn sàng claim).",
    parameters: [{ name: "account", type: "address", description: "Địa chỉ ví cần tra cứu" }],
    returns: [
      { name: "locked", type: "uint256", description: "Số token đang ở trạng thái LOCKED" },
      { name: "activated", type: "uint256", description: "Số token đang ở trạng thái ACTIVATED" }
    ],
    example: "const allocation = await contract.alloc('0x1234...');",
    note: "Locked + Activated + balanceOf = Tổng token sở hữu"
  },
  {
    name: "attesterThreshold",
    selector: "0x7dc0d1d0",
    type: "read",
    category: "governance",
    description: "Minimum number of attester signatures required to mint",
    descriptionVi: "Số chữ ký Attester tối thiểu cần để thực hiện mint. Ví dụ: nếu = 2, cần ít nhất 2 Attesters cùng ký duyệt.",
    returns: [{ name: "threshold", type: "uint256", description: "Số chữ ký tối thiểu" }],
    example: "const threshold = await contract.attesterThreshold(); // Returns: 1-5",
    note: "Có thể thay đổi bởi Guardian Governance"
  },
  {
    name: "balanceOf",
    selector: "0x70a08231",
    type: "read",
    category: "token",
    description: "Get freely transferable token balance",
    descriptionVi: "Số FUN có thể chuyển tự do. Đây là số dư thực sự sau khi đã CLAIM - token ở trạng thái FLOWING.",
    parameters: [{ name: "account", type: "address", description: "Địa chỉ ví cần tra cứu" }],
    returns: [{ name: "balance", type: "uint256", description: "Số dư token (đơn vị atomic, chia 10^18 để ra FUN)" }],
    example: "const balance = await contract.balanceOf('0x1234...');",
    note: "Chuẩn ERC-20. Đơn vị atomic (wei), cần chia cho 10^18"
  },
  {
    name: "communityPool",
    selector: "0x669f5a51",
    type: "read",
    category: "system",
    description: "Address of the Community Pool",
    descriptionVi: "Địa chỉ ví Community Pool - nơi nhận 99% token khi mint và token thu hồi từ tài khoản không hoạt động.",
    returns: [{ name: "pool", type: "address", description: "Địa chỉ Community Pool" }],
    example: "const pool = await contract.communityPool();",
    note: "99% token mint vào đây, 1% cho người thực hiện action"
  },
  {
    name: "decimals",
    selector: "0x313ce567",
    type: "read",
    category: "token",
    description: "Number of decimal places",
    descriptionVi: "Số thập phân của token = 18. Nghĩa là 1 FUN = 10^18 atomic units (tương tự ETH và wei).",
    returns: [{ name: "decimals", type: "uint8", description: "Số thập phân = 18" }],
    example: "const decimals = await contract.decimals(); // Returns: 18",
    note: "Chuẩn ERC-20. 1 FUN = 1,000,000,000,000,000,000 atomic"
  },
  {
    name: "epochDuration",
    selector: "0x4ff0876a",
    type: "read",
    category: "system",
    description: "Duration of each epoch in seconds",
    descriptionVi: "Thời gian mỗi epoch tính bằng giây. Mặc định 86400 giây = 1 ngày. Epoch dùng để kiểm soát tốc độ mint.",
    returns: [{ name: "duration", type: "uint256", description: "Độ dài epoch (giây)" }],
    example: "const duration = await contract.epochDuration(); // Returns: 86400",
    note: "1 ngày = 86,400 giây"
  },
  {
    name: "epochMintCap",
    selector: "0x8c65c81f",
    type: "read",
    category: "system",
    description: "Maximum tokens that can be minted per epoch",
    descriptionVi: "Giới hạn mint tối đa mỗi epoch để kiểm soát lạm phát. Nếu vượt quá, giao dịch mint sẽ bị revert.",
    returns: [{ name: "cap", type: "uint256", description: "Giới hạn mint (atomic units)" }],
    example: "const cap = await contract.epochMintCap();",
    note: "Có thể điều chỉnh bởi Governance để kiểm soát cung"
  },
  {
    name: "epochs",
    selector: "0xc240a6b8",
    type: "read",
    category: "system",
    description: "Get epoch information by ID",
    descriptionVi: "Thông tin chi tiết của epoch theo ID: thời gian bắt đầu, tổng số đã mint trong epoch, số lượng actions.",
    parameters: [{ name: "epochId", type: "uint256", description: "ID của epoch (0, 1, 2, ...)" }],
    returns: [
      { name: "startTime", type: "uint256", description: "Timestamp bắt đầu epoch" },
      { name: "totalMinted", type: "uint256", description: "Tổng token đã mint trong epoch" },
      { name: "actionCount", type: "uint256", description: "Số lượng actions đã thực hiện" }
    ],
    example: "const epoch = await contract.epochs(0);",
    note: "Epoch 0 là epoch đầu tiên khi deploy contract"
  },
  {
    name: "guardianGov",
    selector: "0x9f9962dd",
    type: "read",
    category: "governance",
    description: "Address with governance privileges",
    descriptionVi: "Địa chỉ có quyền quản trị cao nhất (Guardian Governance). Có thể thay đổi Attesters, pause hệ thống, đăng ký actions.",
    returns: [{ name: "guardian", type: "address", description: "Địa chỉ Guardian Governance" }],
    example: "const gov = await contract.guardianGov();",
    note: "Đây là Multisig 5/9 của cộng đồng"
  },
  {
    name: "isAttester",
    selector: "0x9c10e5c0",
    type: "read",
    category: "governance",
    description: "Check if address is an authorized Attester",
    descriptionVi: "Kiểm tra một địa chỉ có phải Attester được ủy quyền không. Chỉ Attester mới có thể ký duyệt PPLP.",
    parameters: [{ name: "account", type: "address", description: "Địa chỉ cần kiểm tra" }],
    returns: [{ name: "isValid", type: "bool", description: "true nếu là Attester hợp lệ" }],
    example: "const isAttester = await contract.isAttester('0x1234...');",
    note: "Angel AI (0x02D5...) là Attester chính thức"
  },
  {
    name: "name",
    selector: "0x06fdde03",
    type: "read",
    category: "token",
    description: "Token name",
    descriptionVi: "Tên đầy đủ của token: \"FUN Money\" - đồng tiền của Nền Kinh Tế Ánh Sáng.",
    returns: [{ name: "name", type: "string", description: "Tên token" }],
    example: 'const name = await contract.name(); // Returns: "FUN Money"',
    note: "Chuẩn ERC-20"
  },
  {
    name: "nonces",
    selector: "0x7ecebe00",
    type: "read",
    category: "system",
    description: "Current nonce for an address",
    descriptionVi: "Nonce hiện tại của mỗi địa chỉ, tự động tăng sau mỗi lần mint để chống replay attack (dùng lại chữ ký cũ).",
    parameters: [{ name: "account", type: "address", description: "Địa chỉ cần tra cứu" }],
    returns: [{ name: "nonce", type: "uint256", description: "Nonce hiện tại" }],
    example: "const nonce = await contract.nonces('0x1234...');",
    note: "Mỗi lần lockWithPPLP thành công, nonce +1"
  },
  {
    name: "pauseTransitions",
    selector: "0x8456cb59",
    type: "read",
    category: "governance",
    description: "Check if system is paused",
    descriptionVi: "Nếu = true, hệ thống đang tạm dừng mọi thao tác activate/claim. Dùng trong trường hợp khẩn cấp.",
    returns: [{ name: "isPaused", type: "bool", description: "true nếu đang pause" }],
    example: "const isPaused = await contract.pauseTransitions();",
    note: "Chỉ Guardian Gov có thể pause/unpause"
  },
  {
    name: "symbol",
    selector: "0x95d89b41",
    type: "read",
    category: "token",
    description: "Token symbol",
    descriptionVi: "Ký hiệu token: \"FUN\" - viết tắt của FUN Money.",
    returns: [{ name: "symbol", type: "string", description: "Ký hiệu token" }],
    example: 'const symbol = await contract.symbol(); // Returns: "FUN"',
    note: "Chuẩn ERC-20"
  },
  {
    name: "totalActivated",
    selector: "0x6f307dc3",
    type: "read",
    category: "lifecycle",
    description: "Total tokens in ACTIVATED state",
    descriptionVi: "Tổng số FUN đang ở trạng thái Activated toàn hệ thống - đã qua bước 2, sẵn sàng claim vào ví.",
    returns: [{ name: "total", type: "uint256", description: "Tổng số activated (atomic)" }],
    example: "const totalActivated = await contract.totalActivated();",
    note: "Đây là token chờ người dùng claim"
  },
  {
    name: "totalLocked",
    selector: "0x56891412",
    type: "read",
    category: "lifecycle",
    description: "Total tokens in LOCKED state",
    descriptionVi: "Tổng số FUN đang ở trạng thái Locked toàn hệ thống - mới mint, chưa activate.",
    returns: [{ name: "total", type: "uint256", description: "Tổng số locked (atomic)" }],
    example: "const totalLocked = await contract.totalLocked();",
    note: "Đây là token mới mint, chờ activate"
  },
  {
    name: "totalSupply",
    selector: "0x18160ddd",
    type: "read",
    category: "token",
    description: "Total token supply",
    descriptionVi: "Tổng cung FUN đã được mint (bao gồm cả locked, activated, và flowing). Không có pre-mine, không burn.",
    returns: [{ name: "supply", type: "uint256", description: "Tổng cung (atomic)" }],
    example: "const supply = await contract.totalSupply();",
    note: "Chuẩn ERC-20. Tổng cung = Locked + Activated + Flowing"
  }
];

export const writeFunctions: ContractFunction[] = [
  {
    name: "activate",
    selector: "0xb260c42a",
    type: "write",
    category: "lifecycle",
    description: "Move tokens from LOCKED to ACTIVATED state",
    descriptionVi: "Chuyển token từ LOCKED sang ACTIVATED. Đây là bước 2 trong quy trình sở hữu FUN. Sau khi activate, token sẵn sàng để claim.",
    parameters: [{ name: "amount", type: "uint256", description: "Số lượng token muốn activate (atomic units)" }],
    example: `const amount = ethers.parseEther("100"); // 100 FUN
await contract.activate(amount);`,
    note: "Chỉ có thể activate token đang ở trạng thái LOCKED của chính mình"
  },
  {
    name: "approve",
    selector: "0x095ea7b3",
    type: "write",
    category: "token",
    description: "Approve another address to spend your tokens",
    descriptionVi: "Cho phép địa chỉ khác chi tiêu một lượng FUN nhất định từ ví của bạn. Thường dùng cho DEX, staking contracts.",
    parameters: [
      { name: "spender", type: "address", description: "Địa chỉ được phép chi tiêu" },
      { name: "amount", type: "uint256", description: "Số lượng tối đa được chi tiêu" }
    ],
    example: `const spender = "0x1234...";
const amount = ethers.parseEther("1000");
await contract.approve(spender, amount);`,
    note: "Chuẩn ERC-20. Đặt amount = 0 để hủy approval"
  },
  {
    name: "claim",
    selector: "0x379607f5",
    type: "write",
    category: "lifecycle",
    description: "Withdraw ACTIVATED tokens to personal wallet",
    descriptionVi: "Rút token ACTIVATED vào số dư chính (balanceOf). Đây là bước 3 - token giờ có thể chuyển tự do ở trạng thái FLOWING.",
    parameters: [{ name: "amount", type: "uint256", description: "Số lượng token muốn claim (atomic units)" }],
    example: `const amount = ethers.parseEther("50"); // 50 FUN
await contract.claim(amount);`,
    note: "Sau khi claim, token xuất hiện trong balanceOf và có thể transfer"
  },
  {
    name: "govDeprecateAction",
    selector: "0x3b3b57de",
    type: "write",
    category: "governance",
    description: "Deprecate an action type (governance only)",
    descriptionVi: "Vô hiệu hóa một loại action, không cho mint với action đó nữa. Dùng khi cần loại bỏ action bị lạm dụng.",
    parameters: [{ name: "actionName", type: "string", description: "Tên action cần vô hiệu hóa" }],
    example: 'await contract.govDeprecateAction("FAKE_ACTION");',
    note: "⚠️ Chỉ Guardian Governance. Không thể hoàn tác!"
  },
  {
    name: "govPauseTransitions",
    selector: "0x5c975abb",
    type: "write",
    category: "governance",
    description: "Pause or unpause the system (governance only)",
    descriptionVi: "Tạm dừng (true) hoặc mở lại (false) toàn bộ hệ thống trong trường hợp khẩn cấp. Khi pause, không ai có thể activate/claim.",
    parameters: [{ name: "paused", type: "bool", description: "true = pause, false = unpause" }],
    example: "await contract.govPauseTransitions(true); // Emergency pause",
    note: "⚠️ Chỉ Guardian Governance. Dùng trong trường hợp khẩn cấp"
  },
  {
    name: "govRecycleExcessToCommunity",
    selector: "0x8da5cb5b",
    type: "write",
    category: "governance",
    description: "Recycle excess tokens to Community Pool (governance only)",
    descriptionVi: "Thu hồi token dư thừa (từ tài khoản không hoạt động 30+ ngày) về Community Pool. Đảm bảo dòng chảy liên tục.",
    parameters: [{ name: "amount", type: "uint256", description: "Số lượng token cần thu hồi" }],
    example: "await contract.govRecycleExcessToCommunity(ethers.parseEther('1000'));",
    note: "⚠️ Chỉ Guardian Governance. Tuân thủ Luật Anti-hoarding 30 ngày"
  },
  {
    name: "govRegisterAction",
    selector: "0xa87430ba",
    type: "write",
    category: "governance",
    description: "Register a new action type (governance only)",
    descriptionVi: "Đăng ký loại action mới để có thể mint FUN. Mỗi action có version để theo dõi thay đổi.",
    parameters: [
      { name: "actionName", type: "string", description: "Tên action (VD: HELP_COMMUNITY, TEACH_SKILL)" },
      { name: "version", type: "uint256", description: "Phiên bản của action (bắt đầu từ 1)" }
    ],
    example: 'await contract.govRegisterAction("VOLUNTEER_TEACHING", 1);',
    note: "⚠️ Chỉ Guardian Governance. Action phải được cộng đồng phê duyệt"
  },
  {
    name: "govSetAttester",
    selector: "0x4b0bddd2",
    type: "write",
    category: "governance",
    description: "Add or remove an Attester (governance only)",
    descriptionVi: "Thêm (true) hoặc xóa (false) một địa chỉ khỏi danh sách Attester. Attester có quyền ký duyệt PPLP để mint FUN.",
    parameters: [
      { name: "attester", type: "address", description: "Địa chỉ Attester" },
      { name: "status", type: "bool", description: "true = thêm, false = xóa" }
    ],
    example: 'await contract.govSetAttester("0x02D5578173bd0DB25462BB32A254Cd4b2E6D9a0D", true);',
    note: "⚠️ Chỉ Guardian Governance. Cẩn thận khi thêm Attester mới"
  },
  {
    name: "govSetAttesterThreshold",
    selector: "0x7adbf973",
    type: "write",
    category: "governance",
    description: "Set minimum signatures required (governance only)",
    descriptionVi: "Thay đổi số chữ ký tối thiểu cần để mint. Tăng threshold = tăng bảo mật, giảm = tăng tốc độ.",
    parameters: [{ name: "threshold", type: "uint256", description: "Số chữ ký mới (1-5)" }],
    example: "await contract.govSetAttesterThreshold(2);",
    note: "⚠️ Chỉ Guardian Governance. Giới hạn 1-5 (MAX_SIGS)"
  },
  {
    name: "lockWithPPLP",
    selector: "0xf6326fb3",
    type: "write",
    category: "lifecycle",
    description: "Mint new tokens with PPLP attestation",
    descriptionVi: "Function chính để mint FUN mới. Cần chữ ký EIP-712 từ Attester xác nhận \"Hành động Ánh sáng\". Token mint vào trạng thái LOCKED.",
    parameters: [
      { name: "recipient", type: "address", description: "Địa chỉ nhận token (1%)" },
      { name: "amount", type: "uint256", description: "Tổng số token mint" },
      { name: "actionHash", type: "bytes32", description: "Hash của loại action" },
      { name: "nonce", type: "uint256", description: "Nonce hiện tại của recipient" },
      { name: "deadline", type: "uint256", description: "Thời hạn chữ ký (timestamp)" },
      { name: "signatures", type: "bytes[]", description: "Mảng chữ ký từ Attesters" }
    ],
    example: `const params = {
  recipient: "0x1234...",
  amount: ethers.parseEther("100"),
  actionHash: ethers.keccak256(ethers.toUtf8Bytes("HELP_COMMUNITY")),
  nonce: await contract.nonces(recipient),
  deadline: Math.floor(Date.now()/1000) + 3600, // 1 hour
  signatures: [attesterSignature]
};
await contract.lockWithPPLP(...Object.values(params));`,
    note: "99% token vào Community Pool, 1% vào recipient ở trạng thái LOCKED"
  },
  {
    name: "transfer",
    selector: "0xa9059cbb",
    type: "write",
    category: "token",
    description: "Transfer tokens to another address",
    descriptionVi: "Chuyển FUN từ ví bạn sang địa chỉ khác. Chỉ áp dụng cho token FLOWING (đã claim vào balanceOf).",
    parameters: [
      { name: "to", type: "address", description: "Địa chỉ nhận" },
      { name: "amount", type: "uint256", description: "Số lượng chuyển (atomic units)" }
    ],
    example: `await contract.transfer("0x5678...", ethers.parseEther("10"));`,
    note: "Chuẩn ERC-20. Chỉ chuyển được token đã CLAIM"
  },
  {
    name: "transferFrom",
    selector: "0x23b872dd",
    type: "write",
    category: "token",
    description: "Transfer tokens on behalf of another address",
    descriptionVi: "Chuyển FUN thay mặt người khác (cần approve trước). Thường dùng bởi DEX hoặc smart contracts.",
    parameters: [
      { name: "from", type: "address", description: "Địa chỉ nguồn" },
      { name: "to", type: "address", description: "Địa chỉ đích" },
      { name: "amount", type: "uint256", description: "Số lượng chuyển" }
    ],
    example: `await contract.transferFrom("0x1234...", "0x5678...", ethers.parseEther("10"));`,
    note: "Chuẩn ERC-20. Yêu cầu allowance từ 'from' cho msg.sender"
  }
];

export const allFunctions = [...readFunctions, ...writeFunctions];

export const categoryLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  token: { label: "Token (ERC-20)", color: "text-cyan-600", bgColor: "bg-cyan-100" },
  lifecycle: { label: "Token Lifecycle", color: "text-violet-600", bgColor: "bg-violet-100" },
  governance: { label: "Governance", color: "text-pink-600", bgColor: "bg-pink-100" },
  system: { label: "System", color: "text-green-600", bgColor: "bg-green-100" }
};

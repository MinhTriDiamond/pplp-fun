// PPLP Documentation Data
// Unified knowledge from all provided documents

export const DOCS_STATS = {
  platforms: 16,
  actions: 60,
  pillars: 5,
  dailyCap: "5M FUN",
  epochDuration: "24h",
  contractVersion: "v1.3.0",
  policyVersion: "v1.0.2"
};

export const PILLARS_DATA = [
  {
    id: "S",
    name: "Service",
    nameVi: "Phụng Sự",
    description: "Hành động có lợi ích vượt khỏi cái tôi",
    weight: 0.25,
    weightPercent: "25%",
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    borderColor: "border-pink-400"
  },
  {
    id: "T",
    name: "Truth",
    nameVi: "Chân Thật",
    description: "Có bằng chứng, có kiểm chứng",
    weight: 0.20,
    weightPercent: "20%",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100",
    borderColor: "border-cyan-400"
  },
  {
    id: "H",
    name: "Healing",
    nameVi: "Chữa Lành",
    description: "Tăng hạnh phúc, giảm khổ đau",
    weight: 0.20,
    weightPercent: "20%",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-400"
  },
  {
    id: "C",
    name: "Contribution",
    nameVi: "Đóng Góp",
    description: "Tạo giá trị dài hạn cho cộng đồng",
    weight: 0.20,
    weightPercent: "20%",
    color: "text-green-500",
    bgColor: "bg-green-100",
    borderColor: "border-green-400"
  },
  {
    id: "U",
    name: "Unity",
    nameVi: "Hợp Nhất",
    description: "Tăng kết nối, hợp tác, cùng thắng",
    weight: 0.15,
    weightPercent: "15%",
    color: "text-violet-500",
    bgColor: "bg-violet-100",
    borderColor: "border-violet-400"
  }
];

export const MULTIPLIERS_DATA = [
  {
    symbol: "Q",
    name: "Quality",
    nameVi: "Chất Lượng",
    range: "0.5 - 3.0",
    description: "Đánh giá chất lượng của hành động dựa trên các tín hiệu cụ thể"
  },
  {
    symbol: "I",
    name: "Impact",
    nameVi: "Tác Động",
    range: "0.5 - 5.0",
    description: "Đo lường mức độ ảnh hưởng tích cực của hành động"
  },
  {
    symbol: "K",
    name: "Integrity",
    nameVi: "Chính Trực",
    range: "0.0 - 1.0",
    description: "Hệ số chống gian lận, dựa trên Anti-Sybil score và Camly staking"
  },
  {
    symbol: "Ux",
    name: "Unity",
    nameVi: "Hợp Nhất",
    range: "0.5 - 2.5",
    description: "Nhân tố thưởng cho các hành động tăng cường sự hợp nhất"
  }
];

export const UNITY_MULTIPLIER_MAPPING = [
  { minU: 0, maxU: 49, ux: 0.5 },
  { minU: 50, maxU: 69, ux: 1.0 },
  { minU: 70, maxU: 84, ux: 1.5 },
  { minU: 85, maxU: 94, ux: 2.0 },
  { minU: 95, maxU: 100, ux: 2.3 }
];

export const UNITY_SIGNALS = [
  { signal: "collaboration", nameVi: "Hợp tác", weight: 0.4 },
  { signal: "beneficiaryConfirmed", nameVi: "Người thụ hưởng xác nhận", weight: 0.3 },
  { signal: "communityEndorsement", nameVi: "Cộng đồng ủng hộ", weight: 0.2 },
  { signal: "bridgeValue", nameVi: "Giá trị cầu nối", weight: 0.1 },
  { signal: "conflictResolution", nameVi: "Giải quyết xung đột", weight: 0.0 }
];

export const TIER_SYSTEM = [
  { tier: 0, minActions: 0, minLightScore: 0, minK: 0.0, maxUx: 1.0, dailyCap: "5,000 FUN" },
  { tier: 1, minActions: 10, minLightScore: 65, minK: 0.7, maxUx: 1.5, dailyCap: "20,000 FUN" },
  { tier: 2, minActions: 50, minLightScore: 70, minK: 0.75, maxUx: 2.0, dailyCap: "100,000 FUN" },
  { tier: 3, minActions: 200, minLightScore: 75, minK: 0.8, maxUx: 2.5, dailyCap: "250,000 FUN" }
];

export const FRAUD_PENALTIES = [
  { type: "BOT", setK: 0.0, action: "REJECT", banDays: 30, color: "bg-red-100 text-red-700" },
  { type: "SYBIL", setK: 0.0, action: "REJECT", banDays: 60, color: "bg-red-100 text-red-700" },
  { type: "COLLUSION", setK: 0.2, action: "REVIEW", banDays: 14, color: "bg-orange-100 text-orange-700" },
  { type: "SPAM", setK: 0.3, action: "REJECT", banDays: 7, color: "bg-yellow-100 text-yellow-700" },
  { type: "WASH", setK: 0.0, action: "REVIEW", banDays: 30, color: "bg-red-100 text-red-700" }
];

export const ANTI_COLLUSION_RULES = {
  witnessUniqueness: true,
  witnessGraphDistanceMinHops: 2,
  penaltyReduceUxBy: 0.3,
  description: "Mỗi witness phải unique và cách recipient ít nhất 2 hop trong social graph"
};

export const RATE_LIMITS = {
  globalMintsPerSecond: 50,
  perUserMintsPerMinute: 3,
  burstAllowance: 5,
  actionOnLimit: "REJECT_AND_LOG"
};

export const CIRCUIT_BREAKERS = {
  maxMintPerHour: "100,000,000 FUN",
  maxMintPerDay: "500,000,000 FUN",
  actionOnBreak: "PAUSE_AND_ALERT",
  alertChannels: ["SLACK_SECURITY", "ONCALL_ENGINEERING"]
};

export const EMERGENCY_PAUSE = {
  rolesAllowed: ["PAUSER_ROLE", "GOV_COUNCIL_MULTISIG"],
  triggerConditions: ["fraudSpike", "systemAnomaly", "oracleFailure", "governanceVote"],
  cooldownAfterPauseSec: 3600,
  autoResumeAllowed: false
};

export const GOVERNANCE_TIMELOCK = {
  policyUpdateRequires: "MULTISIG_3_OF_5",
  proposalCooldownDays: 7,
  communityVoteThreshold: 0.66,
  emergencyOverride: "FOUNDING_COUNCIL"
};

export const PLATFORM_POOLS = [
  { id: "FUN_ACADEMY", name: "FUN Academy", pool: "1,000,000 FUN", poolRaw: 1000000 },
  { id: "FUN_CHARITY", name: "FUN Charity", pool: "750,000 FUN", poolRaw: 750000 },
  { id: "FUN_EARTH", name: "FUN Earth", pool: "750,000 FUN", poolRaw: 750000 },
  { id: "FUNLIFE", name: "FUNLife", pool: "500,000 FUN", poolRaw: 500000 },
  { id: "FUN_FARM", name: "FUN Farm", pool: "400,000 FUN", poolRaw: 400000 },
  { id: "FUN_PLAY", name: "FUN Play", pool: "400,000 FUN", poolRaw: 400000 },
  { id: "FUN_PROFILE", name: "FUN Profile", pool: "400,000 FUN", poolRaw: 400000 },
  { id: "FUN_MARKET", name: "FUN Market", pool: "200,000 FUN", poolRaw: 200000 },
  { id: "CAMLY_COIN", name: "Camly Coin", pool: "200,000 FUN", poolRaw: 200000 },
  { id: "ANGEL_AI", name: "Angel AI", pool: "150,000 FUN", poolRaw: 150000 },
  { id: "FUN_INVEST", name: "FUN Invest", pool: "150,000 FUN", poolRaw: 150000 },
  { id: "FUN_LEGAL", name: "FUN Legal", pool: "100,000 FUN", poolRaw: 100000 },
  { id: "RESERVE_BUFFER", name: "Reserve Buffer", pool: "100,000 FUN", poolRaw: 100000 },
  { id: "FUN_PLANET", name: "FUN Planet", pool: "50,000 FUN", poolRaw: 50000 },
  { id: "FUN_TRADING", name: "FUN Trading", pool: "50,000 FUN", poolRaw: 50000 },
  { id: "FUN_WALLET", name: "FUN Wallet", pool: "0 FUN", poolRaw: 0 }
];

export const TOKEN_LIFECYCLE = [
  { 
    stage: "LOCKED", 
    nameVi: "Escrow", 
    description: "Token mới mint, đang trong thời gian khóa",
    action: "lockWithPPLP()",
    color: "bg-violet-500"
  },
  { 
    stage: "ACTIVATED", 
    nameVi: "Claimable", 
    description: "Token đã được kích hoạt, sẵn sàng claim",
    action: "activate()",
    color: "bg-cyan-500"
  },
  { 
    stage: "FLOWING", 
    nameVi: "Lưu thông", 
    description: "Token trong ví, có thể chuyển tự do",
    action: "claim()",
    color: "bg-green-500"
  },
  { 
    stage: "RECYCLED", 
    nameVi: "Tái chế", 
    description: "Token không hoạt động được thu hồi về Community Pool",
    action: "recycle()",
    color: "bg-pink-500"
  }
];

export const SETTLEMENT_LANES = [
  { 
    lane: "Fast Lane", 
    condition: "amount < 5,000 FUN",
    processing: "Tự động thông qua",
    sla: "Instant"
  },
  { 
    lane: "Review Lane", 
    condition: "amount ≥ 5,000 FUN",
    processing: "Yêu cầu review",
    sla: "24h"
  },
  { 
    lane: "Auto-approve", 
    condition: "Sau 86,400 giây + đủ điều kiện",
    processing: "Tự động duyệt",
    sla: "24h max"
  }
];

export const API_ENDPOINTS = [
  { method: "POST", path: "/v1/action/submit", description: "Gửi hành động mới" },
  { method: "POST", path: "/v1/mint/request", description: "Yêu cầu mint FUN" },
  { method: "GET", path: "/v1/user/{id}/reputation", description: "Lấy điểm reputation" },
  { method: "POST", path: "/v1/fraud/signals", description: "Báo cáo tín hiệu gian lận" },
  { method: "GET", path: "/v1/epoch/current", description: "Thông tin epoch hiện tại" },
  { method: "GET", path: "/v1/platform/{id}/pool", description: "Trạng thái pool platform" },
  { method: "POST", path: "/v1/attestation/submit", description: "Gửi chứng thực Attester" },
  { method: "GET", path: "/v1/user/{id}/tier", description: "Cấp độ người dùng" },
  { method: "POST", path: "/v1/score/calculate", description: "Tính toán Light Score" },
  { method: "GET", path: "/v1/action/types", description: "Danh sách action types" },
  { method: "POST", path: "/v1/emergency/pause", description: "Kích hoạt emergency pause" },
  { method: "GET", path: "/v1/governance/proposals", description: "Danh sách governance proposals" }
];

export const DATABASE_TABLES = [
  { 
    name: "users", 
    description: "Thông tin người dùng và metadata",
    columns: ["id", "wallet_address", "tier", "created_at", "last_active"]
  },
  { 
    name: "actions", 
    description: "Lịch sử các hành động đã thực hiện",
    columns: ["id", "user_id", "action_type", "platform", "evidence_hash", "created_at"]
  },
  { 
    name: "scores", 
    description: "Điểm S, T, H, C, U cho mỗi action",
    columns: ["id", "action_id", "s_score", "t_score", "h_score", "c_score", "u_score"]
  },
  { 
    name: "mint_requests", 
    description: "Các yêu cầu mint pending và completed",
    columns: ["id", "action_id", "amount", "status", "settlement_lane", "created_at"]
  },
  { 
    name: "attestations", 
    description: "Chữ ký xác thực từ Attesters",
    columns: ["id", "mint_request_id", "attester_address", "signature", "created_at"]
  },
  { 
    name: "epochs", 
    description: "Thông tin từng epoch",
    columns: ["id", "start_time", "total_minted", "action_count"]
  },
  { 
    name: "fraud_signals", 
    description: "Các tín hiệu và báo cáo gian lận",
    columns: ["id", "user_id", "signal_type", "severity", "created_at"]
  },
  { 
    name: "reputation_history", 
    description: "Lịch sử thay đổi reputation",
    columns: ["id", "user_id", "old_score", "new_score", "reason", "created_at"]
  }
];

export const CASCADING_DISTRIBUTION = {
  description: "Mỗi tầng giữ 1% và phân phối 99% cho tầng tiếp theo",
  tiers: [
    { name: "Community Genesis Pool", receive: "100%", keep: "1%", distribute: "99%" },
    { name: "FUN Platform Pool", receive: "99%", keep: "0.99%", distribute: "98.01%" },
    { name: "FUN Partner Pool", receive: "98.01%", keep: "0.98%", distribute: "97.03%" },
    { name: "User", receive: "97.03%", keep: "97.03%", distribute: "-" }
  ]
};

export const QUALITY_SIGNALS = {
  FUN_PLAY: ["retention", "transcriptQuality", "viewDuration"],
  FUN_FARM: ["onTimeRate", "qualityScore", "wasteReduction"],
  FUN_ACADEMY: ["completionRate", "peerReviewScore", "projectQuality"],
  FUN_CHARITY: ["deliveryProof", "impactReport", "beneficiaryConfirm"]
};

export const CONTRACT_INFO = {
  address: "0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2",
  network: "BSC Testnet",
  chainId: 97,
  bscscanUrl: "https://testnet.bscscan.com/address/0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2"
};

export const REPUTATION_DECAY = {
  enabled: true,
  inactivityDays: 30,
  decayPercentPerMonth: 5,
  minFloor: 0.5,
  restoreBy: ["NEW_VERIFIED_ACTIONS", "COMMUNITY_SERVICE"]
};

export const CROSS_PLATFORM_BONUS = {
  enabled: true,
  minPlatforms: 3,
  bonusUx: 0.1,
  maxBonusUx: 0.3,
  note: "Thưởng cho người đóng góp đa nền tảng"
};

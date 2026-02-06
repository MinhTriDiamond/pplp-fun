import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Coins, ArrowRight, Users, Building2, User } from "lucide-react";

interface DistributionRow {
  flow: string;
  flowVi: string;
  receive: string;
  distributeFormula: string;
  distributeResult: string;
  keep: string;
  colorClass: string;
  borderClass: string;
  icon: React.ElementType;
}

// Bảng 1: Flow 3 tầng
const basicFlow: DistributionRow[] = [
  {
    flow: "Community Genesis Pool",
    flowVi: "Pool Khởi Nguồn Cộng Đồng",
    receive: "100%",
    distributeFormula: "100% × 99% =",
    distributeResult: "99%",
    keep: "1%",
    colorClass: "bg-violet-50",
    borderClass: "border-l-4 border-violet-400",
    icon: Coins,
  },
  {
    flow: "FUN Platform Pool",
    flowVi: "Pool Nền Tảng FUN",
    receive: "99%",
    distributeFormula: "99% × 99% =",
    distributeResult: "98,01%",
    keep: "0,99%",
    colorClass: "bg-cyan-50",
    borderClass: "border-l-4 border-cyan-400",
    icon: Building2,
  },
  {
    flow: "FUN Partner Pool",
    flowVi: "Pool Đối Tác FUN",
    receive: "98,01%",
    distributeFormula: "-",
    distributeResult: "-",
    keep: "-",
    colorClass: "bg-green-50",
    borderClass: "border-l-4 border-green-400",
    icon: Users,
  },
];

// Bảng 2: Flow 4 tầng (có User)
const fullFlow: DistributionRow[] = [
  {
    flow: "Community Genesis Pool",
    flowVi: "Pool Khởi Nguồn Cộng Đồng",
    receive: "100,00%",
    distributeFormula: "100% × 99% =",
    distributeResult: "99,00%",
    keep: "1,00%",
    colorClass: "bg-violet-50",
    borderClass: "border-l-4 border-violet-400",
    icon: Coins,
  },
  {
    flow: "FUN Platform Pool",
    flowVi: "Pool Nền Tảng FUN",
    receive: "99,00%",
    distributeFormula: "99% × 99% =",
    distributeResult: "98,01%",
    keep: "0,99%",
    colorClass: "bg-cyan-50",
    borderClass: "border-l-4 border-cyan-400",
    icon: Building2,
  },
  {
    flow: "FUN Partner Pool",
    flowVi: "Pool Đối Tác FUN",
    receive: "98,01%",
    distributeFormula: "98,01% × 99% =",
    distributeResult: "97,03%",
    keep: "0,98%",
    colorClass: "bg-green-50",
    borderClass: "border-l-4 border-green-400",
    icon: Users,
  },
  {
    flow: "User",
    flowVi: "Người Dùng Cuối",
    receive: "97,03%",
    distributeFormula: "N/A",
    distributeResult: "N/A",
    keep: "N/A",
    colorClass: "bg-pink-50",
    borderClass: "border-l-4 border-pink-400",
    icon: User,
  },
];

// Bảng 3: Ví dụ 1.000 FUN
interface ExampleRow {
  flow: string;
  flowVi: string;
  receive: string;
  distributeFormula: string;
  distributeResult: string;
  keep: string;
  colorClass: string;
  borderClass: string;
  icon: React.ElementType;
}

const exampleFlow: ExampleRow[] = [
  {
    flow: "Community Genesis Pool",
    flowVi: "Pool Khởi Nguồn Cộng Đồng",
    receive: "1.000 FUN",
    distributeFormula: "100% × 99% =",
    distributeResult: "990 FUN",
    keep: "10 FUN",
    colorClass: "bg-violet-50",
    borderClass: "border-l-4 border-violet-400",
    icon: Coins,
  },
  {
    flow: "FUN Platform Pool",
    flowVi: "Pool Nền Tảng FUN",
    receive: "990 FUN",
    distributeFormula: "99% × 99% =",
    distributeResult: "980,1 FUN",
    keep: "9,9 FUN",
    colorClass: "bg-cyan-50",
    borderClass: "border-l-4 border-cyan-400",
    icon: Building2,
  },
  {
    flow: "FUN Partner Pool",
    flowVi: "Pool Đối Tác FUN",
    receive: "980,1 FUN",
    distributeFormula: "98,01% × 99% =",
    distributeResult: "970,3 FUN",
    keep: "9,8 FUN",
    colorClass: "bg-green-50",
    borderClass: "border-l-4 border-green-400",
    icon: Users,
  },
  {
    flow: "User",
    flowVi: "Người Dùng Cuối",
    receive: "970,3 FUN",
    distributeFormula: "-",
    distributeResult: "-",
    keep: "-",
    colorClass: "bg-pink-50",
    borderClass: "border-l-4 border-pink-400",
    icon: User,
  },
];

function DistributionTable({ data }: { data: DistributionRow[] | ExampleRow[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">FLOW</TableHead>
            <TableHead className="font-semibold text-center">NHẬN</TableHead>
            <TableHead className="font-semibold text-center">PHÂN PHỐI 99%</TableHead>
            <TableHead className="font-semibold text-center">GIỮ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className={`${row.colorClass} ${row.borderClass}`}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <row.icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold text-foreground">{row.flow}</div>
                    <div className="text-xs text-muted-foreground">{row.flowVi}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                {row.receive}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="text-muted-foreground">{row.distributeFormula}</span>
                  {row.distributeResult !== "-" && row.distributeResult !== "N/A" && (
                    <>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono font-semibold text-primary">{row.distributeResult}</span>
                    </>
                  )}
                  {(row.distributeResult === "-" || row.distributeResult === "N/A") && (
                    <span className="font-mono text-muted-foreground">{row.distributeResult}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center font-mono text-sm font-semibold text-green-600">
                {row.keep}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DistributionFormula() {
  return (
    <section className="py-12 bg-gradient-to-b from-amber-50/50 via-white to-green-50/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="w-8 h-8 text-amber-500" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gradient-rainbow">
              Công Thức Phân Phối FUN Money
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            Cascading 99%
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mỗi tầng trong hệ thống nhận FUN và phân phối 99% cho tầng tiếp theo, giữ lại 1% để vận hành.
          </p>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm">
            💚 ~97% giá trị về tay người đóng góp
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full text-violet-700 text-sm">
            🏛️ Mỗi tầng giữ ~1% để phát triển
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-100 rounded-full text-cyan-700 text-sm">
            ♻️ Dòng chảy liên tục, công bằng
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic" className="text-xs sm:text-sm">
                Flow 3 Tầng
              </TabsTrigger>
              <TabsTrigger value="full" className="text-xs sm:text-sm">
                Flow 4 Tầng
              </TabsTrigger>
              <TabsTrigger value="example" className="text-xs sm:text-sm">
                Ví Dụ 1.000 FUN
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/30">
                <h3 className="font-semibold text-foreground">
                  Mint FUN Money - Flow cơ bản (3 tầng)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Khi không có đối tác, FUN chảy trực tiếp đến Partner Pool
                </p>
              </div>
              <DistributionTable data={basicFlow} />
            </TabsContent>

            <TabsContent value="full" className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/30">
                <h3 className="font-semibold text-foreground">
                  Mint FUN Money - Flow đầy đủ (4 tầng)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Flow hoàn chỉnh với User là người nhận cuối cùng
                </p>
              </div>
              <DistributionTable data={fullFlow} />
            </TabsContent>

            <TabsContent value="example" className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/30">
                <h3 className="font-semibold text-foreground">
                  Ví dụ: MINT 1.000 FUN
                </h3>
                <p className="text-sm text-muted-foreground">
                  User cuối nhận 970,3 FUN (~97%) từ 1.000 FUN ban đầu
                </p>
              </div>
              <DistributionTable data={exampleFlow} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Pool Explanations */}
        <div className="max-w-4xl mx-auto mt-8 grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-violet-600" />
              <h4 className="font-semibold text-violet-700">Community Genesis Pool</h4>
            </div>
            <p className="text-sm text-violet-600">
              Pool khởi nguồn - nhận 100% từ minting ban đầu, phân phối 99% cho hệ thống
            </p>
          </div>
          
          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-cyan-600" />
              <h4 className="font-semibold text-cyan-700">FUN Platform Pool</h4>
            </div>
            <p className="text-sm text-cyan-600">
              Pool của từng nền tảng (VD: FUN Academy, FUN Charity...) - giữ 0,99% để vận hành
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-700">FUN Partner Pool</h4>
            </div>
            <p className="text-sm text-green-600">
              Pool của đối tác kinh doanh trong hệ sinh thái - giữ 0,98% để phát triển
            </p>
          </div>
          
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-pink-600" />
              <h4 className="font-semibold text-pink-700">User</h4>
            </div>
            <p className="text-sm text-pink-600">
              Người dùng cuối thực hiện hành động Ánh Sáng - nhận ~97% giá trị gốc
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

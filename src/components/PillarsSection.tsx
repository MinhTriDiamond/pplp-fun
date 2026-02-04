import { Card, CardContent } from "@/components/ui/card";
import { Heart, Eye, Leaf, Sparkles, Users } from "lucide-react";

const pillars = [
  {
    id: "S",
    name: "Service",
    namevi: "Phụng Sự",
    description: "Hành động có lợi ích vượt khỏi cái tôi",
    weight: "25%",
    icon: Heart,
    color: "text-love",
    bgColor: "bg-love/10",
  },
  {
    id: "T",
    name: "Truth",
    namevi: "Chân Thật",
    description: "Có bằng chứng, có kiểm chứng",
    weight: "20%",
    icon: Eye,
    color: "text-purple",
    bgColor: "bg-purple/10",
  },
  {
    id: "H",
    name: "Healing",
    namevi: "Chữa Lành",
    description: "Tăng hạnh phúc, giảm khổ đau",
    weight: "20%",
    icon: Sparkles,
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
  {
    id: "C",
    name: "Contribution",
    namevi: "Đóng Góp",
    description: "Tạo giá trị dài hạn cho cộng đồng",
    weight: "20%",
    icon: Leaf,
    color: "text-earth",
    bgColor: "bg-earth/10",
  },
  {
    id: "U",
    name: "Unity",
    namevi: "Hợp Nhất",
    description: "Tăng kết nối, hợp tác, cùng thắng",
    weight: "15%",
    icon: Users,
    color: "text-purple",
    bgColor: "bg-purple/10",
  },
];

export function PillarsSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            5 Trụ Cột{" "}
            <span className="bg-gradient-spiritual bg-clip-text text-transparent">
              Ánh Sáng
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Light Score = 0.25×S + 0.20×T + 0.20×H + 0.20×C + 0.15×U
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {pillars.map((pillar) => (
            <Card 
              key={pillar.id} 
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex rounded-full p-4 ${pillar.bgColor} mb-4`}>
                  <pillar.icon className={`h-8 w-8 ${pillar.color}`} />
                </div>
                
                <div className="text-3xl font-bold text-primary mb-1">
                  {pillar.id}
                </div>
                
                <h3 className="font-display text-lg font-semibold mb-1">
                  {pillar.namevi}
                </h3>
                
                <p className="text-xs text-muted-foreground mb-3">
                  {pillar.name}
                </p>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {pillar.description}
                </p>
                
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {pillar.weight}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

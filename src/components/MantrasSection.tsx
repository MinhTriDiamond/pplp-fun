import { DivineMantras } from "@/components/DivineMantras";

export function MantrasSection() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            8{" "}
            <span className="bg-gradient-spiritual bg-clip-text text-transparent">
              Divine Mantras
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Lời nguyện thiêng liêng của Nền Kinh Tế Ánh Sáng
          </p>
        </div>
        
        <DivineMantras />
      </div>
    </section>
  );
}

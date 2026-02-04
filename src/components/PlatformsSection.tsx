import { PlatformCard } from "@/components/PlatformCard";
import { getAllPlatforms } from "@/lib/pplp-engine";

export function PlatformsSection() {
  const platforms = getAllPlatforms();
  
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-spiritual bg-clip-text text-transparent">
              16 Platforms
            </span>
            {" "}Hợp Nhất
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mỗi platform là một cánh cửa để đóng góp Ánh Sáng và nhận FUN Money. 
            Từ học tập đến từ thiện, từ đầu tư đến chữa lành — tất cả được ghi nhận và thưởng xứng đáng.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              id={platform.id}
              name={platform.name}
              description={platform.description}
              actionCount={platform.actionCount}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

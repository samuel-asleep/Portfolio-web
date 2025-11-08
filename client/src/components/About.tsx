import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface AboutProps {
  name?: string;
  bio?: string;
  profileImage?: string;
}

export default function About({ 
  name = "Your Name",
  bio = "I'm a passionate developer and designer with expertise in creating stunning web experiences. With a focus on modern technologies and clean design principles, I bring ideas to life through code and creativity.",
  profileImage
}: AboutProps) {
  return (
    <section id="about" className="py-20 px-6 lg:px-8" data-testid="section-about">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center" data-testid="text-about-heading">
          About Me
        </h2>

        <Card className="p-8 md:p-12 glassmorphism hover-elevate transition-all">
          <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12 items-center">
            <div className="flex justify-center">
              <Avatar className="h-64 w-64 border-4 border-primary/30 glow-effect-sm" data-testid="avatar-profile">
                {profileImage && <AvatarImage src={profileImage} alt={name} />}
                <AvatarFallback className="text-6xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-foreground" data-testid="text-about-name">
                {name}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-about-bio">
                {bio}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

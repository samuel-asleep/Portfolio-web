import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import type { Profile } from "@shared/schema";

export default function Home() {
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['/api/profile'],
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatedBackground />
      <Navigation />
      <main>
        <Hero 
          name={profile?.name}
          title={profile?.title}
          description={profile?.bio}
        />
        <About 
          name={profile?.name}
          bio={profile?.bio}
          profileImage={profile?.profileImage || undefined}
        />
        <Portfolio />
        <Contact 
          info={{
            email: profile?.email,
            phone: profile?.phone,
            location: profile?.location,
            github: profile?.github || undefined,
            linkedin: profile?.linkedin || undefined,
            twitter: profile?.twitter || undefined,
          }}
        />
      </main>
      <footer className="py-8 px-6 text-center border-t border-border">
        <p className="text-sm text-muted-foreground" data-testid="text-footer">
          © {new Date().getFullYear()} Portfolio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

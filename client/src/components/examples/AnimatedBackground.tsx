import AnimatedBackground from "../AnimatedBackground";

export default function AnimatedBackgroundExample() {
  return (
    <div className="relative h-screen w-full">
      <AnimatedBackground />
      <div className="relative z-10 flex items-center justify-center h-full">
        <p className="text-2xl font-bold text-foreground">Animated Background</p>
      </div>
    </div>
  );
}

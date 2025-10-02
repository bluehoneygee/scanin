import HomeDesktop from "@/components/home/HomeDesktop";
import HomeMobile from "@/components/home/HomeMobile";
import OnboardingGuard from "./OnbordingGuard";

export default function Home() {
  return (
    <OnboardingGuard>
      <div className="lg:hidden">
        <HomeMobile />
      </div>
      <div className="hidden lg:block">
        <HomeDesktop />
      </div>
    </OnboardingGuard>
  );
}

import HomeDesktop from "@/components/home/HomeDesktop";
import HomeMobile from "@/components/home/HomeMobile";

export default function Home() {
  return (
    <>
      <div className="lg:hidden">
        <HomeMobile />
      </div>
      <div className="hidden lg:block">
        <HomeDesktop />
      </div>
    </>
  );
}

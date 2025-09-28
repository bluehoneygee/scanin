import DesktopSidebar from "@/components/navigation/DesktopSidebar";
import TabBar from "@/components/navigation/TabBar";

const RootLayout = ({ children, ...props }) => {
  return (
    <main>
      <div className="lg:hidden">
        <div className="min-h-dvh pb-[calc(env(safe-area-inset-bottom)+88px)]">
          {children}
        </div>
        <TabBar />
      </div>

      <div className="hidden lg:grid min-h-dvh grid-cols-[18rem_minmax(0,1fr)]">
        <DesktopSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
};

export default RootLayout;

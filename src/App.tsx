import AppHeader from "@/components/AppHeader";
import HeroSection from "@/HeroSection";

const App = () => {
  return (
    <>
      <AppHeader />
      <div className="mx-auto max-w-6xl">
        <HeroSection />
      </div>
    </>
  );
};

export default App;

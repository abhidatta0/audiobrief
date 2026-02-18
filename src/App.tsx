import AppHeader from "@/components/AppHeader";
import HeroSection from "@/HeroSection";
import { ToastContainer } from "react-fox-toast";

const App = () => {
  return (
    <>
      <AppHeader />
      <div className="mx-auto max-w-6xl">
        <HeroSection />
      </div>
      <ToastContainer />
    </>
  );
};

export default App;

import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/HeroSection";
import { ToastContainer } from "react-fox-toast";

const App = () => {
  return (
    <>
      <AppHeader />
      <div className="mx-auto max-w-6xl">
        <HeroSection />
        <AppFooter />
      </div>
      <ToastContainer />
    </>
  );
};

export default App;

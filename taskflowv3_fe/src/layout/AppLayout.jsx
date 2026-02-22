import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AppLayout = () => {
  return (
    <div className="app bg-gray-100 min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </header>
      <main className="pt-16 pb-20 min-h-screen">
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
};

export default AppLayout;
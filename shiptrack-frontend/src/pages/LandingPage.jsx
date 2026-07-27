// import Navbar from "../components/Navbar";
// import Hero from "../components/Hero";
// import Features from "../components/Features";
// import Footer from "../components/Footer";

// function LandingPage() {
//   return (
//     <>
//       <Navbar />
//       <Hero />
//       <Features />
//       <Footer />
//     </>
//   );
// }

// export default LandingPage;
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import "../styles/LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      <main>
        <Hero />
        <Features />
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
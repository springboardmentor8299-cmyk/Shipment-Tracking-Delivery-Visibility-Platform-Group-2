import "./Landing.css";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";
import FAQ from "../components/landing/FAQ";
import Contact from "../components/landing/Contact";
import Footer from "../components/landing/Footer";

function LandingPage() {
  return (
    <main className="landing-page">
      <Hero />
      <Features />
      <CTA />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}

export default LandingPage;
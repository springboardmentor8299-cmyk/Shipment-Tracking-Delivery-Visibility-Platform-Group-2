import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/home/Hero";
import Features from "../../components/home/Features";
import FAQ from "../../components/home/FAQ";
import Footer from "../../components/layout/Footer";

function Home() {
    return (
        <>
            <Navbar />

            <Hero />

            <Features />

            <FAQ />

            <Footer />
        </>
    );
}

export default Home;
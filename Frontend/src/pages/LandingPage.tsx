import Header from "../components/Header";
import Footer from "../components/Footer";
import Features from "../components/Features";
import Benefits from "../components/Benefits";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import Hero from "../components/Hero";

const LandingPage = () => {
    return (
        <>
        <Header />
        <main>
            <Hero />
            <Features />
            <Benefits />
            <HowItWorks />
            <Testimonials />
        </main>
        <Footer />
        </>
    );
}

export default LandingPage;
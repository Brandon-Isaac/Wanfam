import Header from "../components/LandingPage/Header";
import Footer from "../components/LandingPage/Footer";
import Features from "../components/LandingPage/Features";
import Benefits from "../components/LandingPage/Benefits";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/LandingPage/Testimonials";
import Hero from "../components/LandingPage/Hero";

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
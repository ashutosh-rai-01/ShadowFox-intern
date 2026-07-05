import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ScoreCard from "../components/scorecard";
import NewsCard from "../components/NewsCard";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <div className="hero-wrapper">
        <Hero />
        <ScoreCard />
      </div>

      <NewsCard />

      <Footer />
    </>
  );
}

export default Home;
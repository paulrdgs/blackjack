import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Concept } from "@/components/landing/concept";
import { Features } from "@/components/landing/features";
import { Rules } from "@/components/landing/rules";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Concept />
        <Features />
        <Rules />
      </main>
      <Footer />
    </>
  );
}

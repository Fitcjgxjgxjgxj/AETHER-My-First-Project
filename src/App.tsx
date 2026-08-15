import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { UniverseProvider, useUniverse } from "./context/UniverseContext";
import { FluidCanvas } from "./components/FluidCanvas";
import { VoidFallback } from "./components/VoidFallback";
import { ParticleField } from "./components/ParticleField";
import { PortalPlane } from "./components/PortalPlane";
import { Cursor } from "./components/Cursor";
import { Loader } from "./components/Loader";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Work } from "./pages/Work";
import { ProjectPage } from "./pages/Project";
import { Studio } from "./pages/Studio";
import { Contact } from "./pages/Contact";

function Shell() {
  const { ready, hovered, active } = useUniverse();
  const portalProject = active ?? hovered;
  const portalVisible = !!hovered || !!active;

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="pointer-events-none grain" aria-hidden="true" />
      <VoidFallback />
      <FluidCanvas />
      <ParticleField />
      <PortalPlane project={portalProject} visible={portalVisible && !active} />
      <Loader ready={ready} />
      <Cursor />
      <Nav />
      <main id="main" className="relative min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:id" element={<ProjectPage />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UniverseProvider>
        <Shell />
      </UniverseProvider>
    </BrowserRouter>
  );
}

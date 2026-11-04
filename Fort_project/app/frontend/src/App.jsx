import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Compass,
  Landmark,
  Menu,
  MessageCircle,
  Moon,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import ChatWorkspace from "./components/ChatWorkspace.jsx";

const featuredForts = [
  {
    name: "Sinhagad Fort",
    district: "Pune district",
    image: "/images/sinhagad-fort.jpg",
    imageAlt: "Sinhagad Fort rising above the green Sahyadri hills",
    note: "The hill fort above the clouds",
    credit: "SasmitV · CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Sinhagad_2010.JPG",
  },
  {
    name: "Raigad Fort",
    district: "Raigad district",
    image: "/images/raigad-fort.jpg",
    imageAlt: "Stone ramparts and fortification walls at Raigad Fort",
    note: "A stronghold in the Sahyadri range",
    credit: "Gbaadkar · CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Raigad_Fort-Rigad.JPG",
  },
  {
    name: "Torna Fort",
    district: "Pune district",
    image: "/images/torna-entrance.jpg",
    imageAlt: "Historic stone entrance and ramparts of Torna Fort",
    note: "Explore a storied mountain gateway",
    credit: "Amogh Sarpotdar · CC BY-SA",
    source: "https://commons.wikimedia.org/wiki/File:Torna_entrance.jpg",
  },
];

const features = [
  {
    icon: ScanSearch,
    title: "Visual recognition",
    description: "Identify gateway structures from your photos.",
    label: "Try the model",
    action: "analysis",
  },
  {
    icon: BookOpen,
    title: "Historical research",
    description: "Explore the stories behind Maharashtra's forts.",
    label: "Discover",
    action: "about",
  },
  {
    icon: ShieldCheck,
    title: "Evidence first",
    description: "Learn to explore heritage with trusted sources.",
    label: "Our approach",
    action: "about",
  },
  {
    icon: MessageCircle,
    title: "Ask questions",
    description: "A dedicated history assistant is coming soon.",
    label: "About the project",
    action: "about",
  },
];

export default function App() {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [initialFort, setInitialFort] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

  function openAnalysis(fortName = "") {
    setInitialFort(fortName);
    setIsAnalysisOpen(true);
  }

  function goTo(section) {
    setIsMenuOpen(false);
    if (section === "analysis") {
      openAnalysis();
      return;
    }
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className={isLight ? "site-shell light-theme" : "site-shell"}>
      <header className="topbar">
        <a aria-label="Fort Guide home" className="brand" href="#home">
          <span className="brand-mark"><Landmark size={26} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>Fort Guide</strong>
            <small>AI heritage explorer</small>
          </span>
        </a>
        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav aria-label="Main navigation" className={isMenuOpen ? "main-nav is-open" : "main-nav"}>
          <a className="nav-link active" href="#home" onClick={() => setIsMenuOpen(false)}>
            <Compass size={15} /> Home
          </a>
          <button className="nav-link" onClick={() => goTo("analysis")}><ScanSearch size={15} /> Explore</button>
          <a className="nav-link" href="#about" onClick={() => setIsMenuOpen(false)}><Landmark size={15} /> About</a>
          <a className="nav-link" href="#how-to" onClick={() => setIsMenuOpen(false)}><MapPin size={15} /> How to use</a>
          <a className="nav-link" href="#forts" onClick={() => setIsMenuOpen(false)}><MapPin size={15} /> Forts</a>
        </nav>
        <div className="topbar-actions">
          <button
            aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
            className="theme-toggle"
            onClick={() => setIsLight((light) => !light)}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="button button-gold button-small" onClick={() => openAnalysis()}>
            Start exploring <ArrowUpRight size={15} />
          </button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> DISCOVER · IDENTIFY · LEARN</span>
          <h1>Every fort has<br />a story worth <span>finding.</span></h1>
          <p className="hero-copy">
            Explore Maharashtra's living heritage. Begin with a photograph, discover its
            architecture, and follow the stories that shaped it.
          </p>
          <div className="hero-actions">
            <button className="button button-gold" onClick={() => openAnalysis()}>
              <Camera size={17} /> Start an analysis <ArrowRight size={17} />
            </button>
            <a className="button button-quiet" href="#about">
              Our story <ArrowDown size={16} />
            </a>
          </div>
        </div>
        <div className="hero-caption">
          <span className="caption-line" />
          <span>SINHAGAD · PUNE DISTRICT</span>
          <span className="caption-coordinate">WESTERN GHATS · MAHARASHTRA</span>
        </div>
        <div className="hero-index"><span>01</span> / 03</div>
      </section>

      <section aria-label="Explore Fort Guide features" className="feature-strip" id="highlights">
        {features.map(({ icon: Icon, title, description, label, action }, index) => (
          <button className="feature-card" key={title} onClick={() => goTo(action)}>
            <span className="feature-number">0{index + 1}</span>
            <span className="feature-icon"><Icon size={20} strokeWidth={1.7} /></span>
            <span className="feature-copy">
              <strong>{title}</strong>
              <span>{description}</span>
            </span>
            <span aria-label={label} className="feature-arrow"><ArrowUpRight size={17} /></span>
          </button>
        ))}
      </section>

      <section aria-labelledby="featured-forts-title" className="featured-section" id="forts">
        <div className="featured-heading">
          <div>
            <span className="eyebrow section-kicker"><span className="kicker-dash" /> NOTES FROM THE SAHYADRIS</span>
            <h2 id="featured-forts-title">A landscape of living history.</h2>
          </div>
          <p>Get to know a few of Maharashtra's hill forts before you begin.</p>
        </div>
        <div className="fort-card-grid">
          {featuredForts.map((fort, index) => (
            <article className="fort-card" key={fort.name}>
              <div className="fort-card-image">
                <img alt={fort.imageAlt} loading="lazy" src={fort.image} />
                <span className="fort-card-index">FIELD NOTE · 0{index + 1}</span>
                <span className="fort-card-district"><MapPin size={12} /> {fort.district}</span>
              </div>
              <div className="fort-card-content">
                <span className="fort-card-note">{fort.note}</span>
                <h3>{fort.name}</h3>
                <button className="fort-card-link" onClick={() => openAnalysis(fort.name)}>
                  Explore this fort <ArrowUpRight size={15} />
                </button>
                <a className="fort-photo-credit" href={fort.source} rel="noreferrer" target="_blank">
                  Photo: {fort.credit}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-to-title" className="how-to-section" id="how-to">
        <div className="how-to-heading">
          <span className="eyebrow section-kicker"><span className="kicker-dash" /> YOUR FIRST DISCOVERY</span>
          <h2 id="how-to-title">How to use Fort Guide</h2>
          <p>Three simple steps to explore a gateway with the visual recognition model.</p>
        </div>
        <div className="how-to-steps">
          <article className="how-to-step">
            <span className="step-number">01</span>
            <span className="step-icon"><Landmark size={20} /></span>
            <h3>Choose your fort</h3>
            <p>Select the fort and location so they stay with your analysis.</p>
          </article>
          <article className="how-to-step">
            <span className="step-number">02</span>
            <span className="step-icon"><Camera size={20} /></span>
            <h3>Share a photo</h3>
            <p>Upload a clear image of a gateway, up to 10 MB in size.</p>
          </article>
          <article className="how-to-step">
            <span className="step-number">03</span>
            <span className="step-icon"><MessageCircle size={20} /></span>
            <h3>Ask and explore</h3>
            <p>Send your question and review the model's highlighted detections.</p>
          </article>
        </div>
        <div className="how-to-note">
          <ShieldCheck size={16} />
          The current AI model detects gateways in photos; historical chat answers are not enabled yet.
        </div>
        <button className="button button-gold how-to-cta" onClick={() => openAnalysis()}>
          Try it with a photo <ArrowRight size={16} />
        </button>
      </section>

      <section className="story-section" id="about">
        <div className="story-image-wrap">
          <div className="story-image" role="img" aria-label="Torna Fort's stone ramparts and entrance" />
          <div className="image-label"><span>FIELD NOTES · TORNA</span><strong>01 — The gateway</strong></div>
          <span className="image-stamp"><Landmark size={19} /><span>DECCAN<br />HERITAGE</span></span>
        </div>
        <div className="story-copy" id="journey">
          <span className="eyebrow section-kicker"><span className="kicker-dash" /> A DIFFERENT WAY TO EXPLORE</span>
          <h2>History is closer<br />than you think.</h2>
          <p>
            Fort Guide brings visual recognition and heritage discovery together.
            Start with the structures around you, then follow your curiosity into
            the stories and landscapes of Maharashtra.
          </p>
          <ul className="story-points">
            <li><Check size={15} /> Start with a photo of a gateway</li>
            <li><Check size={15} /> See what the current model recognizes</li>
            <li><Check size={15} /> Keep the history grounded in sources</li>
          </ul>
          <button className="text-button" onClick={() => openAnalysis()}>
            Explore a photo <ArrowRight size={17} />
          </button>
        </div>
        <div className="heritage-note">
          <span className="note-icon"><Compass size={20} /></span>
          <span className="note-label">A landscape shaped by time</span>
          <strong>Explore at<br />your own pace.</strong>
          <span className="note-detail">A growing project for curious minds.</span>
          <ChevronDown aria-hidden="true" className="note-chevron" size={16} />
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <span className="footer-emblem"><Landmark size={16} /> FORT GUIDE</span>
        <p>Preserving the past. Inspiring the next discovery.</p>
        <a className="footer-top-link" href="#home">Back to top <ArrowUpRight size={14} /></a>
      </footer>

      {isAnalysisOpen && (
        <ChatWorkspace
          initialFort={initialFort}
          onClose={() => setIsAnalysisOpen(false)}
        />
      )}
    </main>
  );
}

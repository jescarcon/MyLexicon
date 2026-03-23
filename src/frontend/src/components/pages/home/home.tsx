import { useState } from 'react';
import Auth from '../auth/auth';
import './home.css';

export default function Home() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (<>
        <div className="home-container">

            {/* HERO */}
            <section className="home-hero">
                <div className="home-background">
                    <img src="/earth.jpg" alt="Planeta Tierra" className="home-bg-image" />
                    <div className="home-overlay"></div>
                </div>

                <div className="home-content">
                    <div className="home-text-wrapper">
                        <h1 className="home-title">
                            El mundo en tus manos
                            <span className="home-brand">MyLexicon</span>
                        </h1>

                        <div className="home-accent-line"></div>

                        <button
                            className="home-btn-enter"
                            onClick={() => setIsAuthOpen(true)}
                        >
                            COMIENZA
                        </button>
                    </div>
                </div>

                <div className="home-scroll-indicator">
                    <div className="home-mouse">
                        <div className="home-wheel"></div>
                    </div>
                </div>
            </section>

            {/* INFO */}
            <section className="home-details">
                <div className="home-grid">

                    <div className="home-card">
                        <h3 className="home-card-title">DICCIONARIOS PERSONALES</h3>
                        <p className="home-card-text">
                            Crea tus propios diccionarios de términos y expresiones mientras aprendes una lengua.
                        </p>
                    </div>

                    <div className="home-card">
                        <h3 className="home-card-title">ÁGIL Y SENCILLO</h3>
                        <p className="home-card-text">
                            Captura palabras fácilmente y añade notas o categorías.
                        </p>
                    </div>

                    <div className="home-card">
                        <h3 className="home-card-title">ORGANIZADO</h3>
                        <p className="home-card-text">
                            Encuentra términos con filtros y etiquetas.
                        </p>
                    </div>

                </div>

                <div className="home-final">
                    <p>Potencia tu aprendizaje con MyLexicon</p>
                </div>
            </section>

        </div>
        <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} /></>
    );
}
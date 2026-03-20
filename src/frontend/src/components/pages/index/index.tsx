import { useState } from 'react'; // Importamos el hook para el estado
import Auth from '../auth/auth'; // Importamos el componente (lo crearemos ahora)
import './index.css'; 

export default function Index() {
    // 1. Creamos el estado para controlar el modal (empieza cerrado: false)
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <div className="index-container">
            {/* --- SECCIÓN PORTADA --- */}
            <section className="index-hero">
                <div className="index-background">
                    <img src="/earth.jpg" alt="Planeta Tierra" className="index-bg-image" />
                    <div className="index-overlay"></div>
                </div>
                
                <div className="index-content">
                    <div className="index-text-wrapper">
                        <h1 className="index-title">
                            El mundo en tus manos
                            <span className="index-brand">MyLexicon</span>
                        </h1>
                        <div className="index-accent-line"></div>
                        
                        {/* 2. Al clicar, cambiamos el estado a true para mostrar el modal */}
                        <button 
                            className="index-btn-enter" 
                            onClick={() => setIsAuthOpen(true)}
                        >
                            COMIENZA
                        </button>
                    </div>
                </div>

                <div className="index-scroll-indicator">
                    <div className="index-mouse"><div className="index-wheel"></div></div>
                </div>
            </section>

            {/* --- SECCIÓN INFORMACIÓN --- */}
            <section className="index-details">
                <div className="index-grid">
                    <div className="index-card">
                        <h3 className="index-card-title">DICCIONARIOS PERSONALES</h3>
                        <p className="index-card-text">Crea tus propios diccionarios de términos y expresiones mientras aprendes una lengua.</p>
                    </div>

                    <div className="index-card">
                        <h3 className="index-card-title">ÁGIL Y SENCILLO</h3>
                        <p className="index-card-text">Captura las palabras y expresiones de forma sencilla para apoyar tu aprendizaje y agrégales notas o categorias.</p>
                    </div>

                    <div className="index-card">
                        <h3 className="index-card-title">ORGANIZADO</h3>
                        <p className="index-card-text">Encuentra las palabras a través de etiquetas y filtros en tu buscador.</p>
                    </div>
                </div>

                <div className="index-final-statement">
                    <p>Potencia tu aprendizaje con MyLexicon</p>
                </div>
            </section>

            {/* 3. Invocamos el componente Auth. 
               Le pasamos 'isOpen' para que sepa si mostrarse y 'onClose' para poder cerrarse */}
            <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
}
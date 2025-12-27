import { useNavigate } from 'react-router-dom';
import { Video, Image as ImageIcon, Zap, Clapperboard, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/variables.css';

const features = [
    {
        title: 'Avatar de Video',
        description: 'Genera videos con portavoces virtuales realistas hablando tu guion.',
        icon: Video,
        path: '/generate-videos',
        color: 'var(--primary)',
        delay: 0.1
    },
    {
        title: 'Face Swap',
        description: 'Intercambia rostros en fotos y videos con alta precisión.',
        icon: Layers,
        path: '/face-swap', // Note: Need to add route for this
        color: 'var(--warning)',
        delay: 0.2
    },
    {
        title: 'Generar Imágenes',
        description: 'Crea fotografía de producto y escenas fotorrealistas con Juggernaut XL.',
        icon: ImageIcon,
        path: '/generate-images',
        color: 'var(--success)',
        delay: 0.3
    },
    {
        title: 'Video Comercial',
        description: 'Editor avanzado para anuncios de TV y Redes Sociales.',
        icon: Clapperboard,
        path: '/commercial-video',
        color: 'var(--danger)',
        delay: 0.4
    },
    {
        title: 'Inspiración',
        description: 'Descubre tendencias y plantillas virales.',
        icon: Zap,
        path: '/inspiration',
        color: '#8b5cf6', // Violet
        delay: 0.5
    }
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Bienvenido a EnfoadsIA</h1>
                <p className="text-[var(--text-secondary)]">Selecciona una herramienta para comenzar a crear contenido.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: feature.delay }}
                        whileHover={{ y: -5, boxShadow: 'var(--shadow-glow)' }}
                        className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] cursor-pointer group hover:border-[var(--border-active)] transition-colors relative overflow-hidden"
                        onClick={() => navigate(feature.path)}
                    >
                        {/* Background Gradient Effect */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-2xl transition-opacity group-hover:opacity-10"
                            style={{ backgroundColor: feature.color }}
                        />

                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                        >
                            <feature.icon size={24} />
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Projects Section Placeholder */}
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className='w-1 h-6 bg-[var(--primary)] rounded-full'></span>
                    Proyectos Recientes
                </h2>
                <div className="p-8 rounded-xl border border-[var(--border-light)] border-dashed flex flex-col items-center justify-center text-[var(--text-tertiary)] bg-[var(--bg-card)]/50">
                    <p>No tienes proyectos recientes.</p>
                </div>
            </div>
        </div>
    );
}

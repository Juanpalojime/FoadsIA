import { useNavigate } from 'react-router-dom';
import { Video, Image as ImageIcon, Zap, Clapperboard, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { fadeInUp, staggerContainer, staggerItem, hoverLift } from '@/lib/animations';

const features = [
    {
        title: 'Creative Studio',
        description: 'Generación automática de anuncios con IA inteligente y mockups.',
        icon: Sparkles,
        path: '/ad-creator',
        color: 'from-purple-500 to-indigo-500',
        badge: 'Nuevo'
    },
    {
        title: 'Video Comercial',
        description: 'Producción de anuncios premium con avatares y subtítulos.',
        icon: Clapperboard,
        path: '/commercial-video',
        color: 'from-pink-500 to-rose-500'
    },
    {
        title: 'Canvas Editor',
        description: 'Edición por capas con generación de áreas por IA asistida.',
        icon: Layers,
        path: '/canvas-editor',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        title: 'Generación Fotográfica',
        description: 'Crea fotografía de producto hyper-realista con SDXL.',
        icon: ImageIcon,
        path: '/generate-images',
        color: 'from-emerald-500 to-teal-500'
    },
    {
        title: 'Face Swap Lab',
        description: 'Intercambio de rostros profesional para contenido viral.',
        icon: Zap,
        path: '/face-swap',
        color: 'from-amber-500 to-orange-500'
    },
    {
        title: 'Avatar Studio',
        description: 'Crea portavoces digitales que hablan cualquier idioma.',
        icon: Video,
        path: '/generate-videos',
        color: 'from-indigo-500 to-violet-500'
    }
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <motion.div
                {...fadeInUp}
                className="relative p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-card/80 to-background border border-border overflow-hidden shadow-2xl"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />

                <div className="relative z-10 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <Sparkles size={12} />
                        Bienvenido a la Nueva Era de Creación
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl lg:text-6xl font-black mb-6 leading-tight tracking-tight"
                    >
                        Crea Contenido <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-pink-500 animate-gradient-x">
                            Viral con IA
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg"
                    >
                        Potencia tu marca con herramientas de inteligencia artificial de última generación.
                        Desde videos comerciales hasta fotografía de producto profesional.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button
                            onClick={() => navigate('/ad-creator')}
                            size="lg"
                            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-primary/50 text-base px-8 py-6 rounded-xl font-bold group"
                        >
                            Empezar a Crear
                            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Grid Tools */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-3xl font-black tracking-tight mb-2">Herramientas Pro</h2>
                        <p className="text-muted-foreground">Explora nuestras soluciones creativas</p>
                    </motion.div>
                    <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold hidden sm:flex">
                        Ver todas
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={staggerItem}
                            {...hoverLift}
                            onClick={() => navigate(feature.path)}
                            className="h-full"
                        >
                            <Card className="h-full cursor-pointer bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/50 transition-all duration-300 group overflow-hidden relative">
                                {/* Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <CardHeader>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </div>
                                        {feature.badge && (
                                            <span className="px-2 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-md shadow-sm">
                                                {feature.badge}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-relaxed pt-2">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors mt-auto">
                                        EXPLORAR
                                        <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

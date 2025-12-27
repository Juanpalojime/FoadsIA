import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Sparkles, Zap, Rocket, Star } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem, hoverLift } from '@/lib/animations'

export function ExamplePage() {
    const features = [
        {
            icon: Sparkles,
            title: "AI Image Generation",
            description: "Create stunning images with SDXL Lightning in seconds",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Zap,
            title: "Face Swap",
            description: "Swap faces seamlessly with InsightFace technology",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Rocket,
            title: "Magic Prompt",
            description: "Enhance your prompts automatically for better results",
            color: "from-orange-500 to-red-500"
        },
        {
            icon: Star,
            title: "GPU Optimized",
            description: "Optimized for T4 GPU with intelligent VRAM management",
            color: "from-green-500 to-emerald-500"
        }
    ]

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    {...fadeInUp}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-4">
                        Welcome to EnfoadsIA
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Create stunning AI-generated content with cutting-edge technology
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={index}
                                variants={staggerItem}
                                {...hoverLift}
                            >
                                <Card className="glass glow-hover h-full">
                                    <CardHeader>
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                        <CardDescription>{feature.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="glass border-2 border-primary/20">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl mb-2">Ready to Get Started?</CardTitle>
                            <CardDescription className="text-lg">
                                Start creating amazing content with AI today
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="gap-2">
                                <Rocket className="w-5 h-5" />
                                Start Creating
                            </Button>
                            <Button size="lg" variant="outline" className="gap-2">
                                <Star className="w-5 h-5" />
                                Learn More
                            </Button>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <p className="text-sm text-muted-foreground">
                                No credit card required • Free tier available
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {[
                        { label: "Images Generated", value: "10K+" },
                        { label: "Active Users", value: "500+" },
                        { label: "Avg. Generation Time", value: "2.5s" },
                        { label: "Success Rate", value: "99%" }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-6 rounded-lg glass"
                        >
                            <div className="text-3xl font-bold text-gradient mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

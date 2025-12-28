import { useState, useEffect } from 'react';
import { safeFetch } from '@/lib/api-utils';
import { Save, Server, CheckCircle, AlertCircle, Sparkles, Image as ImageIcon, Check, User, CreditCard, Shield, Bell, Zap } from 'lucide-react';
import { soundManager } from '@/lib/sounds';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useCreditsStore } from '../store/useCreditsStore';

export default function Settings() {
    // System State
    const [apiUrl, setApiUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [faviconUrl, setFaviconUrl] = useState('');
    const [faviconSaved, setFaviconSaved] = useState(false);

    // Account State
    const [userName, setUserName] = useState('Juan Pablo');
    const [userEmail, setUserEmail] = useState('juan@foads.ia');
    const [userAvatar, setUserAvatar] = useState('');
    const [profileSaved, setProfileSaved] = useState(false);
    const [soundsEnabled, setSoundsEnabled] = useState(soundManager.isEnabled());

    // Store
    const { credits } = useCreditsStore();

    useEffect(() => {
        // Load System Settings
        const savedUrl = localStorage.getItem('FOADS_API_URL');
        if (savedUrl) setApiUrl(savedUrl);

        const savedFavicon = localStorage.getItem('app_favicon');
        if (savedFavicon) setFaviconUrl(savedFavicon);

        // Load Account Settings
        const savedName = localStorage.getItem('user_name');
        if (savedName) setUserName(savedName);

        const savedEmail = localStorage.getItem('user_email');
        if (savedEmail) setUserEmail(savedEmail);

        const savedAvatar = localStorage.getItem('user_avatar');
        if (savedAvatar) setUserAvatar(savedAvatar);
    }, []);

    const handleSaveSystem = async () => {
        let cleanUrl = apiUrl.trim();
        // Ensure no trailing slash
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

        // Ensure protocol
        if (!cleanUrl.startsWith('http')) {
            if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
                cleanUrl = `http://${cleanUrl}`;
            } else {
                cleanUrl = `https://${cleanUrl}`;
            }
        }

        setApiUrl(cleanUrl); // Update local state for immediate feedback
        localStorage.setItem('FOADS_API_URL', cleanUrl);

        try {
            setStatus('idle');
            // Try connection
            const { data } = await safeFetch<{ status: string }>('/', {
                method: 'GET',
                // Explicitly allow mixed content for localhost dev
                mode: 'cors'
            });

            if (data?.status === 'online') {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    const handleSaveFavicon = () => {
        if (!faviconUrl) return;
        localStorage.setItem('app_favicon', faviconUrl);

        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
            link.href = faviconUrl;
        } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = faviconUrl;
            document.head.appendChild(newLink);
        }

        setFaviconSaved(true);
        setTimeout(() => setFaviconSaved(false), 2000);
    }

    const handleSaveProfile = () => {
        localStorage.setItem('user_name', userName);
        localStorage.setItem('user_email', userEmail);
        localStorage.setItem('user_avatar', userAvatar);
        setProfileSaved(true);
        soundManager.playSuccess();
        setTimeout(() => setProfileSaved(false), 2000);
    }

    const toggleSounds = (enabled: boolean) => {
        setSoundsEnabled(enabled);
        soundManager.setEnabled(enabled);
        if (enabled) soundManager.playSuccess();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <header>
                <h1 className="text-3xl font-black mb-2 text-foreground tracking-tight">Centro de Control</h1>
                <p className="text-muted-foreground font-medium">Gestiona tu cuenta, infraestructura y preferencias globales.</p>
            </header>

            <Tabs defaultValue="account" className="w-full space-y-8">
                <TabsList className="w-full max-w-md grid grid-cols-2 p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="account" className="rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-md transition-all py-2.5">
                        <User size={14} className="mr-2" /> Mi Cuenta
                    </TabsTrigger>
                    <TabsTrigger value="system" className="rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-md transition-all py-2.5">
                        <Server size={14} className="mr-2" /> Sistema & Engine
                    </TabsTrigger>
                </TabsList>

                {/* --- ACCOUNT TAB --- */}
                <TabsContent value="account" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="rounded-[2.5rem] overflow-hidden shadow-xl border-border">
                                <CardHeader className="p-8 border-b border-border bg-muted/10">
                                    <CardTitle className="text-lg font-black flex items-center gap-3 uppercase tracking-widest text-foreground">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <User size={18} />
                                        </div>
                                        Perfil Personal
                                    </CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                                        Información visible en tu espacio de trabajo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        {/* Avatar Section */}
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-24 h-24 rounded-[2rem] bg-muted/30 border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group">
                                                {userAvatar ? (
                                                    <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-black text-muted-foreground">JP</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <p className="text-[9px] text-white font-black uppercase">Editar</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">Administrator</Badge>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="flex-1 space-y-5 w-full">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Avatar URL</label>
                                                <Input
                                                    value={userAvatar}
                                                    onChange={(e) => setUserAvatar(e.target.value)}
                                                    placeholder="https://..."
                                                    className="bg-muted/20 border-border rounded-xl"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Nombre Display</label>
                                                    <Input
                                                        value={userName}
                                                        onChange={(e) => setUserName(e.target.value)}
                                                        className="bg-muted/20 border-border rounded-xl font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Email</label>
                                                    <Input
                                                        value={userEmail}
                                                        onChange={(e) => setUserEmail(e.target.value)}
                                                        className="bg-muted/20 border-border rounded-xl font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="px-8 py-6 bg-muted/5 border-t border-border flex justify-end">
                                    <Button onClick={handleSaveProfile} className="px-8 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg" disabled={profileSaved}>
                                        {profileSaved ? <Check size={16} className="mr-2" /> : <Save size={16} className="mr-2" />}
                                        {profileSaved ? 'Guardado' : 'Guardar Cambios'}
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="rounded-[2.5rem] overflow-hidden shadow-xl border-border">
                                <CardHeader className="p-8 border-b border-border bg-muted/10">
                                    <CardTitle className="text-lg font-black flex items-center gap-3 uppercase tracking-widest text-foreground">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <Bell size={18} />
                                        </div>
                                        Preferencias
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">Email Notifications</p>
                                            <p className="text-xs text-muted-foreground">Recibir resumen semanal de generaciones.</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">Sound Effects</p>
                                            <p className="text-xs text-muted-foreground">Sonidos UI al completar tareas.</p>
                                        </div>
                                        <Switch checked={soundsEnabled} onCheckedChange={toggleSounds} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Plan & Stats */}
                        <div className="space-y-8">
                            <Card className="rounded-[2.5rem] p-8 bg-gradient-to-br from-primary to-purple-800 text-white shadow-2xl relative overflow-hidden border-none h-fit">
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <Sparkles size={120} />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                            <CreditCard size={24} />
                                        </div>
                                        <Badge className="bg-white text-primary hover:bg-white/90 text-[10px] font-black uppercase tracking-widest px-3">Active</Badge>
                                    </div>

                                    <div>
                                        <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Plan Actual</p>
                                        <h3 className="text-3xl font-black tracking-tight">Premium Life</h3>
                                    </div>

                                    <div className="pt-6 border-t border-white/10 space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-white/70">Créditos Disponibles</span>
                                            <span className="font-bold flex items-center gap-1"><Zap size={12} fill="currentColor" /> {credits}</span>
                                        </div>
                                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white w-[75%] rounded-full opacity-80"></div>
                                        </div>
                                        <p className="text-[10px] text-white/50 text-right">Se renuevan en 12 días</p>
                                    </div>

                                    <Button variant="secondary" className="w-full rounded-xl font-black text-xs uppercase tracking-widest bg-white text-primary hover:bg-white/90 border-none shadow-lg">
                                        Administrar Suscripción
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- SYSTEM TAB --- */}
                <TabsContent value="system" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN SYSTEM */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Connection Card */}
                            <Card className="rounded-[2.5rem] overflow-hidden shadow-2xl border-border">
                                <CardHeader className="p-8 border-b border-border bg-muted/10">
                                    <CardTitle className="text-lg font-black flex items-center gap-3 uppercase tracking-widest text-foreground">
                                        <Server className="text-primary" />
                                        Backend Engine
                                    </CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                                        CONEXIÓN GPU & COLAB
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Public Endpoint URL</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
                                                    <Sparkles size={16} />
                                                </div>
                                                <Input
                                                    type="text"
                                                    value={apiUrl}
                                                    onChange={(e) => setApiUrl(e.target.value)}
                                                    placeholder="https://xxxx-xx-xx.ngrok-free.app"
                                                    className="h-14 pl-12 pr-4 rounded-2xl bg-muted/20 border-border text-foreground text-sm font-medium focus-visible:ring-primary shadow-inner"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleSaveSystem}
                                                className="px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 shrink-0"
                                            >
                                                <Save size={18} />
                                                Vincular
                                            </Button>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground px-2 font-medium">
                                            Copia la **URL de Ngrok** del notebook <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">Enfoads_Colab.ipynb</code>.
                                        </p>
                                    </div>

                                    {/* Status Feedback */}
                                    {status === 'success' && (
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500/10 border border-green-500/20 rounded-[2rem] p-6 flex items-center gap-4 text-green-500">
                                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-wider">Engine Online</p>
                                                <p className="text-xs opacity-80 font-medium text-muted-foreground">Conexión establecida con GPU Cloud.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-destructive/10 border border-destructive/20 rounded-[2rem] p-6 flex items-center gap-4 text-destructive">
                                            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-wider">Sin Conexión</p>
                                                <p className="text-xs opacity-80 font-medium text-muted-foreground">Verifica el endpoint y el notebook.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* BRANDING CARD */}
                            <Card className="rounded-[2.5rem] overflow-hidden shadow-2xl border-border">
                                <CardHeader className="p-8 border-b border-border bg-muted/10">
                                    <CardTitle className="text-lg font-black flex items-center gap-3 uppercase tracking-widest text-foreground">
                                        <ImageIcon className="text-primary" />
                                        Identidad Visual
                                    </CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                                        PERSONALIZAR FAVICON
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Favicon URL</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center justify-center w-8 text-muted-foreground pointer-events-none">
                                                    {faviconUrl ? (
                                                        <img src={faviconUrl} className="w-6 h-6 rounded-md object-cover shadow-sm ring-1 ring-border" alt="Favicon" />
                                                    ) : (
                                                        <ImageIcon size={18} />
                                                    )}
                                                </div>
                                                <Input
                                                    type="text"
                                                    value={faviconUrl}
                                                    onChange={(e) => setFaviconUrl(e.target.value)}
                                                    placeholder="https://ejemplo.com/icon.png"
                                                    className="h-14 pl-14 pr-4 rounded-2xl bg-muted/20 border-border shadow-inner"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleSaveFavicon}
                                                className="px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-3 shrink-0"
                                                variant={faviconSaved ? "secondary" : "default"}
                                            >
                                                {faviconSaved ? <Check size={18} className="text-emerald-500" /> : <Save size={18} />}
                                                {faviconSaved ? 'Listo' : 'Guardar'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN SYSTEM */}
                        <div>
                            <Card className="rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl border-border bg-gradient-to-br from-card to-background/50 h-full max-h-[400px]">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-2 text-foreground">Seguridad Local</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                        Todas las configuraciones se almacenan localmente en tu navegador. Tus endpoints son privados.
                                    </p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-border">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Versión Cliente</p>
                                    <Badge variant="outline" className="w-full justify-center py-2 rounded-xl text-center text-xs font-black uppercase tracking-widest">
                                        v2.5.0-beta
                                    </Badge>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

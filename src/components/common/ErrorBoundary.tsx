import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-destructive" />
                        </div>
                        <h1 className="text-2xl font-black mb-2 text-foreground capitalize">Vaya, algo salió mal</h1>
                        <p className="text-muted-foreground text-sm mb-8">
                            Hemos detectado un error inesperado en la interfaz. No te preocupes, tus datos están a salvo.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                            >
                                <RefreshCw size={18} />
                                Reiniciar Aplicación
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Home size={18} />
                                Volver al Inicio
                            </button>
                        </div>

                        {import.meta.env?.DEV && (
                            <div className="mt-8 text-left p-4 bg-black/20 rounded-xl overflow-auto max-h-40 border border-white/5">
                                <p className="text-[10px] font-mono text-destructive">{this.state.error?.toString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

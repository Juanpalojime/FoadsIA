
const getBaseUrl = () => {
    return localStorage.getItem('FOADS_API_URL') || '';
};

export interface GenerateImageResponse {
    status: 'success' | 'error';
    image?: string; // Base64 data URI
    message?: string;
}

export const api = {
    checkConnection: async (): Promise<boolean> => {
        try {
            const url = getBaseUrl();
            if (!url) return false;
            const res = await fetch(`${url}/`);
            const data = await res.json();
            return data.status === 'online';
        } catch (e) {
            return false;
        }
    },

    generateImage: async (prompt: string, aspect_ratio: string = '1:1', steps: number = 4, guidance: number = 0, negative_prompt: string = ''): Promise<GenerateImageResponse> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) throw new Error('API URL not configured'); // Added this check back

        try { // Re-added try-catch for consistency with other methods and GenerateImageResponse type
            const response = await fetch(`${baseUrl}/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, aspect_ratio, steps, guidance, negative_prompt }),
            });
            if (!response.ok) {
                const err = await response.json(); // Use response instead of res
                throw new Error(err.message || 'Error al generar imagen');
            }
            return response.json();
        } catch (e: any) {
            console.error(e);
            return { status: 'error', message: e.message };
        }
    },

    magicPrompt: async (prompt: string): Promise<{ status: string; prompt?: string; message?: string }> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) throw new Error('API URL not configured');

        try {
            const response = await fetch(`${baseUrl}/magic-prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error al optimizar prompt');
            }
            return response.json();
        } catch (e: any) {
            console.error(e);
            return { status: 'error', message: e.message };
        }
    },

    faceSwap: async (sourceImage: string, targetImage: string): Promise<GenerateImageResponse> => {
        const url = getBaseUrl();
        if (!url) throw new Error('API URL not configured');

        try {
            const res = await fetch(`${url}/face-swap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source_image: sourceImage, target_image: targetImage })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Face swap failed');
            }

            return await res.json();
        } catch (e: any) {
            console.error(e);
            return { status: 'error', message: e.message };
        }
    },

    renderVideo: async (script: string, avatarId: number, generateSubtitles: boolean = false): Promise<any> => {
        const url = getBaseUrl();
        if (!url) throw new Error('API URL not configured');

        try {
            const res = await fetch(`${url}/render-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    avatar_id: avatarId,
                    generate_subtitles: generateSubtitles
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Video render failed');
            }

            return await res.json();
        } catch (e: any) {
            console.error(e);
            return { status: 'error', message: e.message };
        }
    },

    renderMultiScene: async (scenes: any[]): Promise<any> => {
        const url = getBaseUrl();
        if (!url) throw new Error('API URL not configured');

        try {
            const res = await fetch(`${url}/render-multi-scene`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenes })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Multi-scene render failed');
            }

            return await res.json();
        } catch (e: any) {
            console.error(e);
            return { status: 'error', message: e.message };
        }
    },

    getGpuStatus: async (): Promise<any> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) return { status: 'offline' };
        try {
            const response = await fetch(`${baseUrl}/gpu-status`);
            return response.json();
        } catch (e) {
            return { status: 'offline' };
        }
    },

    livePortrait: async (image: string, audio?: string): Promise<any> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) throw new Error('API URL not configured');
        try {
            const response = await fetch(`${baseUrl}/live-portrait`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image, audio }),
            });
            return response.json();
        } catch (e: any) {
            return { status: 'error', message: e.message };
        }
    },

    getAvatars: async (): Promise<any> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) throw new Error('API URL not configured');
        try {
            const response = await fetch(`${baseUrl}/avatars`);
            return response.json();
        } catch (e: any) {
            return { status: 'error', message: e.message };
        }
    },

    enhanceMedia: async (mediaUrl: string, type: 'image' | 'video' = 'image'): Promise<any> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) throw new Error('API URL not configured');
        try {
            const response = await fetch(`${baseUrl}/enhance-media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ media_url: mediaUrl, type }),
            });
            return response.json();
        } catch (e: any) {
            return { status: 'error', message: e.message };
        }
    },

    // Phase 12: Real Production Bridge
    health: async (): Promise<any> => {
        const url = getBaseUrl();
        if (!url) return { status: 'offline' };
        try {
            const res = await fetch(url);
            return await res.json();
        } catch (e) {
            return { status: 'offline' };
        }
    },

    syncAsset: async (asset: any): Promise<any> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) return null;
        try {
            const res = await fetch(`${baseUrl}/api/assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset)
            });
            return res.json();
        } catch (e) { return null; }
    },

    getJobStatus: async (jobId: string): Promise<any> => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) return null;
        try {
            const res = await fetch(`${baseUrl}/api/jobs/${jobId}`);
            return res.json();
        } catch (e) { return null; }
    }
};

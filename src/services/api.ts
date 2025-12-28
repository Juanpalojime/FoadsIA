
import { safeFetch, API_BASE_URL } from '@/lib/api-utils';

/**
 * Centralized helper to build the full endpoint URL.
 * Falls back to the API_BASE_URL defined in api-utils (which reads from localStorage).
 */
const buildUrl = (path: string) => {
    const base = API_BASE_URL.replace(/\/*$/, ''); // remove trailing slash
    const cleanPath = path.replace(/^\/*/, ''); // remove leading slash
    return `${base}/${cleanPath}`;
};

export interface GenerateImageResponse {
    status: 'success' | 'error';
    image?: string; // Base64 data URI
    message?: string;
}

export const api = {
    checkConnection: async (): Promise<boolean> => {
        const { data, error } = await safeFetch('/');
        return !error && data?.status === 'online';
    },

    generateImage: async (prompt: string, aspect_ratio: string = '1:1', steps: number = 4, guidance: number = 0, negative_prompt: string = ''): Promise<GenerateImageResponse> => {
        try {
            const { data, error } = await safeFetch('/generate-image', {
                method: 'POST',
                body: JSON.stringify({ prompt, aspect_ratio, steps, guidance, negative_prompt })
            }, undefined);
            if (error) throw new Error(error);
            return data as GenerateImageResponse;
        } catch (e: any) {
            console.error(e);
            return { status: 'error', message: e.message };
        }
    },

    magicPrompt: async (prompt: string) => {
        const { data, error } = await safeFetch('/magic-prompt', {
            method: 'POST',
            body: JSON.stringify({ prompt })
        }, undefined);
        if (error) return { status: 'error', message: error };
        return data;
    },

    faceSwap: async (sourceImage: string, targetImage: string): Promise<GenerateImageResponse> => {
        const { data, error } = await safeFetch('/face-swap', {
            method: 'POST',
            body: JSON.stringify({ source_image: sourceImage, target_image: targetImage })
        }, undefined);
        if (error) return { status: 'error', message: error };
        return data as GenerateImageResponse;
    },

    renderVideo: async (script: string, avatarId: string, voiceId: string, generateSubtitles = false) => {
        const { data, error } = await safeFetch('/render-video', {
            method: 'POST',
            body: JSON.stringify({ script, avatar_id: avatarId, voice_id: voiceId, generate_subtitles: generateSubtitles })
        }, undefined);
        if (error) return { status: 'error', message: error };
        return data;
    },

    renderMultiScene: async (scenes: any[]) => {
        const { data, error } = await safeFetch('/render-multi-scene', {
            method: 'POST',
            body: JSON.stringify({ scenes })
        }, undefined);
        if (error) return { status: 'error', message: error };
        return data;
    },

    getGpuStatus: async () => {
        const { data, error } = await safeFetch('/gpu-status');
        return error ? { status: 'offline' } : data;
    },

    livePortrait: async (image: string, audio?: string) => {
        const { data, error } = await safeFetch('/live-portrait', {
            method: 'POST',
            body: JSON.stringify({ image, audio })
        }, undefined);
        if (error) return { status: 'error', message: error };
        return data;
    },

    getAvatars: async () => {
        const { data, error } = await safeFetch('/avatars');
        return error ? { status: 'error', message: error } : data;
    },

    getVoices: async () => {
        const { data, error } = await safeFetch('/voices');
        return error ? { status: 'error', message: error } : data;
    },

    enhanceMedia: async (mediaUrl: string, type: 'image' | 'video' = 'image') => {
        const { data, error } = await safeFetch('/enhance-media', {
            method: 'POST',
            body: JSON.stringify({ media_url: mediaUrl, type })
        }, undefined);
        if (error) return { status: 'error', message: error };
        return data;
    },

    health: async () => {
        const { data, error } = await safeFetch('/');
        return error ? { status: 'offline' } : data;
    },

    syncAsset: async (asset: any) => {
        const { data, error } = await safeFetch('/api/assets', {
            method: 'POST',
            body: JSON.stringify(asset)
        }, undefined);
        return error ? null : data;
    },

    getJobStatus: async (jobId: string) => {
        const { data, error } = await safeFetch(`/api/jobs/${jobId}`);
        return error ? null : data;
    }
};

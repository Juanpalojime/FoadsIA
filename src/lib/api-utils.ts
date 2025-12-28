/**
 * API utilities with graceful fallbacks
 * Handles backend unavailability and provides demo data
 */

import { useToast } from '@/components/ui/toast';

export const API_BASE_URL = localStorage.getItem('FOADS_API_URL') || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
    showErrorToast?: boolean;
}

/**
 * Enhanced fetch with error handling and fallbacks
 */
export async function safeFetch<T>(
    endpoint: string,
    options: FetchOptions = {},
    fallbackData?: T
): Promise<{ data: T | null; error: string | null; isDemo: boolean }> {
    const { showErrorToast = false, ...fetchOptions } = options;

    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                ...fetchOptions.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return { data, error: null, isDemo: false };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`API call failed: ${endpoint}`, errorMessage);

        if (fallbackData) {
            console.log(`Using fallback data for ${endpoint}`);
            return { data: fallbackData, error: null, isDemo: true };
        }

        return { data: null, error: errorMessage, isDemo: false };
    }
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Hook for using safe API calls with toast notifications
 */
export function useApiWithToast() {
    const { showToast } = useToast();

    const apiCall = async <T,>(
        endpoint: string,
        options: FetchOptions = {},
        fallbackData?: T
    ) => {
        const result = await safeFetch(endpoint, options, fallbackData);

        if (result.error && options.showErrorToast) {
            showToast(`Error: ${result.error}`, 'error');
        }

        if (result.isDemo) {
            showToast('Usando datos de demostración (backend no disponible)', 'info');
        }

        return result;
    };

    return { apiCall, showToast };
}

/**
 * Demo/Fallback data generators
 */
export const demoData = {
    avatars: [
        {
            id: 'demo_avatar_1',
            name: 'Avatar Demo 1',
            img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        },
        {
            id: 'demo_avatar_2',
            name: 'Avatar Demo 2',
            img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        },
        {
            id: 'demo_avatar_3',
            name: 'Avatar Demo 3',
            img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        },
    ],

    voices: [
        { id: 'es-MX-DaliaNeural', name: 'Dalia (Español MX)', language: 'es-MX', gender: 'Female' },
        { id: 'es-MX-JorgeNeural', name: 'Jorge (Español MX)', language: 'es-MX', gender: 'Male' },
        { id: 'es-ES-ElviraNeural', name: 'Elvira (Español ES)', language: 'es-ES', gender: 'Female' },
        { id: 'es-ES-AlvaroNeural', name: 'Álvaro (Español ES)', language: 'es-ES', gender: 'Male' },
        { id: 'en-US-JennyNeural', name: 'Jenny (English US)', language: 'en-US', gender: 'Female' },
        { id: 'en-US-GuyNeural', name: 'Guy (English US)', language: 'en-US', gender: 'Male' },
    ],

    assets: [
        {
            id: 'demo_asset_1',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
            name: 'Demo Image 1',
            createdAt: new Date().toISOString(),
        },
        {
            id: 'demo_asset_2',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800',
            name: 'Demo Image 2',
            createdAt: new Date().toISOString(),
        },
    ],

    brands: [
        {
            id: 'demo_brand_1',
            name: 'Mi Marca Demo',
            logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
            fonts: ['Inter', 'Roboto'],
        },
    ],
};

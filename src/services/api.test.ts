import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Service', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockFetch.mockReset();
        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(() => 'http://localhost:5000'),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        global.localStorage = localStorageMock as any;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('checkConnection', () => {
        it('should return true when backend is online', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'online' }),
            });

            const result = await api.checkConnection();
            expect(result).toBe(true);
        });

        it('should return false when backend is offline', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ status: 'offline' }),
            });

            const result = await api.checkConnection();
            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await api.checkConnection();
            expect(result).toBe(false);
        });
    });

    describe('generateImage', () => {
        it('should generate image successfully', async () => {
            const mockResponse = {
                status: 'success',
                image: 'data:image/png;base64,mockImageData',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await api.generateImage('a beautiful sunset');

            expect(result.status).toBe('success');
            expect(result.image).toBeDefined();
            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/generate-image',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('should handle generation errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ status: 'error', message: 'GPU not available' }),
            });

            const result = await api.generateImage('test prompt');

            expect(result.status).toBe('error');
            expect(result.message).toBeDefined();
        });

        it('should include all parameters in request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'success', image: 'data:...' }),
            });

            await api.generateImage(
                'test prompt',
                '16:9',
                8,
                7.5,
                'blurry, low quality'
            );

            const callArgs = mockFetch.mock.calls[0];
            const body = JSON.parse(callArgs[1].body);

            expect(body.prompt).toBe('test prompt');
            expect(body.aspect_ratio).toBe('16:9');
            expect(body.steps).toBe(8);
            expect(body.guidance).toBe(7.5);
            expect(body.negative_prompt).toBe('blurry, low quality');
        });
    });

    describe('magicPrompt', () => {
        it('should enhance prompt successfully', async () => {
            const mockResponse = {
                status: 'success',
                prompt: 'masterpiece, best quality, a beautiful sunset',
                original: 'a beautiful sunset',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await api.magicPrompt('a beautiful sunset') as any;

            expect(result.status).toBe('success');
            expect(result.prompt).toContain('masterpiece');
            expect(result.original).toBe('a beautiful sunset');
        });
    });

    describe('faceSwap', () => {
        it('should swap faces successfully', async () => {
            const mockResponse = {
                status: 'success',
                image: 'data:image/png;base64,swappedImage',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await api.faceSwap(
                'data:image/png;base64,source',
                'data:image/png;base64,target'
            );

            expect(result.status).toBe('success');
            expect(result.image).toBeDefined();
        });

        it('should handle face detection errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    status: 'error',
                    message: 'No face detected in source image'
                }),
            });

            const result = await api.faceSwap('source', 'target');

            expect(result.status).toBe('error');
            // Now message should be correct thanks to safeFetch update
            expect(result.message).toContain('face detected');
        });
    });

    describe('getGpuStatus', () => {
        it('should return GPU status when available', async () => {
            const mockStatus = {
                status: 'online',
                device: 'Tesla T4',
                vram_total_gb: 15.0,
                vram_free_gb: 8.5,
                vram_allocated_gb: 6.5,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockStatus,
            });

            const result = await api.getGpuStatus() as any;

            expect(result.status).toBe('online');
            expect(result.device).toBe('Tesla T4');
            expect(result.vram_total_gb).toBe(15.0);
        });

        it('should return offline status on error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await api.getGpuStatus() as any;

            expect(result.status).toBe('offline');
        });
    });

    describe('renderVideo', () => {
        it('should queue video rendering job', async () => {
            const mockResponse = {
                status: 'success',
                job_id: 'vid_123456',
                message: 'Renderizado en cola de producción',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await api.renderVideo(
                'Hola, este es un video de prueba',
                'avatar1.jpg',
                'es-MX-DaliaNeural',
                true
            ) as any;

            expect(result.status).toBe('success');
            expect(result.job_id).toBeDefined();
        });
    });

    describe('getJobStatus', () => {
        it('should return job status', async () => {
            const mockStatus = {
                id: 'vid_123',
                status: 'completed',
                url: 'http://localhost:5000/files/jobs/vid_123/final_result.mp4',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockStatus,
            });

            const result = await api.getJobStatus('vid_123') as any;

            expect(result.status).toBe('completed');
            expect(result.url).toBeDefined();
        });

        it('should return null for non-existent job', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

            const result = await api.getJobStatus('invalid_id');

            expect(result).toBeNull();
        });
    });

    describe('health', () => {
        it('should return health status', async () => {
            const mockHealth = {
                status: 'online',
                message: 'FoadsIA Backend Running',
                mode: 'free_oss',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockHealth,
            });

            const result = await api.health() as any;

            expect(result.status).toBe('online');
            expect(result.message).toBeDefined();
        });
    });
});

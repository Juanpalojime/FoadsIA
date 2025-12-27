import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GenerateImages from '../pages/GenerateImages';
import { api } from '../services/api';

// Mock API
vi.mock('../services/api', () => ({
    api: {
        generateImage: vi.fn(),
        magicPrompt: vi.fn(),
    },
}));

describe('GenerateImages Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<GenerateImages />);
        expect(screen.getByText(/Imagen Pro Hub/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Escribe tu visión aquí/i)).toBeInTheDocument();
    });

    it('shows error if prompt is empty when generating', async () => {
        render(<GenerateImages />);
        const genButton = screen.getByText(/Generar Píxeles/i);
        // Button is disabled if prompt is empty
        expect(genButton).toBeDisabled();
    });

    it('displays success image when API returns successfully', async () => {
        (api.generateImage as any).mockResolvedValue({
            status: 'success',
            image: 'data:image/png;base64,test',
        });

        render(<GenerateImages />);
        const textarea = screen.getByPlaceholderText(/Escribe tu visión aquí/i);
        fireEvent.change(textarea, { target: { value: 'A cool dog' } });

        const genButton = screen.getByText(/Generar Píxeles/i);
        fireEvent.click(genButton);

        await waitFor(() => {
            expect(screen.getByAltText(/Generated content/i)).toBeInTheDocument();
        });
    });

    it('displays error message when API fails', async () => {
        (api.generateImage as any).mockResolvedValue({
            status: 'error',
            message: 'Server too busy',
        });

        render(<GenerateImages />);
        const textarea = screen.getByPlaceholderText(/Escribe tu visión aquí/i);
        fireEvent.change(textarea, { target: { value: 'A cool dog' } });

        const genButton = screen.getByText(/Generar Píxeles/i);
        fireEvent.click(genButton);

        await waitFor(() => {
            expect(screen.getByText(/Server too busy/i)).toBeInTheDocument();
        });
    });
});

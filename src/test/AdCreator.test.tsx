import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdCreator from '../pages/AdCreator';
import * as gemini from '../services/gemini';

// Mock the whole module
vi.mock('../services/gemini', () => ({
    generateAdVariations: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
        h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
        h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
        h4: ({ children, ...props }: any) => <h4 {...props}>{children}</h4>,
        p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AdCreator Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders correctly', () => {
        render(<AdCreator />);
        expect(screen.getByText(/Ad Creator Studio/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/¿Qué quieres anunciar hoy/i)).toBeInTheDocument();
    });

    it('displays variations when generating', async () => {
        const mockVariations = [
            {
                id: '1',
                headline: 'Test_Headline_XYZ',
                description: 'Test Description ABC',
                cta: 'Click Me Now',
                imageUrl: 'https://via.placeholder.com/150',
                imagePrompt: 'A test image prompt'
            }
        ];

        const generateMock = vi.mocked(gemini.generateAdVariations);
        generateMock.mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve(mockVariations), 100))
        );

        render(<AdCreator />);
        const textarea = screen.getByPlaceholderText(/¿Qué quieres anunciar hoy/i);

        fireEvent.change(textarea, { target: { value: 'Una bebida energizante nueva' } });

        const genButton = screen.getByText(/Generar Campaña Pro/i);
        fireEvent.click(genButton);

        // Verify it entered loading state
        const loadingText = await screen.findByText(/Gemini está creando/i);
        expect(loadingText).toBeInTheDocument();

        // Wait for results
        const resultHeadline = await screen.findByText(/Test_Headline_XYZ/i, {}, { timeout: 5000 });
        expect(resultHeadline).toBeInTheDocument();

        // Final state: loading should be gone
        expect(screen.queryByText(/Gemini está creando/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no variations', () => {
        render(<AdCreator />);
        expect(screen.getByText(/Escribe algo y presiona generar/i)).toBeInTheDocument();
    });
});

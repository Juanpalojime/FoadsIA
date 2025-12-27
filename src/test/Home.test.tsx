import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe('Home Page', () => {
    it('renders correctly', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText(/Bienvenido a EnfoadsIA/i)).toBeInTheDocument();
        expect(screen.getByText(/Avatar de Video/i)).toBeInTheDocument();
        expect(screen.getByText(/Face Swap/i)).toBeInTheDocument();
    });

    it('contains correctly linked feature cards', () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText(/Video Comercial/i)).toBeInTheDocument();
        expect(screen.getByText(/Inspiración/i)).toBeInTheDocument();
    });
});

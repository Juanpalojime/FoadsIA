import { create } from 'zustand';

interface CreditsState {
    credits: number;
    initialize: () => Promise<void>;
    addCredits: (amount: number) => void;
    useCredit: (amount?: number) => boolean;
}

/**
 * Free OSS Version: Credits are disabled.
 */
export const useCreditsStore = create<CreditsState>()(
    (set) => ({
        credits: 999999,
        initialize: async () => {
            // No-op in free version
        },
        addCredits: (amount) => {
            // No-op
        },
        useCredit: (amount = 1) => {
            // Always allow
            return true;
        },
    })
);

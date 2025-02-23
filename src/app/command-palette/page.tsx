'use client';

import { useEffect } from 'react';
import { getCurrent } from '@tauri-apps/api/window';

export default function CommandPalettePage() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                getCurrent().close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // return <CommandPalette />;
    return <div>Command palette here!!!!!!</div>
}
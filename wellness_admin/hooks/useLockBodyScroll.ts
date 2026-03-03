import { useEffect } from 'react';

export function useLockBodyScroll(isLocked: boolean) {
    useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = 'hidden';
            // Also prevent iOS scroll bounce
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        };
    }, [isLocked]);
}

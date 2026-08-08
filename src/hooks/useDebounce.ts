import { useRef } from 'react';

const useDebounce = () => {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debounce = (callback: () => void, delay: number) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(callback, delay);
    }
    
    return debounce;
}

export default useDebounce
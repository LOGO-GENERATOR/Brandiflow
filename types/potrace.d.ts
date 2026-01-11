declare module 'potrace' {
    export interface PotraceOptions {
        turnPolicy?: string;
        turdSize?: number;
        alphaMax?: number;
        optCurve?: boolean;
        optTolerance?: number;
        threshold?: number;
        blackOnWhite?: boolean;
        color?: string;
        background?: string;
    }

    export function trace(
        image: string | Buffer,
        options: PotraceOptions,
        callback: (err: Error | null, svg: string) => void
    ): void;

    export function trace(
        image: string | Buffer,
        callback: (err: Error | null, svg: string) => void
    ): void;

    export const Potrace: {
        TURNPOLICY_BLACK: string;
        TURNPOLICY_WHITE: string;
        TURNPOLICY_LEFT: string;
        TURNPOLICY_RIGHT: string;
        TURNPOLICY_MINORITY: string;
        TURNPOLICY_MAJORITY: string;
    };
}

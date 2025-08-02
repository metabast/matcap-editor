/**
 * Value Objects pour les matériaux
 */

import { ValidationError } from '@/shared/utils';

/**
 * Facteur de métallicité
 */
export class Metalness {
    readonly value: number;

    constructor(value: number) {
        this.value = this.validateMetalness(value);
    }

    private validateMetalness(value: number): number {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new ValidationError(
                `Invalid metalness value: ${value}`,
                ['Metalness must be between 0 and 1']
            );
        }
        return value;
    }

    static create(value: number): Metalness {
        return new Metalness(value);
    }

    static nonMetal(): Metalness {
        return new Metalness(0);
    }

    static fullMetal(): Metalness {
        return new Metalness(1);
    }

    static default(): Metalness {
        return new Metalness(0);
    }

    equals(other: Metalness): boolean {
        return Math.abs(this.value - other.value) < 1e-6;
    }

    toString(): string {
        return `Metalness(${this.value})`;
    }
}

/**
 * Facteur de rugosité
 */
export class Roughness {
    readonly value: number;

    constructor(value: number) {
        this.value = this.validateRoughness(value);
    }

    private validateRoughness(value: number): number {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new ValidationError(
                `Invalid roughness value: ${value}`,
                ['Roughness must be between 0 and 1']
            );
        }
        return value;
    }

    static create(value: number): Roughness {
        return new Roughness(value);
    }

    static smooth(): Roughness {
        return new Roughness(0);
    }

    static rough(): Roughness {
        return new Roughness(1);
    }

    static default(): Roughness {
        return new Roughness(0.5);
    }

    equals(other: Roughness): boolean {
        return Math.abs(this.value - other.value) < 1e-6;
    }

    toString(): string {
        return `Roughness(${this.value})`;
    }
}

/**
 * Émission de lumière
 */
export class Emission {
    readonly value: number;

    constructor(value: number) {
        this.value = this.validateEmission(value);
    }

    private validateEmission(value: number): number {
        if (!Number.isFinite(value) || value < 0) {
            throw new ValidationError(
                `Invalid emission value: ${value}`,
                ['Emission must be a non-negative number']
            );
        }
        return value;
    }

    static create(value: number): Emission {
        return new Emission(value);
    }

    static none(): Emission {
        return new Emission(0);
    }

    static default(): Emission {
        return new Emission(0);
    }

    multiply(factor: number): Emission {
        return new Emission(this.value * factor);
    }

    equals(other: Emission): boolean {
        return Math.abs(this.value - other.value) < 1e-6;
    }

    toString(): string {
        return `Emission(${this.value})`;
    }
}

/**
 * Indice de réfraction
 */
export class RefractiveIndex {
    readonly value: number;

    constructor(value: number) {
        this.value = this.validateRefractiveIndex(value);
    }

    private validateRefractiveIndex(value: number): number {
        if (!Number.isFinite(value) || value < 1) {
            throw new ValidationError(
                `Invalid refractive index: ${value}`,
                ['Refractive index must be >= 1']
            );
        }
        return value;
    }

    static create(value: number): RefractiveIndex {
        return new RefractiveIndex(value);
    }

    static air(): RefractiveIndex {
        return new RefractiveIndex(1.0);
    }

    static water(): RefractiveIndex {
        return new RefractiveIndex(1.33);
    }

    static glass(): RefractiveIndex {
        return new RefractiveIndex(1.5);
    }

    static diamond(): RefractiveIndex {
        return new RefractiveIndex(2.42);
    }

    static default(): RefractiveIndex {
        return RefractiveIndex.glass();
    }

    equals(other: RefractiveIndex): boolean {
        return Math.abs(this.value - other.value) < 1e-6;
    }

    toString(): string {
        return `RefractiveIndex(${this.value})`;
    }
}

/**
 * Chemin vers une texture
 */
export class TexturePath {
    readonly path: string;

    constructor(path: string) {
        this.path = this.validatePath(path);
    }

    private validatePath(path: string): string {
        if (!path || path.trim().length === 0) {
            throw new ValidationError(
                'Texture path cannot be empty',
                ['Path must be a non-empty string']
            );
        }
        return path.trim();
    }

    static create(path: string): TexturePath {
        return new TexturePath(path);
    }

    get filename(): string {
        return this.path.split('/').pop() || '';
    }

    get extension(): string {
        const filename = this.filename;
        const lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : '';
    }

    equals(other: TexturePath): boolean {
        return this.path === other.path;
    }

    toString(): string {
        return `TexturePath("${this.path}")`;
    }
}

/**
 * Propriétés d'une texture
 */
export class TextureProperties {
    readonly path: TexturePath;
    readonly wrapS: TextureWrap;
    readonly wrapT: TextureWrap;
    readonly repeat: TextureRepeat;
    readonly offset: TextureOffset;

    constructor(
        path: TexturePath,
        wrapS: TextureWrap = TextureWrap.repeat(),
        wrapT: TextureWrap = TextureWrap.repeat(),
        repeat: TextureRepeat = TextureRepeat.default(),
        offset: TextureOffset = TextureOffset.default()
    ) {
        this.path = path;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.repeat = repeat;
        this.offset = offset;
    }

    static create(path: string): TextureProperties {
        return new TextureProperties(TexturePath.create(path));
    }

    withWrap(wrapS: TextureWrap, wrapT?: TextureWrap): TextureProperties {
        return new TextureProperties(
            this.path,
            wrapS,
            wrapT || wrapS,
            this.repeat,
            this.offset
        );
    }

    withRepeat(repeat: TextureRepeat): TextureProperties {
        return new TextureProperties(
            this.path,
            this.wrapS,
            this.wrapT,
            repeat,
            this.offset
        );
    }

    withOffset(offset: TextureOffset): TextureProperties {
        return new TextureProperties(
            this.path,
            this.wrapS,
            this.wrapT,
            this.repeat,
            offset
        );
    }

    equals(other: TextureProperties): boolean {
        return (
            this.path.equals(other.path) &&
            this.wrapS.equals(other.wrapS) &&
            this.wrapT.equals(other.wrapT) &&
            this.repeat.equals(other.repeat) &&
            this.offset.equals(other.offset)
        );
    }

    toString(): string {
        return `TextureProperties(${this.path})`;
    }
}

/**
 * Mode de répétition de texture
 */
export enum TextureWrapMode {
    REPEAT = 'repeat',
    CLAMP_TO_EDGE = 'clampToEdge',
    MIRRORED_REPEAT = 'mirroredRepeat'
}

export class TextureWrap {
    readonly mode: TextureWrapMode;

    constructor(mode: TextureWrapMode) {
        this.mode = mode;
    }

    static repeat(): TextureWrap {
        return new TextureWrap(TextureWrapMode.REPEAT);
    }

    static clampToEdge(): TextureWrap {
        return new TextureWrap(TextureWrapMode.CLAMP_TO_EDGE);
    }

    static mirroredRepeat(): TextureWrap {
        return new TextureWrap(TextureWrapMode.MIRRORED_REPEAT);
    }

    equals(other: TextureWrap): boolean {
        return this.mode === other.mode;
    }

    toString(): string {
        return `TextureWrap(${this.mode})`;
    }
}

/**
 * Répétition de texture
 */
export class TextureRepeat {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = this.validateRepeat(x, 'x');
        this.y = this.validateRepeat(y, 'y');
    }

    private validateRepeat(value: number, axis: string): number {
        if (!Number.isFinite(value) || value <= 0) {
            throw new ValidationError(
                `Invalid texture repeat ${axis}: ${value}`,
                [`Texture repeat ${axis} must be positive`]
            );
        }
        return value;
    }

    static create(x: number, y: number): TextureRepeat {
        return new TextureRepeat(x, y);
    }

    static uniform(value: number): TextureRepeat {
        return new TextureRepeat(value, value);
    }

    static default(): TextureRepeat {
        return new TextureRepeat(1, 1);
    }

    equals(other: TextureRepeat): boolean {
        const epsilon = 1e-6;
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon
        );
    }

    toString(): string {
        return `TextureRepeat(${this.x}, ${this.y})`;
    }
}

/**
 * Décalage de texture
 */
export class TextureOffset {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = this.validateOffset(x);
        this.y = this.validateOffset(y);
    }

    private validateOffset(value: number): number {
        if (!Number.isFinite(value)) {
            throw new ValidationError(
                `Invalid texture offset: ${value}`,
                ['Texture offset must be finite']
            );
        }
        return value;
    }

    static create(x: number, y: number): TextureOffset {
        return new TextureOffset(x, y);
    }

    static zero(): TextureOffset {
        return new TextureOffset(0, 0);
    }

    static default(): TextureOffset {
        return TextureOffset.zero();
    }

    equals(other: TextureOffset): boolean {
        const epsilon = 1e-6;
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon
        );
    }

    toString(): string {
        return `TextureOffset(${this.x}, ${this.y})`;
    }
}

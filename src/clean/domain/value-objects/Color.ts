/**
 * Value Objects pour les couleurs
 */

import { ValidationError } from '@/shared/utils';

/**
 * Couleur RGB immutable
 */
export class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;

    constructor(r: number, g: number, b: number) {
        this.r = this.validateComponent(r, 'red');
        this.g = this.validateComponent(g, 'green');
        this.b = this.validateComponent(b, 'blue');
    }

    private validateComponent(value: number, componentName: string): number {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new ValidationError(
                `Invalid ${componentName} component: ${value}`,
                [`${componentName} component must be between 0 and 1`]
            );
        }
        return value;
    }

    static create(r: number, g: number, b: number): Color {
        return new Color(r, g, b);
    }

    static white(): Color {
        return new Color(1, 1, 1);
    }

    static black(): Color {
        return new Color(0, 0, 0);
    }

    static red(): Color {
        return new Color(1, 0, 0);
    }

    static green(): Color {
        return new Color(0, 1, 0);
    }

    static blue(): Color {
        return new Color(0, 0, 1);
    }

    /**
     * Créer depuis des valeurs 0-255
     */
    static fromRGB255(r: number, g: number, b: number): Color {
        return new Color(r / 255, g / 255, b / 255);
    }

    /**
     * Créer depuis une chaîne hexadécimale
     */
    static fromHex(hex: string): Color {
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length !== 6) {
            throw new ValidationError(
                `Invalid hex color: ${hex}`,
                ['Hex color must be in format #RRGGBB']
            );
        }

        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

        return new Color(r, g, b);
    }

    static fromObject(obj: { r: number; g: number; b: number }): Color {
        return new Color(obj.r, obj.g, obj.b);
    }

    /**
     * Conversion vers format 0-255
     */
    toRGB255(): { r: number; g: number; b: number } {
        return {
            r: Math.round(this.r * 255),
            g: Math.round(this.g * 255),
            b: Math.round(this.b * 255)
        };
    }

    /**
     * Conversion vers hexadécimal
     */
    toHex(): string {
        const rgb255 = this.toRGB255();
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(rgb255.r)}${toHex(rgb255.g)}${toHex(rgb255.b)}`;
    }

    toObject(): { r: number; g: number; b: number } {
        return { r: this.r, g: this.g, b: this.b };
    }

    /**
     * Opérations sur les couleurs
     */
    multiply(scalar: number): Color {
        return new Color(
            Math.min(1, this.r * scalar),
            Math.min(1, this.g * scalar),
            Math.min(1, this.b * scalar)
        );
    }

    add(other: Color): Color {
        return new Color(
            Math.min(1, this.r + other.r),
            Math.min(1, this.g + other.g),
            Math.min(1, this.b + other.b)
        );
    }

    /**
     * Mélange avec une autre couleur
     */
    mix(other: Color, ratio: number): Color {
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        const invRatio = 1 - clampedRatio;
        
        return new Color(
            this.r * invRatio + other.r * clampedRatio,
            this.g * invRatio + other.g * clampedRatio,
            this.b * invRatio + other.b * clampedRatio
        );
    }

    /**
     * Luminosité perçue
     */
    getLuminance(): number {
        // Formule de luminance relative (sRGB)
        return 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
    }

    /**
     * Contraste avec une autre couleur
     */
    getContrast(other: Color): number {
        const l1 = this.getLuminance();
        const l2 = other.getLuminance();
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    equals(other: Color): boolean {
        const epsilon = 1e-6;
        return (
            Math.abs(this.r - other.r) < epsilon &&
            Math.abs(this.g - other.g) < epsilon &&
            Math.abs(this.b - other.b) < epsilon
        );
    }

    toString(): string {
        return `Color(${this.r.toFixed(3)}, ${this.g.toFixed(3)}, ${this.b.toFixed(3)})`;
    }
}

/**
 * Couleur RGBA avec transparence
 */
export class ColorRGBA extends Color {
    readonly a: number;

    constructor(r: number, g: number, b: number, a: number) {
        super(r, g, b);
        this.a = this.validateAlpha(a);
    }

    private validateAlpha(value: number): number {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new ValidationError(
                `Invalid alpha component: ${value}`,
                ['Alpha component must be between 0 and 1']
            );
        }
        return value;
    }

    static create(r: number, g: number, b: number, a: number): ColorRGBA {
        return new ColorRGBA(r, g, b, a);
    }

    static fromColor(color: Color, alpha: number = 1): ColorRGBA {
        return new ColorRGBA(color.r, color.g, color.b, alpha);
    }

    static transparent(): ColorRGBA {
        return new ColorRGBA(0, 0, 0, 0);
    }

    static opaque(r: number, g: number, b: number): ColorRGBA {
        return new ColorRGBA(r, g, b, 1);
    }

    withAlpha(alpha: number): ColorRGBA {
        return new ColorRGBA(this.r, this.g, this.b, alpha);
    }

    toRGBA255(): { r: number; g: number; b: number; a: number } {
        const rgb = this.toRGB255();
        return { ...rgb, a: Math.round(this.a * 255) };
    }

    toObject(): { r: number; g: number; b: number; a: number } {
        return { r: this.r, g: this.g, b: this.b, a: this.a };
    }

    equals(other: ColorRGBA): boolean {
        const epsilon = 1e-6;
        return super.equals(other) && Math.abs(this.a - other.a) < epsilon;
    }

    toString(): string {
        return `ColorRGBA(${this.r.toFixed(3)}, ${this.g.toFixed(3)}, ${this.b.toFixed(3)}, ${this.a.toFixed(3)})`;
    }
}

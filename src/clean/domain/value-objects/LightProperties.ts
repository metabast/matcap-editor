/**
 * Value Objects pour l'intensité et les propriétés physiques des lumières
 */

import { ValidationError } from '@/shared/utils';

/**
 * Intensité de lumière
 */
export class Intensity {
    readonly value: number;

    constructor(value: number) {
        this.value = this.validateIntensity(value);
    }

    private validateIntensity(value: number): number {
        if (!Number.isFinite(value) || value < 0) {
            throw new ValidationError(
                `Invalid intensity value: ${value}`,
                ['Intensity must be a non-negative number']
            );
        }
        return value;
    }

    static create(value: number): Intensity {
        return new Intensity(value);
    }

    static zero(): Intensity {
        return new Intensity(0);
    }

    static normal(): Intensity {
        return new Intensity(1);
    }

    multiply(factor: number): Intensity {
        return new Intensity(this.value * factor);
    }

    add(other: Intensity): Intensity {
        return new Intensity(this.value + other.value);
    }

    equals(other: Intensity): boolean {
        return Math.abs(this.value - other.value) < 1e-6;
    }

    toString(): string {
        return `Intensity(${this.value})`;
    }
}

/**
 * Distance (pour l'atténuation des lumières)
 */
export class Distance {
    readonly value: number;

    constructor(value: number) {
        this.value = this.validateDistance(value);
    }

    private validateDistance(value: number): number {
        if (!Number.isFinite(value) || value < 0) {
            throw new ValidationError(
                `Invalid distance value: ${value}`,
                ['Distance must be a non-negative number']
            );
        }
        return value;
    }

    static create(value: number): Distance {
        return new Distance(value);
    }

    static zero(): Distance {
        return new Distance(0);
    }

    static infinite(): Distance {
        return new Distance(0); // 0 = pas d'atténuation
    }

    static meters(value: number): Distance {
        return new Distance(value);
    }

    multiply(factor: number): Distance {
        return new Distance(this.value * factor);
    }

    equals(other: Distance): boolean {
        return Math.abs(this.value - other.value) < 1e-6;
    }

    toString(): string {
        return `Distance(${this.value})`;
    }
}

/**
 * Angle (en radians)
 */
export class Angle {
    readonly radians: number;

    constructor(radians: number) {
        this.radians = this.validateAngle(radians);
    }

    private validateAngle(value: number): number {
        if (!Number.isFinite(value)) {
            throw new ValidationError(
                `Invalid angle value: ${value}`,
                ['Angle must be a finite number']
            );
        }
        return value;
    }

    static create(radians: number): Angle {
        return new Angle(radians);
    }

    static fromDegrees(degrees: number): Angle {
        return new Angle((degrees * Math.PI) / 180);
    }

    static zero(): Angle {
        return new Angle(0);
    }

    static rightAngle(): Angle {
        return new Angle(Math.PI / 2);
    }

    static fullCircle(): Angle {
        return new Angle(2 * Math.PI);
    }

    get degrees(): number {
        return (this.radians * 180) / Math.PI;
    }

    normalize(): Angle {
        let normalized = this.radians % (2 * Math.PI);
        if (normalized < 0) {
            normalized += 2 * Math.PI;
        }
        return new Angle(normalized);
    }

    add(other: Angle): Angle {
        return new Angle(this.radians + other.radians);
    }

    subtract(other: Angle): Angle {
        return new Angle(this.radians - other.radians);
    }

    multiply(factor: number): Angle {
        return new Angle(this.radians * factor);
    }

    equals(other: Angle): boolean {
        return Math.abs(this.radians - other.radians) < 1e-6;
    }

    toString(): string {
        return `Angle(${this.degrees.toFixed(2)}°)`;
    }
}

/**
 * Taille/dimensions pour les lumières area
 */
export class Size {
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number) {
        this.width = this.validateDimension(width, 'width');
        this.height = this.validateDimension(height, 'height');
    }

    private validateDimension(value: number, dimension: string): number {
        if (!Number.isFinite(value) || value <= 0) {
            throw new ValidationError(
                `Invalid ${dimension} value: ${value}`,
                [`${dimension} must be a positive number`]
            );
        }
        return value;
    }

    static create(width: number, height: number): Size {
        return new Size(width, height);
    }

    static square(side: number): Size {
        return new Size(side, side);
    }

    static unit(): Size {
        return new Size(1, 1);
    }

    get area(): number {
        return this.width * this.height;
    }

    get aspectRatio(): number {
        return this.width / this.height;
    }

    scale(factor: number): Size {
        return new Size(this.width * factor, this.height * factor);
    }

    scaleWidth(factor: number): Size {
        return new Size(this.width * factor, this.height);
    }

    scaleHeight(factor: number): Size {
        return new Size(this.width, this.height * factor);
    }

    equals(other: Size): boolean {
        const epsilon = 1e-6;
        return (
            Math.abs(this.width - other.width) < epsilon &&
            Math.abs(this.height - other.height) < epsilon
        );
    }

    toString(): string {
        return `Size(${this.width} × ${this.height})`;
    }
}

/**
 * Propriétés pour SpotLight
 */
export class SpotLightProperties {
    readonly angle: Angle;
    readonly penumbra: number;

    constructor(angle: Angle, penumbra: number) {
        this.angle = angle;
        this.penumbra = this.validatePenumbra(penumbra);
    }

    private validatePenumbra(value: number): number {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new ValidationError(
                `Invalid penumbra value: ${value}`,
                ['Penumbra must be between 0 and 1']
            );
        }
        return value;
    }

    static create(angle: Angle, penumbra: number): SpotLightProperties {
        return new SpotLightProperties(angle, penumbra);
    }

    static default(): SpotLightProperties {
        return new SpotLightProperties(
            Angle.fromDegrees(45),
            0.1
        );
    }

    withAngle(angle: Angle): SpotLightProperties {
        return new SpotLightProperties(angle, this.penumbra);
    }

    withPenumbra(penumbra: number): SpotLightProperties {
        return new SpotLightProperties(this.angle, penumbra);
    }

    equals(other: SpotLightProperties): boolean {
        const epsilon = 1e-6;
        return (
            this.angle.equals(other.angle) &&
            Math.abs(this.penumbra - other.penumbra) < epsilon
        );
    }

    toString(): string {
        return `SpotLightProperties(angle: ${this.angle}, penumbra: ${this.penumbra})`;
    }
}

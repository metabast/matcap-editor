/**
 * Value Objects pour les positions et transformations 3D
 */

import { ValidationError } from '@/shared/utils';

/**
 * Position 3D immutable
 */
export class Position {
    readonly x: number;
    readonly y: number;
    readonly z: number;

    constructor(x: number, y: number, z: number) {
        this.validateCoordinate(x, 'x');
        this.validateCoordinate(y, 'y');
        this.validateCoordinate(z, 'z');
        
        this.x = x;
        this.y = y;
        this.z = z;
    }

    private validateCoordinate(value: number, axis: string): void {
        if (!Number.isFinite(value)) {
            throw new ValidationError(
                `Invalid ${axis} coordinate: ${value}`,
                [`${axis} must be a finite number`]
            );
        }
    }

    static create(x: number, y: number, z: number): Position {
        return new Position(x, y, z);
    }

    static origin(): Position {
        return new Position(0, 0, 0);
    }

    static fromObject(obj: { x: number; y: number; z: number }): Position {
        return new Position(obj.x, obj.y, obj.z);
    }

    /**
     * Créer une nouvelle position avec des modifications
     */
    withX(x: number): Position {
        return new Position(x, this.y, this.z);
    }

    withY(y: number): Position {
        return new Position(this.x, y, this.z);
    }

    withZ(z: number): Position {
        return new Position(this.x, this.y, z);
    }

    /**
     * Opérations vectorielles
     */
    add(other: Position): Position {
        return new Position(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
        );
    }

    subtract(other: Position): Position {
        return new Position(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
        );
    }

    multiply(scalar: number): Position {
        return new Position(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }

    /**
     * Distance euclidienne
     */
    distanceTo(other: Position): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Longueur du vecteur
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Normalisation
     */
    normalize(): Position {
        const len = this.length();
        if (len === 0) {
            return Position.origin();
        }
        return new Position(this.x / len, this.y / len, this.z / len);
    }

    /**
     * Conversion vers objet simple
     */
    toObject(): { x: number; y: number; z: number } {
        return { x: this.x, y: this.y, z: this.z };
    }

    /**
     * Égalité
     */
    equals(other: Position): boolean {
        const epsilon = 1e-10;
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.z - other.z) < epsilon
        );
    }

    toString(): string {
        return `Position(${this.x}, ${this.y}, ${this.z})`;
    }
}

/**
 * Rotation 3D immutable (en radians)
 */
export class Rotation {
    readonly x: number;
    readonly y: number;
    readonly z: number;

    constructor(x: number, y: number, z: number) {
        this.x = this.normalizeAngle(x);
        this.y = this.normalizeAngle(y);
        this.z = this.normalizeAngle(z);
    }

    private normalizeAngle(angle: number): number {
        if (!Number.isFinite(angle)) {
            throw new ValidationError(
                `Invalid rotation angle: ${angle}`,
                ['Rotation angle must be a finite number']
            );
        }
        // Normaliser entre -π et π
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    static create(x: number, y: number, z: number): Rotation {
        return new Rotation(x, y, z);
    }

    static zero(): Rotation {
        return new Rotation(0, 0, 0);
    }

    static identity(): Rotation {
        return new Rotation(0, 0, 0);
    }

    static fromEuler(x: number, y: number, z: number): Rotation {
        return new Rotation(x, y, z);
    }

    static fromDegrees(x: number, y: number, z: number): Rotation {
        return new Rotation(
            (x * Math.PI) / 180,
            (y * Math.PI) / 180,
            (z * Math.PI) / 180
        );
    }

    static fromObject(obj: { x: number; y: number; z: number }): Rotation {
        return new Rotation(obj.x, obj.y, obj.z);
    }

    /**
     * Conversion en degrés
     */
    toDegrees(): { x: number; y: number; z: number } {
        return {
            x: (this.x * 180) / Math.PI,
            y: (this.y * 180) / Math.PI,
            z: (this.z * 180) / Math.PI
        };
    }

    toObject(): { x: number; y: number; z: number } {
        return { x: this.x, y: this.y, z: this.z };
    }

    equals(other: Rotation): boolean {
        const epsilon = 1e-10;
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.z - other.z) < epsilon
        );
    }

    toString(): string {
        return `Rotation(${this.x}, ${this.y}, ${this.z})`;
    }
}

/**
 * Transformation 3D complète
 */
export class Transform {
    readonly position: Position;
    readonly rotation: Rotation;

    constructor(position: Position, rotation: Rotation) {
        this.position = position;
        this.rotation = rotation;
    }

    static create(position: Position, rotation: Rotation): Transform {
        return new Transform(position, rotation);
    }

    static identity(): Transform {
        return new Transform(Position.origin(), Rotation.zero());
    }

    static fromPositionOnly(position: Position): Transform {
        return new Transform(position, Rotation.zero());
    }

    withPosition(position: Position): Transform {
        return new Transform(position, this.rotation);
    }

    withRotation(rotation: Rotation): Transform {
        return new Transform(this.position, rotation);
    }

    toObject(): {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
    } {
        return {
            position: this.position.toObject(),
            rotation: this.rotation.toObject()
        };
    }

    equals(other: Transform): boolean {
        return this.position.equals(other.position) && 
               this.rotation.equals(other.rotation);
    }

    toString(): string {
        return `Transform(${this.position}, ${this.rotation})`;
    }
}

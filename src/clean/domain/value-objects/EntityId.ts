/**
 * Value Object pour les identifiants d'entité
 * 
 * Encapsule la logique de validation et de génération des IDs
 */

import { generateId, isValidId } from '@/shared/utils';
import { ValidationError } from '@/shared/utils';

export abstract class EntityId {
    protected readonly _value: string;

    constructor(value?: string) {
        this._value = value || this.generateId();
        this.validate();
    }

    protected generateId(): string {
        return crypto.randomUUID();
    }

    protected validate(): void {
        if (!this._value || this._value.trim().length === 0) {
            throw new ValidationError(
                'EntityId cannot be empty',
                ['ID must be a non-empty string']
            );
        }
    }

    get value(): string {
        return this._value;
    }

    equals(other: EntityId): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }

    static isValid(value: string): boolean {
        return value != null && value.trim().length > 0;
    }
}

/**
 * Identifiant spécifique pour les lumières
 */
export class LightId extends EntityId {
    protected getPrefix(): string {
        return 'light';
    }

    static create(value?: string): LightId {
        return new LightId(value);
    }

    static fromString(value: string): LightId {
        return new LightId(value);
    }
}

/**
 * Identifiant spécifique pour les matériaux
 */
export class MaterialId extends EntityId {
    protected getPrefix(): string {
        return 'material';
    }

    static create(value?: string): MaterialId {
        return new MaterialId(value);
    }

    static fromString(value: string): MaterialId {
        return new MaterialId(value);
    }
}

/**
 * Identifiant spécifique pour les projets
 */
export class ProjectId extends EntityId {
    protected getPrefix(): string {
        return 'project';
    }

    static create(value?: string): ProjectId {
        return new ProjectId(value);
    }

    static fromString(value: string): ProjectId {
        return new ProjectId(value);
    }
}

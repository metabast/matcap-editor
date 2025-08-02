/**
 * Classe de base pour toutes les entités du domaine
 */

import { EntityId } from '@/clean/domain/value-objects/EntityId';

/**
 * Classe abstraite pour les entités du domaine
 * Une entité est définie par son identité unique
 */
export abstract class Entity<T extends EntityId> {
    public readonly id: T;
    protected readonly _createdAt: Date;

    constructor(id: T) {
        this.id = id;
        this._createdAt = new Date();
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    /**
     * Deux entités sont égales si elles ont le même ID
     */
    equals(other: Entity<T>): boolean {
        if (!(other instanceof Entity)) {
            return false;
        }
        return this.id.equals(other.id);
    }

    /**
     * Hash code basé sur l'ID
     */
    hashCode(): string {
        return this.id.value;
    }

    toString(): string {
        return `${this.constructor.name}(${this.id})`;
    }
}

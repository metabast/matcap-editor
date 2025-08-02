/**
 * PHASE 3 - ENTITÉ LIGHT CLEAN ARCHITECTURE
 * Entité de domaine pure pour les lumières
 */

import { LightId } from '@/clean/domain/value-objects/EntityId';
import { Transform } from '@/clean/domain/value-objects/Transform';
import { Color } from '@/clean/domain/value-objects/Color';
import { Intensity, Distance, Size, SpotLightProperties } from '@/clean/domain/value-objects/LightProperties';
import { ValidationError } from '@/shared/utils';
import { Entity } from '@/clean/domain/entities/Entity';

/**
 * Types de lumières supportés
 */
export enum LightType {
    AMBIENT = 'ambient',
    DIRECTIONAL = 'directional',
    POINT = 'point',
    SPOT = 'spot',
    AREA = 'area'
}

/**
 * Propriétés de base communes à toutes les lumières
 */
export interface BaseLightProperties {
    name: string;
    color: Color;
    intensity: Intensity;
    visible: boolean;
    enabled: boolean;
}

/**
 * Propriétés spécifiques aux lumières avec position
 */
export interface PositionalLightProperties extends BaseLightProperties {
    transform: Transform;
    distance: Distance;
    castShadow: boolean;
}

/**
 * Propriétés pour les lumières directionnelles
 */
export interface DirectionalLightProperties extends BaseLightProperties {
    transform: Transform;
    castShadow: boolean;
    target?: Transform;
}

/**
 * Propriétés pour les lumières spot
 */
export interface SpotLightSpecificProperties extends PositionalLightProperties {
    spotProperties: SpotLightProperties;
    target?: Transform;
}

/**
 * Propriétés pour les lumières area
 */
export interface AreaLightProperties extends PositionalLightProperties {
    size: Size;
}

/**
 * Union des propriétés selon le type
 */
export type LightProperties = 
    | ({ type: LightType.AMBIENT } & BaseLightProperties)
    | ({ type: LightType.DIRECTIONAL } & DirectionalLightProperties)
    | ({ type: LightType.POINT } & PositionalLightProperties)
    | ({ type: LightType.SPOT } & SpotLightSpecificProperties)
    | ({ type: LightType.AREA } & AreaLightProperties);

/**
 * Entité Light
 */
export class Light extends Entity<LightId> {
    private _properties: LightProperties;

    constructor(id: LightId, properties: LightProperties) {
        super(id);
        this._properties = this.validateProperties(properties);
    }

    private validateProperties(properties: LightProperties): LightProperties {
        // Validation du nom
        if (!properties.name || properties.name.trim().length === 0) {
            throw new ValidationError(
                'Light name cannot be empty',
                ['Name must be a non-empty string']
            );
        }

        // Validation spécifique selon le type
        switch (properties.type) {
            case LightType.AMBIENT:
                return this.validateAmbientLight(properties);
            case LightType.DIRECTIONAL:
                return this.validateDirectionalLight(properties);
            case LightType.POINT:
                return this.validatePointLight(properties);
            case LightType.SPOT:
                return this.validateSpotLight(properties);
            case LightType.AREA:
                return this.validateAreaLight(properties);
            default:
                throw new ValidationError(
                    `Unknown light type: ${(properties as any).type}`,
                    ['Light type must be one of: ambient, directional, point, spot, area']
                );
        }
    }

    private validateAmbientLight(properties: LightProperties): LightProperties {
        if (properties.type !== LightType.AMBIENT) {
            throw new ValidationError('Invalid ambient light properties', []);
        }
        return properties;
    }

    private validateDirectionalLight(properties: LightProperties): LightProperties {
        if (properties.type !== LightType.DIRECTIONAL) {
            throw new ValidationError('Invalid directional light properties', []);
        }
        return properties;
    }

    private validatePointLight(properties: LightProperties): LightProperties {
        if (properties.type !== LightType.POINT) {
            throw new ValidationError('Invalid point light properties', []);
        }
        return properties;
    }

    private validateSpotLight(properties: LightProperties): LightProperties {
        if (properties.type !== LightType.SPOT) {
            throw new ValidationError('Invalid spot light properties', []);
        }
        return properties;
    }

    private validateAreaLight(properties: LightProperties): LightProperties {
        if (properties.type !== LightType.AREA) {
            throw new ValidationError('Invalid area light properties', []);
        }
        return properties;
    }

    // Getters pour les propriétés
    get type(): LightType {
        return this._properties.type;
    }

    get name(): string {
        return this._properties.name;
    }

    get color(): Color {
        return this._properties.color;
    }

    get intensity(): Intensity {
        return this._properties.intensity;
    }

    get visible(): boolean {
        return this._properties.visible;
    }

    get enabled(): boolean {
        return this._properties.enabled;
    }

    get properties(): LightProperties {
        return this._properties;
    }

    // Méthodes spécifiques selon le type
    get transform(): Transform | undefined {
        if ('transform' in this._properties) {
            return this._properties.transform;
        }
        return undefined;
    }

    get distance(): Distance | undefined {
        if ('distance' in this._properties) {
            return this._properties.distance;
        }
        return undefined;
    }

    get castShadow(): boolean | undefined {
        if ('castShadow' in this._properties) {
            return this._properties.castShadow;
        }
        return undefined;
    }

    get target(): Transform | undefined {
        if ('target' in this._properties) {
            return this._properties.target;
        }
        return undefined;
    }

    get spotProperties(): SpotLightProperties | undefined {
        if (this.type === LightType.SPOT && 'spotProperties' in this._properties) {
            return this._properties.spotProperties;
        }
        return undefined;
    }

    get size(): Size | undefined {
        if (this.type === LightType.AREA && 'size' in this._properties) {
            return this._properties.size;
        }
        return undefined;
    }

    // Méthodes de modification (retournent une nouvelle instance)
    updateName(name: string): Light {
        return new Light(this.id, {
            ...this._properties,
            name: name.trim()
        });
    }

    updateColor(color: Color): Light {
        return new Light(this.id, {
            ...this._properties,
            color
        });
    }

    updateIntensity(intensity: Intensity): Light {
        return new Light(this.id, {
            ...this._properties,
            intensity
        });
    }

    updateVisibility(visible: boolean): Light {
        return new Light(this.id, {
            ...this._properties,
            visible
        });
    }

    updateEnabled(enabled: boolean): Light {
        return new Light(this.id, {
            ...this._properties,
            enabled
        });
    }

    updateTransform(transform: Transform): Light {
        if (!('transform' in this._properties)) {
            throw new ValidationError(
                `Light type ${this.type} does not support transform`,
                []
            );
        }

        return new Light(this.id, {
            ...this._properties,
            transform
        } as LightProperties);
    }

    updateDistance(distance: Distance): Light {
        if (!('distance' in this._properties)) {
            throw new ValidationError(
                `Light type ${this.type} does not support distance`,
                []
            );
        }

        return new Light(this.id, {
            ...this._properties,
            distance
        } as LightProperties);
    }

    updateCastShadow(castShadow: boolean): Light {
        if (!('castShadow' in this._properties)) {
            throw new ValidationError(
                `Light type ${this.type} does not support shadows`,
                []
            );
        }

        return new Light(this.id, {
            ...this._properties,
            castShadow
        } as LightProperties);
    }

    updateTarget(target: Transform): Light {
        if (!('target' in this._properties)) {
            throw new ValidationError(
                `Light type ${this.type} does not support target`,
                []
            );
        }

        return new Light(this.id, {
            ...this._properties,
            target
        } as LightProperties);
    }

    updateSpotProperties(spotProperties: SpotLightProperties): Light {
        if (this.type !== LightType.SPOT) {
            throw new ValidationError(
                `Light type ${this.type} does not support spot properties`,
                []
            );
        }

        return new Light(this.id, {
            ...this._properties,
            spotProperties
        } as LightProperties);
    }

    updateSize(size: Size): Light {
        if (this.type !== LightType.AREA) {
            throw new ValidationError(
                `Light type ${this.type} does not support size`,
                []
            );
        }

        return new Light(this.id, {
            ...this._properties,
            size
        } as LightProperties);
    }

    // Méthodes utilitaires
    isPositional(): boolean {
        return this.type !== LightType.AMBIENT;
    }

    hasTransform(): boolean {
        return 'transform' in this._properties;
    }

    hasTarget(): boolean {
        return 'target' in this._properties && this._properties.target !== undefined;
    }

    canCastShadow(): boolean {
        return 'castShadow' in this._properties;
    }

    // Factory methods
    static createAmbient(
        id: LightId,
        name: string,
        color: Color = Color.white(),
        intensity: Intensity = Intensity.normal()
    ): Light {
        return new Light(id, {
            type: LightType.AMBIENT,
            name,
            color,
            intensity,
            visible: true,
            enabled: true
        });
    }

    static createDirectional(
        id: LightId,
        name: string,
        transform: Transform,
        color: Color = Color.white(),
        intensity: Intensity = Intensity.normal(),
        castShadow: boolean = false,
        target?: Transform
    ): Light {
        return new Light(id, {
            type: LightType.DIRECTIONAL,
            name,
            color,
            intensity,
            visible: true,
            enabled: true,
            transform,
            castShadow,
            target
        });
    }

    static createPoint(
        id: LightId,
        name: string,
        transform: Transform,
        color: Color = Color.white(),
        intensity: Intensity = Intensity.normal(),
        distance: Distance = Distance.infinite(),
        castShadow: boolean = false
    ): Light {
        return new Light(id, {
            type: LightType.POINT,
            name,
            color,
            intensity,
            visible: true,
            enabled: true,
            transform,
            distance,
            castShadow
        });
    }

    static createSpot(
        id: LightId,
        name: string,
        transform: Transform,
        spotProperties: SpotLightProperties,
        color: Color = Color.white(),
        intensity: Intensity = Intensity.normal(),
        distance: Distance = Distance.infinite(),
        castShadow: boolean = false,
        target?: Transform
    ): Light {
        return new Light(id, {
            type: LightType.SPOT,
            name,
            color,
            intensity,
            visible: true,
            enabled: true,
            transform,
            distance,
            castShadow,
            spotProperties,
            target
        });
    }

    static createArea(
        id: LightId,
        name: string,
        transform: Transform,
        size: Size,
        color: Color = Color.white(),
        intensity: Intensity = Intensity.normal(),
        distance: Distance = Distance.infinite(),
        castShadow: boolean = false
    ): Light {
        return new Light(id, {
            type: LightType.AREA,
            name,
            color,
            intensity,
            visible: true,
            enabled: true,
            transform,
            distance,
            castShadow,
            size
        });
    }

    equals(other: Light): boolean {
        return this.id.equals(other.id);
    }

    toString(): string {
        return `Light(${this.id}, ${this.type}, "${this.name}")`;
    }
}

/**
 * Types partagés pour la migration Clean Architecture
 */

// ========== IDENTIFIANTS ==========

export type EntityId = string;
export type LightId = EntityId;
export type MaterialId = EntityId;
export type ProjectId = EntityId;

// ========== TYPES GÉOMÉTRIQUES ==========

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Rotation {
    x: number;
    y: number;
    z: number;
}

export interface Scale {
    x: number;
    y: number;
    z: number;
}

export interface Transform {
    position: Position;
    rotation: Rotation;
    scale: Scale;
}

// ========== TYPES COULEUR ==========

export interface Color {
    r: number;
    g: number;
    b: number;
}

export interface ColorRGBA extends Color {
    a: number;
}

// ========== TYPES LUMIÈRE ==========

export enum LightType {
    RECT_AREA = 'RECT_AREA',
    SPOT = 'SPOT',
    DIRECTIONAL = 'DIRECTIONAL',
    POINT = 'POINT'
}

export interface BaseLightProperties {
    intensity: number;
    color: Color;
    castShadow: boolean;
}

export interface SpotLightProperties extends BaseLightProperties {
    angle: number;
    penumbra: number;
    decay: number;
    distance: number;
}

export interface RectAreaLightProperties extends BaseLightProperties {
    width: number;
    height: number;
}

export interface DirectionalLightProperties extends BaseLightProperties {
    target: Position;
}

export interface PointLightProperties extends BaseLightProperties {
    decay: number;
    distance: number;
}

// ========== TYPES MATÉRIAU ==========

export interface MaterialProperties {
    metalness: number;
    roughness: number;
    map?: string; // URL de la texture
    normalMap?: string;
    envMapIntensity: number;
}

// ========== TYPES PROJET ==========

export interface ProjectMetadata {
    name: string;
    description?: string;
    createdAt: Date;
    modifiedAt: Date;
    version: string;
}

// ========== TYPES RÉSULTAT ==========

export interface Result<T, E = Error> {
    success: boolean;
    data?: T;
    error?: E;
}

export class Success<T> implements Result<T> {
    readonly success = true;
    constructor(public readonly data: T) {}
    
    static create<T>(data: T): Success<T> {
        return new Success(data);
    }
}

export class Failure<E = Error> implements Result<never, E> {
    readonly success = false;
    constructor(public readonly error: E) {}
    
    static create<E = Error>(error: E): Failure<E> {
        return new Failure(error);
    }
}

// ========== TYPES ÉVÉNEMENTS ==========

export interface DomainEvent {
    readonly eventId: string;
    readonly eventType: string;
    readonly occurredOn: Date;
    readonly aggregateId: EntityId;
}

export interface LightAddedEvent extends DomainEvent {
    readonly eventType: 'LightAdded';
    readonly lightId: LightId;
    readonly lightType: LightType;
}

export interface LightRemovedEvent extends DomainEvent {
    readonly eventType: 'LightRemoved';
    readonly lightId: LightId;
}

export interface LightUpdatedEvent extends DomainEvent {
    readonly eventType: 'LightUpdated';
    readonly lightId: LightId;
    readonly changes: Record<string, any>;
}

// ========== TYPES COMMANDES ==========

export interface Command {
    readonly commandId: string;
    readonly commandType: string;
    readonly timestamp: Date;
}

export interface AddLightCommand extends Command {
    readonly commandType: 'AddLight';
    readonly lightType: LightType;
    readonly position: Position;
    readonly properties: Record<string, any>;
}

export interface RemoveLightCommand extends Command {
    readonly commandType: 'RemoveLight';
    readonly lightId: LightId;
}

export interface UpdateLightCommand extends Command {
    readonly commandType: 'UpdateLight';
    readonly lightId: LightId;
    readonly updates: Record<string, any>;
}

// ========== TYPES REQUÊTES ==========

export interface Query {
    readonly queryId: string;
    readonly queryType: string;
    readonly timestamp: Date;
}

export interface GetLightByIdQuery extends Query {
    readonly queryType: 'GetLightById';
    readonly lightId: LightId;
}

export interface GetAllLightsQuery extends Query {
    readonly queryType: 'GetAllLights';
}

// ========== UTILS TYPES ==========

export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ========== VALIDATION ==========

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface Validator<T> {
    validate(item: T): ValidationResult;
}

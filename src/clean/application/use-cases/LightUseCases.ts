/**
 * PHASE 3 - USE CASES POUR LES LUMIÈRES - VERSION CORRIGÉE
 * Application layer - Orchestration de la logique métier
 */

import { Light as DomainLight, LightType } from '@/clean/domain/entities/Light';
import { Transform, Position, Rotation } from '@/clean/domain/value-objects/Transform';
import { Intensity } from '@/clean/domain/value-objects/LightProperties';
import { Color } from '@/clean/domain/value-objects/Color';
import { LightId } from '@/clean/domain/value-objects/EntityId';

/**
 * Command pour ajouter une lumière
 */
export interface AddLightCommand {
    type: 'point' | 'spot' | 'area' | 'directional' | 'ambient';
    position: {
        x: number;
        y: number;
        z: number;
    };
    intensity?: number;
    color?: {
        r: number;
        g: number;
        b: number;
    };
    properties?: Record<string, any>;
}

/**
 * Command pour supprimer une lumière
 */
export type DeleteLightCommand = string; // lightId

/**
 * Command pour mettre à jour la position d'une lumière
 */
export interface UpdateLightPositionCommand {
    lightId: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
}

/**
 * Résultat de l'ajout de lumière
 */
export interface AddLightResult {
    success: boolean;
    lightId?: string;
    light?: DomainLight;
    error?: string;
}

/**
 * Repository interface pour les lumières
 */
export interface LightRepository {
    save(light: DomainLight): Promise<void>;
    findById(id: string): Promise<DomainLight | null>;
    findAll(): Promise<DomainLight[]>;
    delete(id: string): Promise<void>;
    update(light: DomainLight): Promise<void>;
}

/**
 * Interface pour l'Event Bus
 */
export interface EventBus {
    publish(event: any): Promise<void>;
}

/**
 * Interface de base pour les événements de domaine
 */
export interface DomainEvent {
    getEventName(): string;
}

/**
 * Events de domaine
 */
export class LightAddedEvent implements DomainEvent {
    constructor(public readonly light: DomainLight) {}
    
    getEventName(): string {
        return 'LightAdded';
    }
}

export class LightDeletedEvent implements DomainEvent {
    constructor(public readonly lightId: string) {}
    
    getEventName(): string {
        return 'LightDeleted';
    }
}

export class LightUpdatedEvent implements DomainEvent {
    constructor(public readonly light: DomainLight) {}
    
    getEventName(): string {
        return 'LightUpdated';
    }
}

/**
 * Use Case : Ajouter une lumière
 */
export class AddLightUseCase {
    constructor(
        private readonly repository: LightRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: AddLightCommand): Promise<AddLightResult> {
        try {
            // Création du transform à partir de la position
            const position = Position.create(command.position.x, command.position.y, command.position.z);
            const rotation = Rotation.zero();
            const transform = Transform.create(position, rotation);

            // Paramètres par défaut
            const intensity = command.intensity !== undefined 
                ? Intensity.create(command.intensity)
                : Intensity.normal();

            const color = command.color 
                ? Color.create(command.color.r, command.color.g, command.color.b)
                : Color.white();

            // Génération d'un ID unique
            const lightId = LightId.create();
            const lightName = `${command.type}-${lightId.toString().slice(0, 8)}`;

            // Création de l'entité selon le type
            let light: DomainLight;
            switch (command.type) {
                case 'point':
                    light = DomainLight.createPoint(lightId, lightName, transform, color, intensity);
                    break;
                case 'spot':
                    // TODO: Ajouter les SpotLightProperties par défaut
                    light = DomainLight.createPoint(lightId, lightName, transform, color, intensity); // Temporaire
                    break;
                case 'area':
                    // TODO: Ajouter les Size par défaut
                    light = DomainLight.createPoint(lightId, lightName, transform, color, intensity); // Temporaire
                    break;
                default:
                    return {
                        success: false,
                        error: `Unsupported light type: ${command.type}`
                    };
            }

            // Validation métier (if any)
            // TODO: Ajouter des validations métier ici

            // Sauvegarde
            await this.repository.save(light);

            // Publication de l'événement
            await this.eventBus.publish(new LightAddedEvent(light));

            return {
                success: true,
                lightId: light.id.toString(),
                light
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

/**
 * Use Case : Supprimer une lumière
 */
export class DeleteLightUseCase {
    constructor(
        private readonly repository: LightRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(lightId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Vérification de l'existence
            const light = await this.repository.findById(lightId);
            if (!light) {
                return {
                    success: false,
                    error: `Light with id ${lightId} not found`
                };
            }

            // Suppression
            await this.repository.delete(lightId);

            // Publication de l'événement
            await this.eventBus.publish(new LightDeletedEvent(lightId));

            return { success: true };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

/**
 * Use Case : Mettre à jour la position d'une lumière
 */
export class UpdateLightPositionUseCase {
    constructor(
        private readonly repository: LightRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: UpdateLightPositionCommand): Promise<{ success: boolean; error?: string }> {
        try {
            // Récupération de la lumière
            const light = await this.repository.findById(command.lightId);
            if (!light) {
                return {
                    success: false,
                    error: `Light with id ${command.lightId} not found`
                };
            }

            // Création du nouveau transform
            const currentTransform = light.transform;
            if (!currentTransform) {
                return {
                    success: false,
                    error: `Light type ${light.type} does not support position updates`
                };
            }

            const newPosition = Position.create(command.position.x, command.position.y, command.position.z);
            const newTransform = Transform.create(newPosition, currentTransform.rotation);

            // Mise à jour
            const updatedLight = light.updateTransform(newTransform);

            // Sauvegarde
            await this.repository.update(updatedLight);

            // Publication de l'événement
            await this.eventBus.publish(new LightUpdatedEvent(updatedLight));

            return { success: true };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}

/**
 * Use Case : Lister toutes les lumières
 */
export class ListLightsUseCase {
    constructor(private readonly repository: LightRepository) {}

    async execute(): Promise<DomainLight[]> {
        return await this.repository.findAll();
    }
}

/**
 * Use Case : Obtenir une lumière par ID
 */
export class GetLightByIdUseCase {
    constructor(private readonly repository: LightRepository) {}

    async execute(lightId: string): Promise<DomainLight | null> {
        return await this.repository.findById(lightId);
    }
}

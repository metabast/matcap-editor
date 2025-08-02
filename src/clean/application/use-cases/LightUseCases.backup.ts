/**
 * PHASE 3 - USE CASES POUR LES LUMIÈRES
 * Application layer - Orchestration de la logique métier
 */

import { Light as DomainLight, LightType } from '@/clean/domain/entities/Light';
import { Transform } from '@/clean/domain/value-objects/Transform';
import { Intensity } from '@/clean/domain/value-objects/LightProperties';
import { Color } from '@/clean/domain/value-objects/Color';

/**
 * Command pour ajouter une lumière
 */
export interface AddLightCommand {
    type: LightType;
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
 * Event Bus interface
 */
export interface EventBus {
    publish(event: DomainEvent): Promise<void>;
}

/**
 * Domain Events
 */
export abstract class DomainEvent {
    public readonly occurredAt: Date = new Date();
    abstract getEventName(): string;
}

export class LightAddedEvent {
    constructor(public readonly light: DomainLight) {
        this.light = light;
    }
}

export class LightDeletedEvent extends DomainEvent {
    constructor(public readonly lightId: string) {
        super();
    }
    
    getEventName(): string {
        return 'LightDeleted';
    }
}

export class LightUpdatedEvent extends DomainEvent {
    constructor(public readonly light: Light) {
        super();
    }
    
    getEventName(): string {
        return 'LightUpdated';
    }
}

/**
 * USE CASE: Ajouter une lumière
 */
export class AddLightUseCase {
    constructor(
        private lightRepository: LightRepository,
        private eventBus: EventBus
    ) {}
    
    async execute(command: AddLightCommand): Promise<AddLightResult> {
        try {
            // 1. Validation des données d'entrée
            this.validateCommand(command);
            
            // 2. Création des Value Objects
            const position = Position.create(
                command.position.x,
                command.position.y,
                command.position.z
            );
            
            const intensity = command.intensity 
                ? Intensity.create(command.intensity)
                : Intensity.default();
                
            const color = command.color
                ? Color.create(command.color.r, command.color.g, command.color.b)
                : Color.white();
            
            // 3. Création de l'entité Light selon le type
            let light: Light;
            
            switch (command.type) {
                case LightType.POINT:
                    light = Light.createPoint(position, intensity, color);
                    break;
                case LightType.SPOT:
                    light = Light.createSpot(position, intensity, color);
                    break;
                case LightType.AREA:
                    light = Light.createArea(position, intensity, color);
                    break;
                default:
                    throw new Error(`Unsupported light type: ${command.type}`);
            }
            
            // 4. Vérification des règles métier
            if (!light.canBePlacedAt(position)) {
                throw new Error('Light cannot be placed at the origin');
            }
            
            // 5. Persistance
            await this.lightRepository.save(light);
            
            // 6. Publication de l'événement
            await this.eventBus.publish(new LightAddedEvent(light));
            
            return {
                success: true,
                lightId: light.getId().toString(),
                light
            };
            
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    
    private validateCommand(command: AddLightCommand): void {
        if (!command.type) {
            throw new Error('Light type is required');
        }
        
        if (!command.position) {
            throw new Error('Light position is required');
        }
        
        if (!Number.isFinite(command.position.x) ||
            !Number.isFinite(command.position.y) ||
            !Number.isFinite(command.position.z)) {
            throw new Error('Light position coordinates must be finite numbers');
        }
        
        if (command.intensity !== undefined && (command.intensity < 0 || !Number.isFinite(command.intensity))) {
            throw new Error('Light intensity must be a positive finite number');
        }
    }
}

/**
 * USE CASE: Supprimer une lumière
 */
export class DeleteLightUseCase {
    constructor(
        private lightRepository: LightRepository,
        private eventBus: EventBus
    ) {}
    
    async execute(lightId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // 1. Vérification que la lumière existe
            const light = await this.lightRepository.findById(lightId);
            if (!light) {
                throw new Error(`Light with id ${lightId} not found`);
            }
            
            // 2. Suppression
            await this.lightRepository.delete(lightId);
            
            // 3. Publication de l'événement
            await this.eventBus.publish(new LightDeletedEvent(lightId));
            
            return { success: true };
            
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

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
 * USE CASE: Mettre à jour la position d'une lumière
 */
export class UpdateLightPositionUseCase {
    constructor(
        private lightRepository: LightRepository,
        private eventBus: EventBus
    ) {}
    
    async execute(command: UpdateLightPositionCommand): Promise<{ success: boolean; error?: string }> {
        try {
            // 1. Récupération de la lumière
            const light = await this.lightRepository.findById(command.lightId);
            if (!light) {
                throw new Error(`Light with id ${command.lightId} not found`);
            }
            
            // 2. Création de la nouvelle position
            const newPosition = Position.create(
                command.position.x,
                command.position.y,
                command.position.z
            );
            
            // 3. Vérification des règles métier
            if (!light.canBePlacedAt(newPosition)) {
                throw new Error('Light cannot be placed at this position');
            }
            
            // 4. Mise à jour (immutable)
            const updatedLight = light.updatePosition(newPosition);
            
            // 5. Persistance
            await this.lightRepository.update(updatedLight);
            
            // 6. Publication de l'événement
            await this.eventBus.publish(new LightUpdatedEvent(updatedLight));
            
            return { success: true };
            
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

/**
 * Query pour lister toutes les lumières
 */
export class GetAllLightsQuery {
    constructor(private lightRepository: LightRepository) {}
    
    async execute(): Promise<Light[]> {
        return await this.lightRepository.findAll();
    }
}

/**
 * Query pour récupérer une lumière par ID
 */
export class GetLightByIdQuery {
    constructor(private lightRepository: LightRepository) {}
    
    async execute(lightId: string): Promise<Light | null> {
        return await this.lightRepository.findById(lightId);
    }
}

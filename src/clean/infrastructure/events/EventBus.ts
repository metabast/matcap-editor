/**
 * PHASE 3 - EVENT BUS SIMPLE
 * Infrastructure layer - Gestion des événements de domaine
 */

import { type DomainEvent, type EventBus } from '@/clean/application/use-cases/LightUseCases';

/**
 * Type pour les handlers d'événements
 */
type EventHandler = (event: DomainEvent) => Promise<void>;

/**
 * Implémentation simple d'EventBus en mémoire
 */
export class InMemoryEventBus implements EventBus {
    private handlers: Map<string, EventHandler[]> = new Map();
    
    /**
     * Enregistre un handler pour un type d'événement
     */
    subscribe(eventName: string, handler: EventHandler): void {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
    }
    
    /**
     * Publie un événement à tous les handlers enregistrés
     */
    async publish(event: DomainEvent): Promise<void> {
        const eventName = event.getEventName();
        const handlers = this.handlers.get(eventName) || [];
        
        // Exécution de tous les handlers en parallèle
        const promises = handlers.map(handler => this.safeExecute(handler, event));
        await Promise.all(promises);
        
        console.log(`📡 Event published: ${eventName} (${handlers.length} handlers)`);
    }
    
    /**
     * Exécute un handler de manière sécurisée
     */
    private async safeExecute(handler: EventHandler, event: DomainEvent): Promise<void> {
        try {
            await handler(event);
        } catch (error) {
            console.error('Error in event handler:', error);
        }
    }
    
    /**
     * Supprime tous les handlers pour un événement
     */
    unsubscribe(eventName: string): void {
        this.handlers.delete(eventName);
    }
    
    /**
     * Supprime tous les handlers
     */
    clear(): void {
        this.handlers.clear();
    }
    
    /**
     * Retourne les statistiques du bus
     */
    getStats(): Record<string, number> {
        const stats: Record<string, number> = {};
        this.handlers.forEach((handlers, eventName) => {
            stats[eventName] = handlers.length;
        });
        return stats;
    }
}

/**
 * Event Handlers prédéfinis pour l'intégration avec le système legacy
 */
export class LightEventHandlers {
    
    /**
     * Handler pour LightAddedEvent - intégration avec le système legacy
     */
    static async handleLightAdded(event: DomainEvent): Promise<void> {
        if (event.getEventName() !== 'LightAdded') return;
        
        const lightAddedEvent = event as any; // LightAddedEvent
        console.log('🔆 Light added event handled:', lightAddedEvent.light.getId().toString());
        
        // Émission vers le système d'événements legacy
        const events = await import('@/legacy/commons/Events');
        events.default.emit('matcap:light:added:clean', {
            lightId: lightAddedEvent.light.getId().toString(),
            type: lightAddedEvent.light.getType()
        });
    }
    
    /**
     * Handler pour LightDeletedEvent
     */
    static async handleLightDeleted(event: DomainEvent): Promise<void> {
        if (event.getEventName() !== 'LightDeleted') return;
        
        const lightDeletedEvent = event as any; // LightDeletedEvent
        console.log('🗑️ Light deleted event handled:', lightDeletedEvent.lightId);
        
        // Émission vers le système d'événements legacy
        const events = await import('@/legacy/commons/Events');
        events.default.emit('matcap:light:deleted:clean', {
            lightId: lightDeletedEvent.lightId
        });
    }
    
    /**
     * Handler pour LightUpdatedEvent
     */
    static async handleLightUpdated(event: DomainEvent): Promise<void> {
        if (event.getEventName() !== 'LightUpdated') return;
        
        const lightUpdatedEvent = event as any; // LightUpdatedEvent
        console.log('🔄 Light updated event handled:', lightUpdatedEvent.light.getId().toString());
        
        // Émission vers le système d'événements legacy
        const events = await import('@/legacy/commons/Events');
        events.default.emit('matcap:light:updated:clean', {
            lightId: lightUpdatedEvent.light.getId().toString(),
            light: lightUpdatedEvent.light
        });
        
        // Trigger d'un snapshot pour le rendu
        const { emitSnapshot } = await import('@/legacy/commons/Events');
        emitSnapshot();
    }
}

/**
 * Factory pour créer un EventBus configuré
 */
export class EventBusFactory {
    
    /**
     * Crée un EventBus avec les handlers prédéfinis
     */
    static createConfiguredEventBus(): InMemoryEventBus {
        const eventBus = new InMemoryEventBus();
        
        // Enregistrement des handlers
        eventBus.subscribe('LightAdded', LightEventHandlers.handleLightAdded);
        eventBus.subscribe('LightDeleted', LightEventHandlers.handleLightDeleted);
        eventBus.subscribe('LightUpdated', LightEventHandlers.handleLightUpdated);
        
        console.log('📡 EventBus configured with light handlers');
        return eventBus;
    }
}

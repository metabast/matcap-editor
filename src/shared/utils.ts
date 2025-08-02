/**
 * Utilitaires partagés pour la migration Clean Architecture
 */

import { 
    type EntityId, 
    type Result, 
    type ValidationResult, 
    Failure, 
    Success
} from './types';

// ========== GÉNÉRATION D'IDS ==========

/**
 * Génère un ID unique pour les entités
 */
export function generateId(prefix?: string): EntityId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const id = `${timestamp}_${random}`;
    
    return prefix ? `${prefix}_${id}` : id;
}

/**
 * Valide un ID d'entité
 */
export function isValidId(id: EntityId): boolean {
    return typeof id === 'string' && id.length > 0 && !id.includes(' ');
}

// ========== GESTION DES RÉSULTATS ==========

/**
 * Crée un résultat de succès
 */
export function success<T>(data: T): Success<T> {
    return Success.create(data);
}

/**
 * Crée un résultat d'échec
 */
export function failure<E = Error>(error: E): Failure<E> {
    return Failure.create(error);
}

/**
 * Vérifie si un résultat est un succès
 */
export function isSuccess<T>(result: Result<T>): result is Success<T> {
    return result.success === true;
}

/**
 * Vérifie si un résultat est un échec
 */
export function isFailure<T>(result: Result<T>): result is Failure {
    return result.success === false;
}

// ========== VALIDATION ==========

/**
 * Crée un résultat de validation réussi
 */
export function validationSuccess(): ValidationResult {
    return { isValid: true, errors: [] };
}

/**
 * Crée un résultat de validation échoué
 */
export function validationFailure(errors: string[]): ValidationResult {
    return { isValid: false, errors };
}

/**
 * Combine plusieurs résultats de validation
 */
export function combineValidations(...validations: ValidationResult[]): ValidationResult {
    const allErrors = validations.flatMap(v => v.errors);
    const isValid = validations.every(v => v.isValid);
    
    return {
        isValid,
        errors: allErrors
    };
}

// ========== GESTION DES ERREURS ==========

/**
 * Crée une erreur avec un code et un message
 */
export class DomainError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'DomainError';
    }
}

/**
 * Crée une erreur de validation
 */
export class ValidationError extends DomainError {
    constructor(message: string, public readonly validationErrors: string[]) {
        super('VALIDATION_ERROR', message, validationErrors);
        this.name = 'ValidationError';
    }
}

/**
 * Gestion sécurisée des erreurs asynchrones
 */
export async function safeAsync<T>(
    operation: () => Promise<T>
): Promise<Result<T, Error>> {
    try {
        const result = await operation();
        return success(result);
    } catch (error) {
        return failure(error instanceof Error ? error : new Error(String(error)));
    }
}

/**
 * Gestion sécurisée des opérations synchrones
 */
export function safeSync<T>(
    operation: () => T
): Result<T, Error> {
    try {
        const result = operation();
        return success(result);
    } catch (error) {
        return failure(error instanceof Error ? error : new Error(String(error)));
    }
}

// ========== RETRY ET TIMEOUT ==========

/**
 * Retry d'une opération avec délai exponentiel
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            if (attempt === maxAttempts) {
                throw lastError;
            }
            
            // Délai exponentiel: 1s, 2s, 4s...
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await sleep(delay);
        }
    }
    
    throw lastError!;
}

/**
 * Timeout pour une opération
 */
export async function withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });
    
    return Promise.race([operation, timeoutPromise]);
}

/**
 * Sleep utilitaire
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== LOGGING ==========

/**
 * Logger avec niveaux
 */
export class Logger {
    constructor(private context: string) {}
    
    debug(message: string, data?: any): void {
        if (import.meta.env.NODE_ENV === 'development') {
            console.debug(`[${this.context}] ${message}`, data);
        }
    }
    
    info(message: string, data?: any): void {
        console.info(`[${this.context}] ${message}`, data);
    }
    
    warn(message: string, data?: any): void {
        console.warn(`[${this.context}] ${message}`, data);
    }
    
    error(message: string, error?: any): void {
        console.error(`[${this.context}] ${message}`, error);
    }
}

/**
 * Factory pour créer des loggers
 */
export function createLogger(context: string): Logger {
    return new Logger(context);
}

// ========== PERFORMANCE ==========

/**
 * Mesure le temps d'exécution d'une opération
 */
export async function measureTime<T>(
    operation: () => Promise<T>,
    label: string
): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    console.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
}

/**
 * Debounce pour les opérations fréquentes
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): T {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
}

/**
 * Throttle pour limiter la fréquence d'exécution
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): T {
    let lastExecution = 0;
    
    return ((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastExecution >= delay) {
            lastExecution = now;
            return func(...args);
        }
    }) as T;
}

// ========== OBJETS ET TABLEAUX ==========

/**
 * Clone profond d'un objet
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as unknown as T;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }
    
    const cloned = {} as T;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    
    return cloned;
}

/**
 * Fusion profonde d'objets
 */
export function deepMerge<T extends Record<string, any>>(
    target: T, 
    source: Partial<T>
): T {
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            
            if (
                typeof sourceValue === 'object' && 
                sourceValue !== null && 
                !Array.isArray(sourceValue) &&
                typeof targetValue === 'object' && 
                targetValue !== null && 
                !Array.isArray(targetValue)
            ) {
                result[key] = deepMerge(targetValue, sourceValue);
            } else {
                result[key] = sourceValue as T[Extract<keyof T, string>];
            }
        }
    }
    
    return result;
}

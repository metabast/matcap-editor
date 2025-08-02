/**
 * Entité Project du domaine
 */

import { Entity } from '@/clean/domain/entities/Entity';
import { ProjectId } from '@/clean/domain/value-objects/EntityId';
import { Light } from '@/clean/domain/entities/Light';
import { Material } from '@/clean/domain/entities/Material';
import { ValidationError } from '@/shared/utils';

/**
 * Métadonnées du projet
 */
export interface ProjectMetadata {
    name: string;
    description?: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags: string[];
}

/**
 * Paramètres de rendu du projet
 */
export interface RenderSettings {
    resolution: { width: number; height: number };
    samples: number;
    exposure: number;
    gamma: number;
    backgroundColor: { r: number; g: number; b: number };
    enableShadows: boolean;
    shadowMapSize: number;
    antialias: boolean;
    envMapIntensity: number;
}

/**
 * Configuration de la caméra
 */
export interface CameraSettings {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
    near: number;
    far: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
}

/**
 * Configuration de l'objet de prévisualisation
 */
export interface PreviewObjectSettings {
    type: 'sphere' | 'cube' | 'plane' | 'custom';
    scale: number;
    segments: number;
    customMeshPath?: string;
}

/**
 * Entité Project
 */
export class Project extends Entity<ProjectId> {
    private _metadata: ProjectMetadata;
    private _lights: Map<string, Light>;
    private _materials: Map<string, Material>;
    private _renderSettings: RenderSettings;
    private _cameraSettings: CameraSettings;
    private _previewObjectSettings: PreviewObjectSettings;

    constructor(
        id: ProjectId,
        metadata: ProjectMetadata,
        renderSettings: RenderSettings,
        cameraSettings: CameraSettings,
        previewObjectSettings: PreviewObjectSettings,
        lights: Light[] = [],
        materials: Material[] = []
    ) {
        super(id);
        this._metadata = this.validateMetadata(metadata);
        this._renderSettings = this.validateRenderSettings(renderSettings);
        this._cameraSettings = this.validateCameraSettings(cameraSettings);
        this._previewObjectSettings = this.validatePreviewObjectSettings(previewObjectSettings);
        
        this._lights = new Map();
        this._materials = new Map();

        // Ajouter les lumières directement à la Map
        lights.forEach(light => {
            this._lights.set(light.id.value, light);
        });
        
        // Ajouter les matériaux directement à la Map
        materials.forEach(material => {
            this._materials.set(material.id.value, material);
        });
    }

    private validateMetadata(metadata: ProjectMetadata): ProjectMetadata {
        if (!metadata.name || metadata.name.trim().length === 0) {
            throw new ValidationError(
                'Project name cannot be empty',
                ['Name must be a non-empty string']
            );
        }

        if (!metadata.version || metadata.version.trim().length === 0) {
            throw new ValidationError(
                'Project version cannot be empty',
                ['Version must be a non-empty string']
            );
        }

        return {
            ...metadata,
            name: metadata.name.trim(),
            version: metadata.version.trim(),
            tags: metadata.tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
        };
    }

    private validateRenderSettings(settings: RenderSettings): RenderSettings {
        if (settings.resolution.width <= 0 || settings.resolution.height <= 0) {
            throw new ValidationError(
                'Invalid resolution',
                ['Resolution width and height must be positive']
            );
        }

        if (settings.samples <= 0) {
            throw new ValidationError(
                'Invalid samples count',
                ['Samples must be positive']
            );
        }

        if (!Number.isFinite(settings.exposure)) {
            throw new ValidationError(
                'Invalid exposure value',
                ['Exposure must be finite']
            );
        }

        if (settings.gamma <= 0) {
            throw new ValidationError(
                'Invalid gamma value',
                ['Gamma must be positive']
            );
        }

        if (settings.shadowMapSize <= 0 || (settings.shadowMapSize & (settings.shadowMapSize - 1)) !== 0) {
            throw new ValidationError(
                'Invalid shadow map size',
                ['Shadow map size must be a positive power of 2']
            );
        }

        if (settings.envMapIntensity < 0) {
            throw new ValidationError(
                'Invalid environment map intensity',
                ['Environment map intensity must be non-negative']
            );
        }

        return settings;
    }

    private validateCameraSettings(settings: CameraSettings): CameraSettings {
        if (settings.fov <= 0 || settings.fov >= 180) {
            throw new ValidationError(
                'Invalid field of view',
                ['FOV must be between 0 and 180 degrees']
            );
        }

        if (settings.near <= 0) {
            throw new ValidationError(
                'Invalid near plane',
                ['Near plane must be positive']
            );
        }

        if (settings.far <= settings.near) {
            throw new ValidationError(
                'Invalid far plane',
                ['Far plane must be greater than near plane']
            );
        }

        if (settings.autoRotateSpeed < 0) {
            throw new ValidationError(
                'Invalid auto rotate speed',
                ['Auto rotate speed must be non-negative']
            );
        }

        return settings;
    }

    private validatePreviewObjectSettings(settings: PreviewObjectSettings): PreviewObjectSettings {
        if (settings.scale <= 0) {
            throw new ValidationError(
                'Invalid scale',
                ['Scale must be positive']
            );
        }

        if (settings.segments <= 0) {
            throw new ValidationError(
                'Invalid segments',
                ['Segments must be positive']
            );
        }

        if (settings.type === 'custom' && (!settings.customMeshPath || settings.customMeshPath.trim().length === 0)) {
            throw new ValidationError(
                'Custom mesh path required',
                ['Custom mesh path must be provided when type is custom']
            );
        }

        return settings;
    }

    // Getters
    get metadata(): ProjectMetadata {
        return { ...this._metadata };
    }

    get name(): string {
        return this._metadata.name;
    }

    get version(): string {
        return this._metadata.version;
    }

    get lights(): Light[] {
        return Array.from(this._lights.values());
    }

    get materials(): Material[] {
        return Array.from(this._materials.values());
    }

    get renderSettings(): RenderSettings {
        return { ...this._renderSettings };
    }

    get cameraSettings(): CameraSettings {
        return { ...this._cameraSettings };
    }

    get previewObjectSettings(): PreviewObjectSettings {
        return { ...this._previewObjectSettings };
    }

    get lightCount(): number {
        return this._lights.size;
    }

    get materialCount(): number {
        return this._materials.size;
    }

    // Gestion des lumières
    addLight(light: Light): Project {
        const newLights = new Map(this._lights);
        newLights.set(light.id.value, light);

        return this.withLights(Array.from(newLights.values()));
    }

    removeLight(lightId: string): Project {
        const newLights = new Map(this._lights);
        newLights.delete(lightId);

        return this.withLights(Array.from(newLights.values()));
    }

    updateLight(light: Light): Project {
        if (!this._lights.has(light.id.value)) {
            throw new ValidationError(
                `Light not found: ${light.id.value}`,
                ['Light must exist in project to be updated']
            );
        }

        return this.addLight(light);
    }

    getLight(lightId: string): Light | undefined {
        return this._lights.get(lightId);
    }

    hasLight(lightId: string): boolean {
        return this._lights.has(lightId);
    }

    // Gestion des matériaux
    addMaterial(material: Material): Project {
        const newMaterials = new Map(this._materials);
        newMaterials.set(material.id.value, material);

        return this.withMaterials(Array.from(newMaterials.values()));
    }

    removeMaterial(materialId: string): Project {
        const newMaterials = new Map(this._materials);
        newMaterials.delete(materialId);

        return this.withMaterials(Array.from(newMaterials.values()));
    }

    updateMaterial(material: Material): Project {
        if (!this._materials.has(material.id.value)) {
            throw new ValidationError(
                `Material not found: ${material.id.value}`,
                ['Material must exist in project to be updated']
            );
        }

        return this.addMaterial(material);
    }

    getMaterial(materialId: string): Material | undefined {
        return this._materials.get(materialId);
    }

    hasMaterial(materialId: string): boolean {
        return this._materials.has(materialId);
    }

    // Méthodes de modification
    updateMetadata(metadata: Partial<ProjectMetadata>): Project {
        const newMetadata = {
            ...this._metadata,
            ...metadata,
            updatedAt: new Date()
        };

        return new Project(
            this.id,
            newMetadata,
            this._renderSettings,
            this._cameraSettings,
            this._previewObjectSettings,
            this.lights,
            this.materials
        );
    }

    updateRenderSettings(settings: Partial<RenderSettings>): Project {
        const newSettings = { ...this._renderSettings, ...settings };

        return new Project(
            this.id,
            { ...this._metadata, updatedAt: new Date() },
            newSettings,
            this._cameraSettings,
            this._previewObjectSettings,
            this.lights,
            this.materials
        );
    }

    updateCameraSettings(settings: Partial<CameraSettings>): Project {
        const newSettings = { ...this._cameraSettings, ...settings };

        return new Project(
            this.id,
            { ...this._metadata, updatedAt: new Date() },
            this._renderSettings,
            newSettings,
            this._previewObjectSettings,
            this.lights,
            this.materials
        );
    }

    updatePreviewObjectSettings(settings: Partial<PreviewObjectSettings>): Project {
        const newSettings = { ...this._previewObjectSettings, ...settings };

        return new Project(
            this.id,
            { ...this._metadata, updatedAt: new Date() },
            this._renderSettings,
            this._cameraSettings,
            newSettings,
            this.lights,
            this.materials
        );
    }

    private withLights(lights: Light[]): Project {
        return new Project(
            this.id,
            { ...this._metadata, updatedAt: new Date() },
            this._renderSettings,
            this._cameraSettings,
            this._previewObjectSettings,
            lights,
            this.materials
        );
    }

    private withMaterials(materials: Material[]): Project {
        return new Project(
            this.id,
            { ...this._metadata, updatedAt: new Date() },
            this._renderSettings,
            this._cameraSettings,
            this._previewObjectSettings,
            this.lights,
            materials
        );
    }

    // Méthodes utilitaires
    isEmpty(): boolean {
        return this._lights.size === 0 && this._materials.size === 0;
    }

    getEnabledLights(): Light[] {
        return this.lights.filter(light => light.enabled);
    }

    getVisibleMaterials(): Material[] {
        return this.materials.filter(material => material.visible);
    }

    addTag(tag: string): Project {
        const trimmedTag = tag.trim();
        if (trimmedTag.length === 0 || this._metadata.tags.includes(trimmedTag)) {
            return this;
        }

        return this.updateMetadata({
            tags: [...this._metadata.tags, trimmedTag]
        });
    }

    removeTag(tag: string): Project {
        const newTags = this._metadata.tags.filter(t => t !== tag);
        if (newTags.length === this._metadata.tags.length) {
            return this;
        }

        return this.updateMetadata({ tags: newTags });
    }

    hasTag(tag: string): boolean {
        return this._metadata.tags.includes(tag);
    }

    // Factory methods
    static createEmpty(
        id: ProjectId,
        name: string,
        author?: string
    ): Project {
        const now = new Date();
        
        return new Project(
            id,
            {
                name,
                version: '1.0.0',
                createdAt: now,
                updatedAt: now,
                author,
                tags: []
            },
            Project.defaultRenderSettings(),
            Project.defaultCameraSettings(),
            Project.defaultPreviewObjectSettings()
        );
    }

    static defaultRenderSettings(): RenderSettings {
        return {
            resolution: { width: 512, height: 512 },
            samples: 16,
            exposure: 1.0,
            gamma: 2.2,
            backgroundColor: { r: 0.1, g: 0.1, b: 0.1 },
            enableShadows: true,
            shadowMapSize: 1024,
            antialias: true,
            envMapIntensity: 1.0
        };
    }

    static defaultCameraSettings(): CameraSettings {
        return {
            position: { x: 0, y: 0, z: 5 },
            target: { x: 0, y: 0, z: 0 },
            fov: 75,
            near: 0.1,
            far: 1000,
            autoRotate: false,
            autoRotateSpeed: 2.0
        };
    }

    static defaultPreviewObjectSettings(): PreviewObjectSettings {
        return {
            type: 'sphere',
            scale: 1.0,
            segments: 32
        };
    }

    equals(other: Project): boolean {
        return this.id.equals(other.id);
    }

    toString(): string {
        return `Project(${this.id}, "${this.name}", v${this.version})`;
    }
}

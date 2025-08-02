/**
 * Entité Material du domaine
 */

import { Entity } from '@/clean/domain/entities/Entity';
import { MaterialId } from '@/clean/domain/value-objects/EntityId';
import { Color } from '@/clean/domain/value-objects/Color';
import { 
    Metalness, 
    Roughness, 
    Emission, 
    RefractiveIndex, 
    TextureProperties 
} from '@/clean/domain/value-objects/MaterialProperties';
import { ValidationError } from '@/shared/utils';

/**
 * Types de matériaux supportés
 */
export enum MaterialType {
    STANDARD = 'standard',
    MATCAP = 'matcap',
    PHYSICAL = 'physical',
    LAMBERT = 'lambert',
    PHONG = 'phong',
    BASIC = 'basic'
}

/**
 * Propriétés de base communes à tous les matériaux
 */
export interface BaseMaterialProperties {
    name: string;
    color: Color;
    transparent: boolean;
    opacity: number;
    visible: boolean;
    side: MaterialSide;
}

/**
 * Côtés du matériau à rendre
 */
export enum MaterialSide {
    FRONT = 'front',
    BACK = 'back',
    DOUBLE = 'double'
}

/**
 * Propriétés pour les matériaux PBR (Standard/Physical)
 */
export interface PBRMaterialProperties extends BaseMaterialProperties {
    metalness: Metalness;
    roughness: Roughness;
    emission: Emission;
    emissionColor: Color;
    
    // Textures optionnelles
    diffuseMap?: TextureProperties;
    normalMap?: TextureProperties;
    roughnessMap?: TextureProperties;
    metalnessMap?: TextureProperties;
    emissionMap?: TextureProperties;
    aoMap?: TextureProperties;
    envMap?: TextureProperties;
}

/**
 * Propriétés pour les matériaux Physical (PBR avancé)
 */
export interface PhysicalMaterialProperties extends PBRMaterialProperties {
    refractiveIndex: RefractiveIndex;
    transmission: number;
    thickness: number;
    clearcoat: number;
    clearcoatRoughness: number;
}

/**
 * Propriétés pour les matériaux Matcap
 */
export interface MatcapMaterialProperties extends BaseMaterialProperties {
    matcapMap: TextureProperties;
    normalMap?: TextureProperties;
    bumpMap?: TextureProperties;
    alphaMap?: TextureProperties;
}

/**
 * Propriétés pour les matériaux Lambert
 */
export interface LambertMaterialProperties extends BaseMaterialProperties {
    emissionColor: Color;
    diffuseMap?: TextureProperties;
    emissionMap?: TextureProperties;
    envMap?: TextureProperties;
    aoMap?: TextureProperties;
}

/**
 * Propriétés pour les matériaux Phong
 */
export interface PhongMaterialProperties extends LambertMaterialProperties {
    specular: Color;
    shininess: number;
    specularMap?: TextureProperties;
}

/**
 * Propriétés pour les matériaux Basic
 */
export interface BasicMaterialProperties extends BaseMaterialProperties {
    wireframe: boolean;
    wireframeLinewidth: number;
    map?: TextureProperties;
    envMap?: TextureProperties;
    alphaMap?: TextureProperties;
}

/**
 * Union des propriétés selon le type
 */
export type MaterialProperties = 
    | ({ type: MaterialType.STANDARD } & PBRMaterialProperties)
    | ({ type: MaterialType.PHYSICAL } & PhysicalMaterialProperties)
    | ({ type: MaterialType.MATCAP } & MatcapMaterialProperties)
    | ({ type: MaterialType.LAMBERT } & LambertMaterialProperties)
    | ({ type: MaterialType.PHONG } & PhongMaterialProperties)
    | ({ type: MaterialType.BASIC } & BasicMaterialProperties);

/**
 * Entité Material
 */
export class Material extends Entity<MaterialId> {
    private _properties: MaterialProperties;

    constructor(id: MaterialId, properties: MaterialProperties) {
        super(id);
        this._properties = this.validateProperties(properties);
    }

    private validateProperties(properties: MaterialProperties): MaterialProperties {
        // Validation du nom
        if (!properties.name || properties.name.trim().length === 0) {
            throw new ValidationError(
                'Material name cannot be empty',
                ['Name must be a non-empty string']
            );
        }

        // Validation de l'opacité
        if (!Number.isFinite(properties.opacity) || properties.opacity < 0 || properties.opacity > 1) {
            throw new ValidationError(
                `Invalid opacity value: ${properties.opacity}`,
                ['Opacity must be between 0 and 1']
            );
        }

        // Validation spécifique selon le type
        switch (properties.type) {
            case MaterialType.STANDARD:
                return this.validateStandardMaterial(properties);
            case MaterialType.PHYSICAL:
                return this.validatePhysicalMaterial(properties);
            case MaterialType.MATCAP:
                return this.validateMatcapMaterial(properties);
            case MaterialType.LAMBERT:
                return this.validateLambertMaterial(properties);
            case MaterialType.PHONG:
                return this.validatePhongMaterial(properties);
            case MaterialType.BASIC:
                return this.validateBasicMaterial(properties);
            default:
                throw new ValidationError(
                    `Unknown material type: ${(properties as any).type}`,
                    ['Material type must be one of: standard, physical, matcap, lambert, phong, basic']
                );
        }
    }

    private validateStandardMaterial(properties: MaterialProperties): MaterialProperties {
        if (properties.type !== MaterialType.STANDARD) {
            throw new ValidationError('Invalid standard material properties', []);
        }
        return properties;
    }

    private validatePhysicalMaterial(properties: MaterialProperties): MaterialProperties {
        if (properties.type !== MaterialType.PHYSICAL) {
            throw new ValidationError('Invalid physical material properties', []);
        }

        const physicalProps = properties as PhysicalMaterialProperties;
        
        // Validation des propriétés physiques
        if (!Number.isFinite(physicalProps.transmission) || physicalProps.transmission < 0 || physicalProps.transmission > 1) {
            throw new ValidationError(
                `Invalid transmission value: ${physicalProps.transmission}`,
                ['Transmission must be between 0 and 1']
            );
        }

        if (!Number.isFinite(physicalProps.thickness) || physicalProps.thickness < 0) {
            throw new ValidationError(
                `Invalid thickness value: ${physicalProps.thickness}`,
                ['Thickness must be non-negative']
            );
        }

        if (!Number.isFinite(physicalProps.clearcoat) || physicalProps.clearcoat < 0 || physicalProps.clearcoat > 1) {
            throw new ValidationError(
                `Invalid clearcoat value: ${physicalProps.clearcoat}`,
                ['Clearcoat must be between 0 and 1']
            );
        }

        if (!Number.isFinite(physicalProps.clearcoatRoughness) || physicalProps.clearcoatRoughness < 0 || physicalProps.clearcoatRoughness > 1) {
            throw new ValidationError(
                `Invalid clearcoat roughness value: ${physicalProps.clearcoatRoughness}`,
                ['Clearcoat roughness must be between 0 and 1']
            );
        }

        return properties;
    }

    private validateMatcapMaterial(properties: MaterialProperties): MaterialProperties {
        if (properties.type !== MaterialType.MATCAP) {
            throw new ValidationError('Invalid matcap material properties', []);
        }
        return properties;
    }

    private validateLambertMaterial(properties: MaterialProperties): MaterialProperties {
        if (properties.type !== MaterialType.LAMBERT) {
            throw new ValidationError('Invalid lambert material properties', []);
        }
        return properties;
    }

    private validatePhongMaterial(properties: MaterialProperties): MaterialProperties {
        if (properties.type !== MaterialType.PHONG) {
            throw new ValidationError('Invalid phong material properties', []);
        }

        const phongProps = properties as PhongMaterialProperties;
        
        if (!Number.isFinite(phongProps.shininess) || phongProps.shininess < 0) {
            throw new ValidationError(
                `Invalid shininess value: ${phongProps.shininess}`,
                ['Shininess must be non-negative']
            );
        }

        return properties;
    }

    private validateBasicMaterial(properties: MaterialProperties): MaterialProperties {
        if (properties.type !== MaterialType.BASIC) {
            throw new ValidationError('Invalid basic material properties', []);
        }

        const basicProps = properties as BasicMaterialProperties;
        
        if (!Number.isFinite(basicProps.wireframeLinewidth) || basicProps.wireframeLinewidth <= 0) {
            throw new ValidationError(
                `Invalid wireframe linewidth: ${basicProps.wireframeLinewidth}`,
                ['Wireframe linewidth must be positive']
            );
        }

        return properties;
    }

    // Getters pour les propriétés communes
    get type(): MaterialType {
        return this._properties.type;
    }

    get name(): string {
        return this._properties.name;
    }

    get color(): Color {
        return this._properties.color;
    }

    get transparent(): boolean {
        return this._properties.transparent;
    }

    get opacity(): number {
        return this._properties.opacity;
    }

    get visible(): boolean {
        return this._properties.visible;
    }

    get side(): MaterialSide {
        return this._properties.side;
    }

    get properties(): MaterialProperties {
        return this._properties;
    }

    // Getters spécifiques pour PBR
    get metalness(): Metalness | undefined {
        if ('metalness' in this._properties) {
            return this._properties.metalness;
        }
        return undefined;
    }

    get roughness(): Roughness | undefined {
        if ('roughness' in this._properties) {
            return this._properties.roughness;
        }
        return undefined;
    }

    get emission(): Emission | undefined {
        if ('emission' in this._properties) {
            return this._properties.emission;
        }
        return undefined;
    }

    get emissionColor(): Color | undefined {
        if ('emissionColor' in this._properties) {
            return this._properties.emissionColor;
        }
        return undefined;
    }

    // Méthodes de modification (retournent une nouvelle instance)
    updateName(name: string): Material {
        return new Material(this.id, {
            ...this._properties,
            name: name.trim()
        });
    }

    updateColor(color: Color): Material {
        return new Material(this.id, {
            ...this._properties,
            color
        });
    }

    updateOpacity(opacity: number): Material {
        return new Material(this.id, {
            ...this._properties,
            opacity
        });
    }

    updateTransparent(transparent: boolean): Material {
        return new Material(this.id, {
            ...this._properties,
            transparent
        });
    }

    updateVisible(visible: boolean): Material {
        return new Material(this.id, {
            ...this._properties,
            visible
        });
    }

    updateSide(side: MaterialSide): Material {
        return new Material(this.id, {
            ...this._properties,
            side
        });
    }

    updateMetalness(metalness: Metalness): Material {
        if (!('metalness' in this._properties)) {
            throw new ValidationError(
                `Material type ${this.type} does not support metalness`,
                []
            );
        }

        return new Material(this.id, {
            ...this._properties,
            metalness
        } as MaterialProperties);
    }

    updateRoughness(roughness: Roughness): Material {
        if (!('roughness' in this._properties)) {
            throw new ValidationError(
                `Material type ${this.type} does not support roughness`,
                []
            );
        }

        return new Material(this.id, {
            ...this._properties,
            roughness
        } as MaterialProperties);
    }

    updateEmission(emission: Emission): Material {
        if (!('emission' in this._properties)) {
            throw new ValidationError(
                `Material type ${this.type} does not support emission`,
                []
            );
        }

        return new Material(this.id, {
            ...this._properties,
            emission
        } as MaterialProperties);
    }

    updateEmissionColor(emissionColor: Color): Material {
        if (!('emissionColor' in this._properties)) {
            throw new ValidationError(
                `Material type ${this.type} does not support emission color`,
                []
            );
        }

        return new Material(this.id, {
            ...this._properties,
            emissionColor
        } as MaterialProperties);
    }

    // Méthodes utilitaires
    isPBR(): boolean {
        return this.type === MaterialType.STANDARD || this.type === MaterialType.PHYSICAL;
    }

    hasTextures(): boolean {
        const props = this._properties as any;
        return Object.keys(props).some(key => 
            key.endsWith('Map') && props[key] !== undefined
        );
    }

    isPhysical(): boolean {
        return this.type === MaterialType.PHYSICAL;
    }

    // Factory methods
    static createStandard(
        id: MaterialId,
        name: string,
        color: Color = Color.white(),
        metalness: Metalness = Metalness.default(),
        roughness: Roughness = Roughness.default()
    ): Material {
        return new Material(id, {
            type: MaterialType.STANDARD,
            name,
            color,
            transparent: false,
            opacity: 1,
            visible: true,
            side: MaterialSide.FRONT,
            metalness,
            roughness,
            emission: Emission.none(),
            emissionColor: Color.black()
        });
    }

    static createMatcap(
        id: MaterialId,
        name: string,
        matcapMap: TextureProperties,
        color: Color = Color.white()
    ): Material {
        return new Material(id, {
            type: MaterialType.MATCAP,
            name,
            color,
            transparent: false,
            opacity: 1,
            visible: true,
            side: MaterialSide.FRONT,
            matcapMap
        });
    }

    static createBasic(
        id: MaterialId,
        name: string,
        color: Color = Color.white()
    ): Material {
        return new Material(id, {
            type: MaterialType.BASIC,
            name,
            color,
            transparent: false,
            opacity: 1,
            visible: true,
            side: MaterialSide.FRONT,
            wireframe: false,
            wireframeLinewidth: 1
        });
    }

    equals(other: Material): boolean {
        return this.id.equals(other.id);
    }

    toString(): string {
        return `Material(${this.id}, ${this.type}, "${this.name}")`;
    }
}

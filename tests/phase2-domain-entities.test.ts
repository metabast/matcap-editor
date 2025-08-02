/**
 * Tests pour les entités du domaine (Phase 2)
 */

import { describe, it, expect } from 'vitest';
import { Light, LightType } from '@/clean/domain/entities/Light';
import { Material, MaterialType, MaterialSide } from '@/clean/domain/entities/Material';
import { Project } from '@/clean/domain/entities/Project';
import { LightId, MaterialId, ProjectId } from '@/clean/domain/value-objects/EntityId';
import { Position, Rotation, Transform } from '@/clean/domain/value-objects/Transform';
import { Color } from '@/clean/domain/value-objects/Color';
import { Intensity, Distance, Angle, Size, SpotLightProperties } from '@/clean/domain/value-objects/LightProperties';
import { Metalness, Roughness, Emission, TextureProperties, TexturePath } from '@/clean/domain/value-objects/MaterialProperties';
import { ValidationError } from '@/shared/utils';

describe('Phase 2: Domain Entities', () => {
    describe('Light Entity', () => {
        it('should create ambient light', () => {
            const lightId = LightId.create();
            const light = Light.createAmbient(
                lightId,
                'Ambient Light',
                Color.white(),
                Intensity.normal()
            );

            expect(light.id).toBe(lightId);
            expect(light.type).toBe(LightType.AMBIENT);
            expect(light.name).toBe('Ambient Light');
            expect(light.color).toEqual(Color.white());
            expect(light.intensity).toEqual(Intensity.normal());
            expect(light.visible).toBe(true);
            expect(light.enabled).toBe(true);
        });

        it('should create point light with transform', () => {
            const lightId = LightId.create();
            const transform = Transform.create(
                Position.create(1, 2, 3),
                Rotation.identity()
            );
            
            const light = Light.createPoint(
                lightId,
                'Point Light',
                transform,
                Color.red(),
                Intensity.create(2.0),
                Distance.meters(10),
                true
            );

            expect(light.type).toBe(LightType.POINT);
            expect(light.transform).toEqual(transform);
            expect(light.color).toEqual(Color.red());
            expect(light.intensity?.value).toBe(2.0);
            expect(light.distance?.value).toBe(10);
            expect(light.castShadow).toBe(true);
        });

        it('should create spot light with properties', () => {
            const lightId = LightId.create();
            const transform = Transform.identity();
            const spotProps = SpotLightProperties.create(
                Angle.fromDegrees(30),
                0.2
            );
            
            const light = Light.createSpot(
                lightId,
                'Spot Light',
                transform,
                spotProps
            );

            expect(light.type).toBe(LightType.SPOT);
            expect(light.spotProperties?.angle.degrees).toBeCloseTo(30);
            expect(light.spotProperties?.penumbra).toBe(0.2);
        });

        it('should create area light with size', () => {
            const lightId = LightId.create();
            const transform = Transform.identity();
            const size = Size.create(2, 3);
            
            const light = Light.createArea(
                lightId,
                'Area Light',
                transform,
                size
            );

            expect(light.type).toBe(LightType.AREA);
            expect(light.size?.width).toBe(2);
            expect(light.size?.height).toBe(3);
        });

        it('should update light properties immutably', () => {
            const lightId = LightId.create();
            const light = Light.createAmbient(lightId, 'Original');
            
            const updatedLight = light
                .updateName('Updated')
                .updateColor(Color.blue())
                .updateIntensity(Intensity.create(0.5));

            expect(light.name).toBe('Original');
            expect(updatedLight.name).toBe('Updated');
            expect(updatedLight.color).toEqual(Color.blue());
            expect(updatedLight.intensity.value).toBe(0.5);
            expect(updatedLight.id).toBe(lightId);
        });

        it('should validate light properties', () => {
            const lightId = LightId.create();
            
            expect(() => {
                Light.createAmbient(lightId, '');
            }).toThrow(ValidationError);
        });

        it('should handle type-specific operations correctly', () => {
            const ambientLight = Light.createAmbient(LightId.create(), 'Ambient');
            const pointLight = Light.createPoint(
                LightId.create(),
                'Point',
                Transform.identity()
            );

            expect(ambientLight.isPositional()).toBe(false);
            expect(pointLight.isPositional()).toBe(true);
            expect(ambientLight.hasTransform()).toBe(false);
            expect(pointLight.hasTransform()).toBe(true);

            expect(() => {
                ambientLight.updateTransform(Transform.identity());
            }).toThrow(ValidationError);
        });
    });

    describe('Material Entity', () => {
        it('should create standard PBR material', () => {
            const materialId = MaterialId.create();
            const material = Material.createStandard(
                materialId,
                'Standard Material',
                Color.white(),
                Metalness.create(0.8),
                Roughness.create(0.2)
            );

            expect(material.id).toBe(materialId);
            expect(material.type).toBe(MaterialType.STANDARD);
            expect(material.name).toBe('Standard Material');
            expect(material.color).toEqual(Color.white());
            expect(material.metalness?.value).toBe(0.8);
            expect(material.roughness?.value).toBe(0.2);
            expect(material.isPBR()).toBe(true);
        });

        it('should create matcap material', () => {
            const materialId = MaterialId.create();
            const matcapTexture = TextureProperties.create('/textures/matcap.jpg');
            
            const material = Material.createMatcap(
                materialId,
                'Matcap Material',
                matcapTexture,
                Color.fromHex('#ff0000')
            );

            expect(material.type).toBe(MaterialType.MATCAP);
            expect(material.isPBR()).toBe(false);
            expect(material.color).toEqual(Color.fromHex('#ff0000'));
        });

        it('should create basic material', () => {
            const materialId = MaterialId.create();
            const material = Material.createBasic(
                materialId,
                'Basic Material',
                Color.green()
            );

            expect(material.type).toBe(MaterialType.BASIC);
            expect(material.color).toEqual(Color.green());
            expect(material.side).toBe(MaterialSide.FRONT);
        });

        it('should update material properties immutably', () => {
            const materialId = MaterialId.create();
            const material = Material.createStandard(materialId, 'Original');
            
            const updatedMaterial = material
                .updateName('Updated')
                .updateColor(Color.blue())
                .updateMetalness(Metalness.create(0.5))
                .updateOpacity(0.8);

            expect(material.name).toBe('Original');
            expect(updatedMaterial.name).toBe('Updated');
            expect(updatedMaterial.color).toEqual(Color.blue());
            expect(updatedMaterial.metalness?.value).toBe(0.5);
            expect(updatedMaterial.opacity).toBe(0.8);
        });

        it('should validate material properties', () => {
            const materialId = MaterialId.create();
            
            expect(() => {
                Material.createStandard(materialId, '');
            }).toThrow(ValidationError);
        });

        it('should handle type-specific operations correctly', () => {
            const standardMaterial = Material.createStandard(MaterialId.create(), 'Standard');
            const basicMaterial = Material.createBasic(MaterialId.create(), 'Basic');

            expect(standardMaterial.isPBR()).toBe(true);
            expect(basicMaterial.isPBR()).toBe(false);

            expect(() => {
                basicMaterial.updateMetalness(Metalness.create(0.5));
            }).toThrow(ValidationError);
        });
    });

    describe('Project Entity', () => {
        it('should create empty project', () => {
            const projectId = ProjectId.create();
            const project = Project.createEmpty(
                projectId,
                'Test Project',
                'Test Author'
            );

            expect(project.id).toBe(projectId);
            expect(project.name).toBe('Test Project');
            expect(project.version).toBe('1.0.0');
            expect(project.metadata.author).toBe('Test Author');
            expect(project.isEmpty()).toBe(true);
            expect(project.lightCount).toBe(0);
            expect(project.materialCount).toBe(0);
        });

        it('should add and manage lights', () => {
            const project = Project.createEmpty(ProjectId.create(), 'Test');
            const light = Light.createAmbient(LightId.create(), 'Ambient');
            
            const updatedProject = project.addLight(light);
            
            expect(project.lightCount).toBe(0);
            expect(updatedProject.lightCount).toBe(1);
            expect(updatedProject.hasLight(light.id.value)).toBe(true);
            expect(updatedProject.getLight(light.id.value)).toBe(light);
        });

        it('should add and manage materials', () => {
            const project = Project.createEmpty(ProjectId.create(), 'Test');
            const material = Material.createStandard(MaterialId.create(), 'Standard');
            
            const updatedProject = project.addMaterial(material);
            
            expect(project.materialCount).toBe(0);
            expect(updatedProject.materialCount).toBe(1);
            expect(updatedProject.hasMaterial(material.id.value)).toBe(true);
            expect(updatedProject.getMaterial(material.id.value)).toBe(material);
        });

        it('should update lights and materials', () => {
            let project = Project.createEmpty(ProjectId.create(), 'Test');
            const light = Light.createAmbient(LightId.create(), 'Original');
            
            project = project.addLight(light);
            const updatedLight = light.updateName('Updated');
            project = project.updateLight(updatedLight);
            
            expect(project.getLight(light.id.value)?.name).toBe('Updated');
        });

        it('should remove lights and materials', () => {
            let project = Project.createEmpty(ProjectId.create(), 'Test');
            const light = Light.createAmbient(LightId.create(), 'Light');
            const material = Material.createStandard(MaterialId.create(), 'Material');
            
            project = project
                .addLight(light)
                .addMaterial(material);
            
            expect(project.lightCount).toBe(1);
            expect(project.materialCount).toBe(1);
            
            project = project
                .removeLight(light.id.value)
                .removeMaterial(material.id.value);
            
            expect(project.lightCount).toBe(0);
            expect(project.materialCount).toBe(0);
        });

        it('should update project settings', () => {
            const project = Project.createEmpty(ProjectId.create(), 'Test');
            
            const updatedProject = project.updateRenderSettings({
                resolution: { width: 1024, height: 768 },
                samples: 32
            });
            
            expect(updatedProject.renderSettings.resolution.width).toBe(1024);
            expect(updatedProject.renderSettings.resolution.height).toBe(768);
            expect(updatedProject.renderSettings.samples).toBe(32);
        });

        it('should manage tags', () => {
            let project = Project.createEmpty(ProjectId.create(), 'Test');
            
            project = project
                .addTag('3d')
                .addTag('lighting')
                .addTag('material');
            
            expect(project.hasTag('3d')).toBe(true);
            expect(project.hasTag('lighting')).toBe(true);
            expect(project.metadata.tags).toHaveLength(3);
            
            project = project.removeTag('lighting');
            expect(project.hasTag('lighting')).toBe(false);
            expect(project.metadata.tags).toHaveLength(2);
        });

        it('should get filtered collections', () => {
            let project = Project.createEmpty(ProjectId.create(), 'Test');
            
            const enabledLight = Light.createAmbient(LightId.create(), 'Enabled');
            const disabledLight = Light.createAmbient(LightId.create(), 'Disabled')
                .updateEnabled(false);
            
            const visibleMaterial = Material.createStandard(MaterialId.create(), 'Visible');
            const hiddenMaterial = Material.createStandard(MaterialId.create(), 'Hidden')
                .updateVisible(false);
            
            project = project
                .addLight(enabledLight)
                .addLight(disabledLight)
                .addMaterial(visibleMaterial)
                .addMaterial(hiddenMaterial);
            
            expect(project.getEnabledLights()).toHaveLength(1);
            expect(project.getVisibleMaterials()).toHaveLength(1);
        });

        it('should validate project data', () => {
            const projectId = ProjectId.create();
            
            expect(() => {
                Project.createEmpty(projectId, '');
            }).toThrow(ValidationError);
        });

        it('should update metadata with timestamp', () => {
            const project = Project.createEmpty(ProjectId.create(), 'Test');
            const originalTime = project.metadata.updatedAt;
            
            // Attendre un peu pour s'assurer que le timestamp change
            setTimeout(() => {
                const updatedProject = project.updateMetadata({
                    description: 'Test description'
                });
                
                expect(updatedProject.metadata.description).toBe('Test description');
                expect(updatedProject.metadata.updatedAt.getTime()).toBeGreaterThan(originalTime.getTime());
            }, 10);
        });
    });

    describe('Domain Entity Integration', () => {
        it('should create a complete project with lights and materials', () => {
            let project = Project.createEmpty(ProjectId.create(), 'Complete Project');
            
            // Ajouter des lumières
            const ambientLight = Light.createAmbient(
                LightId.create(),
                'Main Ambient',
                Color.fromHex('#404040'),
                Intensity.create(0.3)
            );
            
            const keyLight = Light.createDirectional(
                LightId.create(),
                'Key Light',
                Transform.create(
                    Position.create(-2, 3, 5),
                    Rotation.fromEuler(Math.PI / 4, -Math.PI / 6, 0)
                ),
                Color.fromHex('#ffeeaa'),
                Intensity.create(1.2),
                true
            );
            
            const fillLight = Light.createPoint(
                LightId.create(),
                'Fill Light',
                Transform.create(
                    Position.create(3, 1, 2),
                    Rotation.identity()
                ),
                Color.fromHex('#aaeeff'),
                Intensity.create(0.8),
                Distance.meters(8)
            );
            
            // Ajouter des matériaux
            const goldMaterial = Material.createStandard(
                MaterialId.create(),
                'Gold',
                Color.fromHex('#ffd700'),
                Metalness.create(1.0),
                Roughness.create(0.1)
            );
            
            const matcapMaterial = Material.createMatcap(
                MaterialId.create(),
                'Clay',
                TextureProperties.create('/textures/clay.jpg'),
                Color.fromHex('#d4b896')
            );
            
            // Construire le projet
            project = project
                .addLight(ambientLight)
                .addLight(keyLight)
                .addLight(fillLight)
                .addMaterial(goldMaterial)
                .addMaterial(matcapMaterial)
                .updateMetadata({
                    description: 'A complete lighting and material setup',
                    tags: ['lighting', 'pbr', 'matcap']
                })
                .updateRenderSettings({
                    resolution: { width: 1024, height: 1024 },
                    samples: 64,
                    enableShadows: true
                });
            
            // Vérifications
            expect(project.lightCount).toBe(3);
            expect(project.materialCount).toBe(2);
            expect(project.getEnabledLights()).toHaveLength(3);
            expect(project.isEmpty()).toBe(false);
            expect(project.hasTag('lighting')).toBe(true);
            expect(project.renderSettings.resolution.width).toBe(1024);
            
            // Vérifier les types de lumières
            const lights = project.lights;
            expect(lights.some(l => l.type === LightType.AMBIENT)).toBe(true);
            expect(lights.some(l => l.type === LightType.DIRECTIONAL)).toBe(true);
            expect(lights.some(l => l.type === LightType.POINT)).toBe(true);
            
            // Vérifier les types de matériaux
            const materials = project.materials;
            expect(materials.some(m => m.type === MaterialType.STANDARD)).toBe(true);
            expect(materials.some(m => m.type === MaterialType.MATCAP)).toBe(true);
        });

        it('should maintain entity immutability throughout operations', () => {
            const originalProject = Project.createEmpty(ProjectId.create(), 'Original');
            const originalLight = Light.createAmbient(LightId.create(), 'Original Light');
            const originalMaterial = Material.createStandard(MaterialId.create(), 'Original Material');
            
            // Effectuer une série d'opérations
            const finalProject = originalProject
                .addLight(originalLight)
                .addMaterial(originalMaterial)
                .updateMetadata({ description: 'Updated' })
                .updateLight(originalLight.updateName('Updated Light'))
                .updateMaterial(originalMaterial.updateName('Updated Material'));
            
            // Vérifier que les entités originales sont inchangées
            expect(originalProject.lightCount).toBe(0);
            expect(originalProject.materialCount).toBe(0);
            expect(originalProject.metadata.description).toBeUndefined();
            expect(originalLight.name).toBe('Original Light');
            expect(originalMaterial.name).toBe('Original Material');
            
            // Vérifier que les nouvelles entités ont les bonnes valeurs
            expect(finalProject.lightCount).toBe(1);
            expect(finalProject.materialCount).toBe(1);
            expect(finalProject.metadata.description).toBe('Updated');
            expect(finalProject.lights[0].name).toBe('Updated Light');
            expect(finalProject.materials[0].name).toBe('Updated Material');
        });
    });
});

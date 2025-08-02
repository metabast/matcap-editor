/**
 * Tests de validation des mappers Legacy <-> Clean
 * Valide le critere "Mappers legacy <-> clean fonctionnels" de la Phase 2
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MapperRegistry, MapperUtils } from '../mappers/index.js';

describe('Phase 2 - Validation des Mappers', () => {
    
    beforeAll(() => {
        // Initialisation du registry des mappers
        MapperRegistry.initialize();
    });
    
    describe('MapperRegistry', () => {
        
        it('doit etre initialise avec succes', () => {
            expect(MapperRegistry.isInitialized()).toBe(true);
        });
        
        it('doit contenir tous les mappers requis', () => {
            const mappers = MapperRegistry.getAllMappers();
            
            expect(mappers).toContain('light');
            expect(mappers).toContain('material');
            expect(mappers).toContain('project');
            expect(mappers.length).toBeGreaterThanOrEqual(3);
        });
        
        it('doit retourner un mapper valide pour chaque type', () => {
            const lightMapper = MapperRegistry.getMapper('light');
            const materialMapper = MapperRegistry.getMapper('material');
            const projectMapper = MapperRegistry.getMapper('project');
            
            expect(lightMapper).toBeDefined();
            expect(materialMapper).toBeDefined();
            expect(projectMapper).toBeDefined();
            
            // Verifier que les mappers ont les methodes requises
            expect(typeof lightMapper.legacyToClean).toBe('function');
            expect(typeof lightMapper.cleanToLegacy).toBe('function');
            expect(typeof materialMapper.legacyToClean).toBe('function');
            expect(typeof materialMapper.cleanToLegacy).toBe('function');
            expect(typeof projectMapper.legacyToClean).toBe('function');
            expect(typeof projectMapper.cleanToLegacy).toBe('function');
        });
        
    });
    
    describe('Validation des Mappers Individuels', () => {
        
        it('doit valider le LightMapper', () => {
            const result = MapperUtils.validateMapper('light');
            expect(result).toBe(true);
        });
        
        it('doit valider le MaterialMapper', () => {
            const result = MapperUtils.validateMapper('material');
            expect(result).toBe(true);
        });
        
        it('doit valider le ProjectMapper', () => {
            const result = MapperUtils.validateMapper('project');
            expect(result).toBe(true);
        });
        
    });
    
    describe('Conversion Bidirectionnelle des Lumieres', () => {
        
        it('doit convertir PointLight Legacy -> Clean -> Legacy', () => {
            const lightMapper = MapperRegistry.getMapper('light');
            
            const legacyLight = {
                type: 'PointLight',
                position: { x: 1, y: 2, z: 3 },
                color: { r: 0.8, g: 0.6, b: 0.4 },
                intensity: 1.5,
                visible: true
            };
            
            // Legacy -> Clean
            const cleanLight = lightMapper.legacyToClean(legacyLight);
            expect(cleanLight.type).toBe('point');
            expect(cleanLight.position).toEqual({ x: 1, y: 2, z: 3 });
            expect(cleanLight.intensity).toBe(1.5);
            
            // Clean -> Legacy
            const backToLegacy = lightMapper.cleanToLegacy(cleanLight);
            expect(backToLegacy.type).toBe('PointLight');
            expect(backToLegacy.position).toEqual({ x: 1, y: 2, z: 3 });
            expect(backToLegacy.intensity).toBe(1.5);
        });
        
        it('doit convertir SpotLight Legacy -> Clean -> Legacy', () => {
            const lightMapper = MapperRegistry.getMapper('light');
            
            const legacyLight = {
                type: 'SpotLight',
                position: { x: 0, y: 5, z: 0 },
                color: { r: 1, g: 1, b: 1 },
                intensity: 2,
                visible: true
            };
            
            const cleanLight = lightMapper.legacyToClean(legacyLight);
            expect(cleanLight.type).toBe('spot');
            
            const backToLegacy = lightMapper.cleanToLegacy(cleanLight);
            expect(backToLegacy.type).toBe('SpotLight');
        });
        
    });
    
    describe('Conversion Bidirectionnelle des Materiaux', () => {
        
        it('doit convertir Material Legacy -> Clean -> Legacy', () => {
            const materialMapper = MapperRegistry.getMapper('material');
            
            const legacyMaterial = {
                type: 'MeshStandardMaterial',
                metalness: 0.7,
                roughness: 0.3,
                color: '#ff0000'
            };
            
            // Legacy -> Clean
            const cleanMaterial = materialMapper.legacyToClean(legacyMaterial);
            expect(cleanMaterial.type).toBe('MeshStandardMaterial');
            expect(cleanMaterial.properties.metalness).toBe(0.7);
            expect(cleanMaterial.properties.roughness).toBe(0.3);
            
            // Clean -> Legacy
            const backToLegacy = materialMapper.cleanToLegacy(cleanMaterial);
            expect(backToLegacy.type).toBe('MeshStandardMaterial');
            expect(backToLegacy.metalness).toBe(0.7);
            expect(backToLegacy.roughness).toBe(0.3);
        });
        
    });
    
    describe('Conversion Bidirectionnelle des Projets', () => {
        
        it('doit convertir Project Legacy -> Clean -> Legacy', () => {
            const projectMapper = MapperRegistry.getMapper('project');
            
            const legacyProject = {
                name: 'Mon Projet Test',
                lights: [
                    {
                        type: 'PointLight',
                        position: { x: 0, y: 0, z: 0 },
                        color: { r: 1, g: 1, b: 1 },
                        intensity: 1,
                        visible: true
                    }
                ],
                materials: [
                    {
                        type: 'MeshStandardMaterial',
                        metalness: 0.5,
                        roughness: 0.5
                    }
                ]
            };
            
            // Legacy -> Clean
            const cleanProject = projectMapper.legacyToClean(legacyProject);
            expect(cleanProject.name).toBe('Mon Projet Test');
            expect(cleanProject.lights).toHaveLength(1);
            expect(cleanProject.materials).toHaveLength(1);
            
            // Clean -> Legacy
            const backToLegacy = projectMapper.cleanToLegacy(cleanProject);
            expect(backToLegacy.name).toBe('Mon Projet Test');
            expect(backToLegacy.lights).toHaveLength(1);
            expect(backToLegacy.materials).toHaveLength(1);
        });
        
    });
    
    describe('Validation Globale', () => {
        
        it('doit valider tous les mappers avec succes', () => {
            const { valid, results } = MapperUtils.validateAllMappers();
            
            expect(valid).toBe(true);
            expect(results.light).toBe(true);
            expect(results.material).toBe(true);
            expect(results.project).toBe(true);
        });
        
        it('confirme le critere Phase 2: "Mappers legacy <-> clean fonctionnels"', () => {
            const { valid } = MapperUtils.validateAllMappers();
            
            // CRITERE PHASE 2 VALIDE
            expect(valid).toBe(true);
            
            console.log('Phase 2 - Critere "Mappers legacy <-> clean fonctionnels" VALIDE');
        });
        
    });
    
});

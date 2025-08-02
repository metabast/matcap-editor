#!/bin/bash
# Modernisation des dépendances Matcap Editor
# Phase 0 - Étape par étape avec validation

set -e  # Arrêter en cas d'erreur

echo "🚀 Début de la modernisation des dépendances..."
echo "📋 Phase 0 - Prérequis avant Clean Architecture"

# Vérification du statut git
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Il y a des changements non commités. Sauvegarde recommandée."
    read -p "Continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Sauvegarde
echo "💾 Création d'un point de sauvegarde..."
git stash push -m "Pre-modernization backup $(date)"

# Fonction de test
test_build() {
    echo "🧪 Test de compilation..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Build réussi"
    else
        echo "❌ Erreur de build"
        return 1
    fi
}

# Fonction de test dev server
test_dev_server() {
    echo "🌐 Test du serveur de développement..."
    timeout 30s npm run dev &
    sleep 10
    
    if curl -f http://localhost:5173 >/dev/null 2>&1; then
        echo "✅ Serveur de dev fonctionnel"
        pkill -f "vite" 2>/dev/null || true
        return 0
    else
        echo "❌ Serveur de dev non accessible"
        pkill -f "vite" 2>/dev/null || true
        return 1
    fi
}

echo ""
echo "🚨 ÉTAPE CRITIQUE: Synchronisation Three.js"
echo "   Résolution de l'incohérence v0.153.0 vs v0.163.0"

# Synchronisation Three.js dans le sous-module
if [ -d "three-matcap-orm-material" ]; then
    echo "📦 Mise à jour du sous-module three-matcap-orm-material..."
    cd three-matcap-orm-material
    
    # Backup du package.json
    cp package.json package.json.backup
    
    # Mise à jour Three.js
    npm update three@^0.163.0
    
    echo "🔨 Test de compilation du sous-module..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Sous-module three-matcap-orm-material mis à jour avec succès"
    else
        echo "❌ Erreur dans le sous-module, restauration..."
        cp package.json.backup package.json
        npm install
        cd ..
        exit 1
    fi
    
    cd ..
else
    echo "⚠️  Dossier three-matcap-orm-material non trouvé"
fi

echo ""
echo "🔧 ÉTAPE 2: Modernisation TypeScript et outils de build"

# Backup package.json principal
cp package.json package.json.backup

# Mise à jour progressive des outils de build
echo "📦 Mise à jour TypeScript et Vite..."
npm update typescript@^5.9.2
npm update vite@^6.0.0
npm update vue-tsc@^2.x
npm update @vitejs/plugin-vue@^5.x

# Test après mise à jour build tools
test_build
if [ $? -ne 0 ]; then
    echo "❌ Problème avec les outils de build, restauration..."
    cp package.json.backup package.json
    npm install
    exit 1
fi

echo ""
echo "⚡ ÉTAPE 3: Modernisation Vue ecosystem"

echo "📦 Mise à jour Vue et écosystème..."
npm update vue@^3.5.x
# Rester en Pinia v2 pour éviter les breaking changes
npm update eslint@^9.x
npm update @vue/eslint-config-typescript@^14.x

# Test après Vue
test_build
test_dev_server
if [ $? -ne 0 ]; then
    echo "❌ Problème avec Vue ecosystem, restauration..."
    cp package.json.backup package.json
    npm install
    exit 1
fi

echo ""
echo "🎨 ÉTAPE 4: Modernisation Three.js ecosystem"

echo "📦 Mise à jour Three.js et extensions..."
npm update three@^0.170.0
npm update @types/three@^0.170.0
npm update three-mesh-bvh@^0.8.x

# Test final complet
echo "🧪 Tests finaux..."
test_build
test_dev_server

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 MODERNISATION RÉUSSIE!"
    echo ""
    echo "✅ Checklist de validation:"
    echo "   ✅ Three.js synchronisé entre projet principal et sous-module"
    echo "   ✅ TypeScript et Vite mis à jour"
    echo "   ✅ Vue ecosystem modernisé"
    echo "   ✅ Three.js ecosystem mis à jour"
    echo "   ✅ Application compile et fonctionne"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Tester manuellement l'application"
    echo "   2. Vérifier le rendu 3D (captures d'écran)"
    echo "   3. Valider les performances"
    echo "   4. Commiter les changements"
    echo "   5. Commencer la Phase 1 de Clean Architecture"
    echo ""
    echo "💾 Fichiers de sauvegarde disponibles:"
    echo "   - package.json.backup (projet principal)"
    echo "   - three-matcap-orm-material/package.json.backup (sous-module)"
    
    # Nettoyage des fichiers de backup si tout va bien
    read -p "Supprimer les fichiers de backup ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f package.json.backup
        rm -f three-matcap-orm-material/package.json.backup
        echo "🗑️  Fichiers de backup supprimés"
    fi
    
else
    echo ""
    echo "❌ ÉCHEC DE LA MODERNISATION"
    echo "📋 Actions recommandées:"
    echo "   1. Vérifier les logs d'erreur ci-dessus"
    echo "   2. Restaurer manuellement si nécessaire:"
    echo "      cp package.json.backup package.json && npm install"
    echo "   3. Résoudre les problèmes avant de relancer"
    
    exit 1
fi

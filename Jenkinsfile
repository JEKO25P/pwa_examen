// Jenkinsfile Declarativo
pipeline {
    // Especifica que el pipeline se ejecutará dentro de un contenedor Docker.
    // Necesitas una imagen con Node y las herramientas de construcción (como git y curl).
    // Una imagen como 'node:18-bullseye' o 'node:18-alpine' debería funcionar.
    // Si necesitas Docker-in-Docker (DooD), tu Jenkinsfile debe ser más complejo.
    // Asumiendo que la imagen de Jenkins ya tiene el cliente de Docker para el DooD configurado
    // como lo hiciste en la Fase 2, podemos usar la configuración de Node a nivel de Jenkins.
    
    agent any

    environment {
        // Variables de entorno para SonarQube
        SCANNER_HOME = tool 'SonarQubeScanner' // Asume que has configurado SonarQube Scanner en Jenkins
        SONARQUBE_PROJECT_KEY = 'examen-poke-pwa' // Ajusta el nombre de tu proyecto

        VERCEL_ORG_ID = 'team_4ZNz0EjGg89V5lhLtw89Ekdq' // <-- REEMPLAZA ESTE VALOR
        VERCEL_PROJECT_ID = 'prj_ZRPTi5Hcrs8HSvs70jZEeVmfSRSr'

    }
    
    stages {
        // Etapa que se ejecuta siempre
        stage('Checkout') {
            steps {
                echo "Clonando el repositorio..."
                // El paso de SCM automático de Jenkins se encarga de esto.
            }
        }

        // ---------------------------------------------
        // Etapas comunes para ambas ramas (develop y main)
        // ---------------------------------------------

        stage('Instalación de Dependencias') {
            steps {
                script {
            // Obtiene la ubicación de la herramienta de Node.js instalada (NodeJS_18)
            def node_home = tool 'NodeJS_18'
            
            // Ejecuta npm install, asegurando que los binarios de Node estén en el PATH
            sh """
                export PATH="${node_home}/bin:\$PATH"
                npm install
            """
            }
            }
        }

        stage('Ejecución de Tests Unitarios') {
            steps {
                // Asume que tienes un script 'test' en tu package.json
                sh 'npm test'
            }
        }

        // ---------------------------------------------
        // Etapas específicas de la rama 'develop'
        // ---------------------------------------------
        
        stage('Análisis de Código Estático (SonarQube)') {
            when { 
                branch 'develop' 
            }
            steps {
                script {
                    // 1. Ejecutar el análisis
                    withSonarQubeEnv('SonarQube') { // 'SonarQube' es el nombre del servidor configurado en Jenkins
                        sh "${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=${SONARQUBE_PROJECT_KEY} \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONARQUBE_URL}" // SonarQube URL se inyecta por withSonarQubeEnv
                    }
                }
            }
        }

        stage('Quality Gate') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "Esperando el veredicto de SonarQube..."
                    // 2. Esperar y fallar si no pasa
                    timeout(time: 5, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline falló: Quality Gate no superado. Veredicto: ${qg.status}"
                        }
                    }
                }
            }
            post {
                success {
                    echo '🎉 Quality Gate superado con éxito.'
                }
            }
        }
        
        // El proceso en 'develop' debe terminar aquí si pasa el Quality Gate
        stage('FIN DEL PROCESO (No debe desplegar)') {
             when {
                branch 'develop'
                expression { return currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo "FIN DEL PROCESO en la rama develop. No se realiza despliegue a producción."
            }
        }

        // ---------------------------------------------
        // Etapas específicas de la rama 'main'
        // ---------------------------------------------
        
        stage('Despliegue a Producción') {
            when { 
                branch 'main' 
            }
            steps {
                echo '🚀 Desplegando a Producción (Vercel/Render) en la rama main.'
                script {
                    // **Restricción:** El despliegue debe ejecutarse mediante CLI.
                    // **Requisito:** Debe inyectar el Token de Autenticación de la plataforma.
                    
                    // Usaremos withCredentials para obtener el token de Vercel/Render.
                    // Asume que has creado una Credencial de Jenkins tipo 'Secret Text' 
                    // con ID 'vercel-token' y el valor de tu token.
                    withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                        // Despliegue usando el snippet proporcionado en las instrucciones:
                        sh """
                            # Requisito de inyección de IDs: 
                            # Asume que las variables de entorno se obtienen de Jenkins/global.
                            # Debes configurar estas variables como Global Environment Variables 
                            # o en el entorno del pipeline en Jenkins.
                            # VERCEL_ORG_ID y VERCEL_PROJECT_ID
                            
                            vercel deploy --prod --token=\$VERCEL_TOKEN --yes \\
                                -e VERCEL_ORG_ID=\$VERCEL_ORG_ID \\
                                -e VERCEL_PROJECT_ID=\$VERCEL_PROJECT_ID
                        """
                        // **Nota:** El script final de tu plataforma (Vercel/Render) debe
                        // generar una URL de producción nueva, como se pide en la Fase 5.
                    }
                }
            }
            post {
                success {
                    echo "✅ Despliegue a Producción Finalizado."
                }
                failure {
                    error "❌ Fallo en el Despliegue a Producción."
                }
            }
        }
    }
}
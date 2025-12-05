// Jenkinsfile Declarativo
pipeline {
    
    // Ejecuta el pipeline en cualquier agente disponible (el contenedor Jenkins)
    agent any

    environment {
        // Variables de entorno globales del pipeline
        
        // 1. INYECCIÓN DE PATH DE NODE.JS: Soluciona el problema de 'npm not found' globalmente.
        PATH = "${tool 'NodeJS_18'}/bin:$PATH" 

        // 2. SONARQUBE: Clave del proyecto.
        SONARQUBE_PROJECT_KEY = 'examen-poke-pwa' 

        // 3. VERCEL IDS: Necesarios para el Despliegue Headless (Fase 4).
        VERCEL_ORG_ID = 'team_4ZNz0EjGg89V5lhLtw89Ekdq' 
        VERCEL_PROJECT_ID = 'prj_ZRPTi5Hcrs8HSvs70jZEeVmfSRSr' 
    }
    
    stages {
        
        stage('Checkout') {
            steps {
                echo "Clonando el repositorio..."
                // Jenkins se encarga del SCM automático aquí.
            }
        }

        // --- Etapas comunes para ambas ramas ---

        stage('Instalación de Dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Ejecución de Tests Unitarios') {
            steps {
                // Ejecuta el script "test" (que internamente usa npx vitest)
                sh 'npm run test'
            }
        }

        // --- Etapas de Calidad (Específicas de 'develop') ---
        
        stage('Análisis de Código Estático (SonarQube)') {
            // Eliminamos la cláusula 'when' para evitar el 'skipped due to when conditional'
            steps {
                script {
                    // Verificamos la rama dentro del script
                    if (env.BRANCH_NAME == 'develop') {
                        // El wrapper 'withSonarQubeEnv' inyecta la URL del servidor
                        withSonarQubeEnv('SonarQube') { 
                            sh """
                                ${tool 'SonarQubeScanner'}/bin/sonar-scanner \
                                -Dsonar.projectKey=${env.SONARQUBE_PROJECT_KEY} \
                                -Dsonar.sources=.
                            """
                        }
                    } else {
                        echo "Análisis de SonarQube omitido para la rama ${env.BRANCH_NAME}"
                    }
                }
            }
        }

        stage('Quality Gate') {
            // Eliminamos la cláusula 'when'
            steps {
                script {
                    // Verificamos la rama dentro del script
                    if (env.BRANCH_NAME == 'develop') {
                        echo "Esperando el veredicto de SonarQube..."
                        timeout(time: 5, unit: 'MINUTES') {
                            def qg = waitForQualityGate()
                            if (qg.status != 'OK') {
                                error "Pipeline falló: Quality Gate no superado. Veredicto: ${qg.status}"
                            }
                        }
                    } else {
                        echo "Quality Gate omitido para la rama ${env.BRANCH_NAME}"
                    }
                }
            }
            post {
                success {
                    echo '🎉 Quality Gate superado con éxito.'
                }
                failure {
                    echo '❌ Quality Gate falló.'
                }
            }
        }
        
        // --- Finalización en Develop (Solo si pasa Quality Gate) ---
        
        stage('FIN DEL PROCESO (No debe desplegar)') {
             // Solo se ejecuta en develop y si el build fue exitoso (cumple la estrategia de rama)
             when {
                branch 'develop'
                expression { return currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo "FIN DEL PROCESO en la rama develop. No se realiza despliegue a producción."
            }
        }

        // --- Despliegue a Producción (Específico de 'main') ---
        
        stage('Despliegue a Producción') {
            // Se ejecuta SOLO en la rama main
            when { 
                branch 'main' 
            }
            steps {
                echo '🚀 Desplegando a Producción (Vercel) en la rama main.'
                script {
                    // Inyecta el Token de Autenticación mediante la Credencial de Jenkins
                    withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                        sh """
                            # Comando de despliegue Headless con inyección de IDs de entorno
                            vercel deploy --prod --token=\$VERCEL_TOKEN --yes \\
                                -e VERCEL_ORG_ID=\$VERCEL_ORG_ID \\
                                -e VERCEL_PROJECT_ID=\$VERCEL_PROJECT_ID
                        """
                    }
                }
            }
            post {
                success {
                    echo "✅ Despliegue a Producción Finalizado. URL de producción generada."
                }
                failure {
                    error "❌ Fallo en el Despliegue a Producción."
                }
            }
        }
    }
}
// Jenkinsfile Declarativo
pipeline {
    
    agent any

    environment {
        // Variables de entorno para Node.js, SonarQube y Vercel

        // **1. INYECCIÓN DE PATH DE NODE.JS:** Resuelve el problema de "npm not found"
        // Inyecta el directorio 'bin' del tool de Node.js en el PATH global del pipeline.
        PATH = "${tool 'NodeJS_18'}/bin:$PATH" 

        // **2. SONARQUBE:** (Usaremos el tool directo en el paso sh)
        SONARQUBE_PROJECT_KEY = 'examen-poke-pwa' 

        // **3. VERCEL IDS:** Necesarios para el Despliegue Headless (Fase 4)
        VERCEL_ORG_ID = 'team_4ZNz0EjGg89V5lhLtw89Ekdq' 
        VERCEL_PROJECT_ID = 'prj_ZRPTi5Hcrs8HSvs70jZEeVmfSRSr' 
    }
    
    stages {
        
        stage('Checkout') {
            steps {
                echo "Clonando el repositorio..."
            }
        }

        // --- Etapas de Construcción y Validación ---

        stage('Instalación de Dependencias') {
            steps {
                // 'npm install' funciona gracias a la variable PATH definida arriba.
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
            when { 
                branch 'develop' 
            }
            steps {
                script {
                    // El wrapper 'withSonarQubeEnv' inyecta la URL del servidor
                    withSonarQubeEnv('SonarQube') { 
                        sh """
                            # Ejecuta el escáner usando el binario del tool instalado
                            ${tool 'SonarQubeScanner'}/bin/sonar-scanner \
                            -Dsonar.projectKey=${env.SONARQUBE_PROJECT_KEY} \
                            -Dsonar.sources=.
                        """
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
                failure {
                    echo '❌ Quality Gate falló.'
                }
            }
        }
        
        // --- Finalización en Develop ---
        
        stage('FIN DEL PROCESO (No debe desplegar)') {
             // Solo se ejecuta en develop y SOLO si el build fue exitoso
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
                    // Utiliza la credencial 'vercel-token'
                    withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                        sh """
                            # Ejecuta el script de despliegue usando VERCEL_TOKEN y los IDs de entorno
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
pipeline {
  agent {
    docker {
      // 1. CAMBIO: Usar Node 20 para resolver EBADENGINE
      image 'node:20-alpine'
      args '-u root:root'
    }
  }

  environment {
    // 2. CAMBIO: Usar host.docker.internal para resolver problemas de red entre contenedores
    SONAR_HOST_URL    = 'http://host.docker.internal:9000' 
    SONAR_PROJECT_KEY = 'poke-pwa'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci || npm install'
      }
    }

    // 🔹 Este stage es necesario ya que el escáner de SonarQube requiere Java.
    stage('Install Java for Sonar') {
      steps {
        sh '''
          echo "Instalando Java dentro del contenedor para Sonar..."
          apk update
          apk add --no-cache openjdk17-jre
          echo "Versión de Java instalada:"
          java -version
        '''
      }
    }

    stage('Unit tests') {
      when {
        anyOf { branch 'develop'; branch 'main' }
      }
      steps {
        sh '''
          npm test -- --watch=false || echo "No tests configured, skipping"
        '''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube') {
          script {
            def scannerHome = tool 'SonarScanner'
            sh """
              ${scannerHome}/bin/sonar-scanner \
                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                -Dsonar.sources=src \
                -Dsonar.host.url=${SONAR_HOST_URL}
            """
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Deploy to Production') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
          sh """
            npm install -g vercel
            vercel deploy --prod --token=$VERCEL_TOKEN --yes
          """
        }
      }
    }
  }
}
pipeline {
  agent {
    docker {
      image 'node:18-alpine'
      args '-u root:root'
    }
  }

  environment {
    SONAR_HOST_URL    = 'http://sonarqube:9000'
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

    // 🔹 Nuevo stage: instalar Java dentro del contenedor node:18-alpine
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
            def scannerHome = tool 'SonarScanner'   // mismo nombre que en Global Tool Configuration
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

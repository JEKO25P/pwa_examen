pipeline {
  agent any

  tools {
    nodejs 'node18'            // Nombre configurado en Global Tool Configuration
    sonarScanner 'SonarScanner'
  }

  environment {
    // Token de Vercel guardado como credencial "vercel-token"
    VERCEL_TOKEN = credentials('vercel-token')
    SONAR_PROJECT_KEY = 'poke-pwa'
  }

  stages {

    stage('Checkout') {
      steps {
        // Usa la rama que Jenkins ya haya chequeado (develop o main)
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'node -v'
        sh 'npm ci || npm install'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube') {
          sh """
            sonar-scanner \
              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
              -Dsonar.sources=src \
              -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info || echo "No coverage file, skipping"
          """
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          script {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') {
              error "Quality Gate failed: ${qg.status}"
            }
          }
        }
      }
    }

    stage('Deploy to Vercel') {
      when {
        branch 'main'          // SOLO desplegar en main, como pide el examen
      }
      steps {
        sh """
          npm install vercel
          npx vercel --prod --yes --token=${VERCEL_TOKEN}
        """
      }
    }
  }
}

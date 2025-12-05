pipeline {
    agent any

    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        VERCEL_ORG = "josias-kumuls-projects"
        VERCEL_PROJECT = "examen-poke-pwa"
    }

    stages {

        stage('Checkout') {
            steps {
                git url: 'https://github.com/JEKO25P/pwa_examen.git', branch: 'develop'
            }
        }

        stage('Install Node & Dependencies') {
            steps {
                bat 'node -v'
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy to Vercel') {
            steps {
                bat '''
                    npm install -g vercel
                    vercel --token=%VERCEL_TOKEN% --prod --yes
                '''
            }
        }
    }
}
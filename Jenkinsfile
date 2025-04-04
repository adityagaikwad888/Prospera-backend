pipeline {
    agent any
    
    environment {
        NODE_ENV = 'test'
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Report') {
            steps {
                junit '**/junit.xml'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}

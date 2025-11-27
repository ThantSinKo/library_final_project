pipeline {
    agent any

    triggers {
        // Poll SCM every 2 minutes as fallback if webhook fails
        pollSCM('H/2 * * * *')
    }

    environment {
        // Build Information
        BUILD_TAG = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        PROJECT_NAME = "book-library"
        
        // Service Names
        DB_SERVICE = "mysql"
        API_SERVICE = "api"
        FRONTEND_SERVICE = "frontend"
        PHPMYADMIN_SERVICE = "phpmyadmin"
    }

    parameters {
        booleanParam(
            name: 'CLEAN_VOLUMES',
            defaultValue: false,
            description: 'Remove volumes (WARNING: This will delete all library data including books, users, borrowings, and reviews)'
        )
        string(
            name: 'NEXT_PUBLIC_API_HOST',
            defaultValue: 'http://192.168.0.196:3001',
            description: 'API host URL for frontend to connect to (use server IP for external access)'
        )
        choice(
            name: 'LOG_LEVEL',
            choices: ['info', 'debug', 'error'],
            description: 'Application log level'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "================================================"
                    echo "📚 Book Library Deployment Pipeline"
                    echo "================================================"
                    echo "Checking out code from repository..."
                    checkout scm
                    
                    echo ""
                    echo "Deployment Information:"
                    echo "  - Environment: Production"
                    echo "  - Build Number: ${BUILD_TAG}"
                    echo "  - Git Commit: ${GIT_COMMIT_SHORT}"
                    echo "  - Clean Volumes: ${params.CLEAN_VOLUMES}"
                    echo "================================================"
                }
            }
        }

        stage('Validate') {
            steps {
                script {
                    echo "🔍 Validating project structure and configuration..."
                    
                    // Check required files exist
                    sh '''
                        echo "Checking required files..."
                        test -f docker-compose.yml || { echo "❌ docker-compose.yml not found"; exit 1; }
                        test -f init.sql || { echo "❌ init.sql not found"; exit 1; }
                        test -d backend || { echo "❌ backend directory not found"; exit 1; }
                        test -d frontend || { echo "❌ frontend directory not found"; exit 1; }
                        test -f backend/Dockerfile || { echo "❌ backend/Dockerfile not found"; exit 1; }
                        test -f frontend/Dockerfile || { echo "❌ frontend/Dockerfile not found"; exit 1; }
                        test -f backend/index.js || { echo "❌ backend/index.js not found"; exit 1; }
                        test -f backend/package.json || { echo "❌ backend/package.json not found"; exit 1; }
                        test -f frontend/package.json || { echo "❌ frontend/package.json not found"; exit 1; }
                        echo "✅ All required files present"
                    '''
                    
                    // Validate Docker Compose configuration
                    echo "Validating Docker Compose syntax..."
                    sh 'docker compose config > /dev/null'
                    echo "✅ Docker Compose configuration is valid"
                }
            }
        }

        stage('Prepare Environment') {
            steps {
                script {
                    echo "⚙️  Preparing environment configuration..."

                    // Load credentials from Jenkins
                    withCredentials([
                        string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASS'),
                        string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASS')
                    ]) {
                        // Create .env file
                        sh """
                            cat > .env <<EOF
# MySQL Database Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
MYSQL_DATABASE=library_db
MYSQL_USER=library_user
MYSQL_PASSWORD=${MYSQL_PASS}
MYSQL_PORT=3306

# phpMyAdmin Configuration
PHPMYADMIN_PORT=8888

# Backend API Configuration
API_PORT=3001

# Frontend Configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_API_HOST=${params.NEXT_PUBLIC_API_HOST}

# Application Configuration
NODE_ENV=production
LOG_LEVEL=${params.LOG_LEVEL}
TZ=Asia/Bangkok

# Build Information
BUILD_NUMBER=${BUILD_TAG}
GIT_COMMIT=${GIT_COMMIT_SHORT}
EOF
                        """
                    }

                    echo "✅ Environment configuration created"
                    sh 'echo "Configuration file: .env (credentials hidden for security)"'
                }
            }
        }

        stage('Stop Existing Services') {
            steps {
                script {
                    echo "🛑 Stopping existing services..."

                    // Determine down command based on CLEAN_VOLUMES parameter
                    def downCommand = 'docker compose down'
                    if (params.CLEAN_VOLUMES) {
                        echo "⚠️  WARNING: Removing volumes - all library data will be deleted!"
                        echo "   This includes: books, users, borrowings, and reviews"
                        downCommand = 'docker compose down -v'
                    } else {
                        echo "ℹ️  Preserving volumes - database data will be retained"
                    }
                    
                    sh downCommand
                    echo "✅ Existing services stopped"
                }
            }
        }

        stage('Build Images') {
            steps {
                script {
                    echo "🏗️  Building Docker images..."
                    
                    sh """
                        echo "Building backend API image..."
                        docker compose build --no-cache ${API_SERVICE}
                        
                        echo ""
                        echo "Building frontend image..."
                        docker compose build --no-cache ${FRONTEND_SERVICE}
                    """
                    
                    echo "✅ Docker images built successfully"
                }
            }
        }

        stage('Deploy Services') {
            steps {
                script {
                    echo "🚀 Deploying services..."

                    sh """
                        # Start all services
                        docker compose up -d
                        
                        echo ""
                        echo "Services starting..."
                    """

                    echo "✅ Services deployed"
                }
            }
        }

        stage('Wait for Services') {
            steps {
                script {
                    echo "⏳ Waiting for services to initialize..."
                    
                    sh """
                        echo "Waiting for MySQL to be ready..."
                        timeout 60 bash -c 'until docker compose exec -T mysql mysqladmin ping -h localhost --silent; do echo "Waiting for MySQL..."; sleep 3; done' || { echo "❌ MySQL failed to start"; exit 1; }
                        echo "✅ MySQL is ready"
                        
                        echo ""
                        echo "Waiting for API to be ready..."
                        sleep 10
                    """
                }
            }
        }

        stage('Database Health Check') {
            steps {
                script {
                    echo "🗄️  Checking database initialization..."
                    
                    sh """
                        # Verify tables exist
                        echo "Verifying database tables..."
                        docker compose exec -T mysql mysql -u library_user -p\${MYSQL_PASSWORD} library_db -e "SHOW TABLES;" || exit 1
                        
                        # Check record counts
                        echo ""
                        echo "Checking data initialization..."
                        docker compose exec -T mysql mysql -u library_user -p\${MYSQL_PASSWORD} library_db -e "
                            SELECT 'books' AS table_name, COUNT(*) AS records FROM books
                            UNION ALL
                            SELECT 'users' AS table_name, COUNT(*) AS records FROM users
                            UNION ALL
                            SELECT 'borrowings' AS table_name, COUNT(*) AS records FROM borrowings
                            UNION ALL
                            SELECT 'reviews' AS table_name, COUNT(*) AS records FROM reviews;
                        " || exit 1
                    """
                    
                    echo "✅ Database initialized successfully"
                }
            }
        }

        stage('API Health Check') {
            steps {
                script {
                    echo "🔍 Performing API health checks..."

                    sh """
                        # Wait for API to be fully ready
                        echo "Testing API health endpoint..."
                        timeout 60 bash -c 'until curl -f http://localhost:3001/health; do echo "Waiting for API..."; sleep 2; done' || { echo "❌ API health check failed"; exit 1; }
                        echo "✅ API health check passed"
                        
                        echo ""
                        echo "Testing books endpoint..."
                        curl -f http://localhost:3001/api/books || { echo "❌ Books endpoint failed"; exit 1; }
                        echo "✅ Books endpoint working"
                        
                        echo ""
                        echo "Testing users endpoint..."
                        curl -f http://localhost:3001/api/users || { echo "❌ Users endpoint failed"; exit 1; }
                        echo "✅ Users endpoint working"
                        
                        echo ""
                        echo "Testing stats endpoint..."
                        curl -f http://localhost:3001/api/stats || { echo "❌ Stats endpoint failed"; exit 1; }
                        echo "✅ Stats endpoint working"
                    """
                }
            }
        }

        stage('Frontend Health Check') {
            steps {
                script {
                    echo "🌐 Checking frontend accessibility..."
                    
                    sh """
                        echo "Waiting for frontend to be ready..."
                        timeout 60 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do echo "Waiting for frontend..."; sleep 3; done' || { echo "❌ Frontend failed to start"; exit 1; }
                        echo "✅ Frontend is accessible"
                    """
                }
            }
        }

        stage('Integration Test') {
            steps {
                script {
                    echo "🧪 Running integration tests..."
                    
                    sh """
                        # Test full stack integration
                        echo "Testing API data retrieval..."
                        BOOK_COUNT=\$(curl -s http://localhost:3001/api/books | grep -o '"id"' | wc -l)
                        echo "Found \$BOOK_COUNT books in database"
                        
                        if [ "\$BOOK_COUNT" -lt 1 ]; then
                            echo "❌ No books found in database"
                            exit 1
                        fi
                        
                        echo "✅ Integration test passed"
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "📊 Deployment Verification Report"
                    echo "================================================"

                    sh """
                        echo "=== Container Status ==="
                        docker compose ps
                        echo ""
                        
                        echo "=== Resource Usage ==="
                        docker stats --no-stream --format "table {{.Container}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"
                        echo ""
                        
                        echo "=== Service Logs (last 15 lines each) ==="
                        echo ""
                        echo "--- MySQL Logs ---"
                        docker compose logs --tail=15 ${DB_SERVICE}
                        echo ""
                        echo "--- API Logs ---"
                        docker compose logs --tail=15 ${API_SERVICE}
                        echo ""
                        echo "--- Frontend Logs ---"
                        docker compose logs --tail=15 ${FRONTEND_SERVICE}
                        echo ""
                        
                        echo "=== Network Information ==="
                        docker network inspect library_network --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}'
                        echo ""
                    """
                    
                    echo "================================================"
                    echo "✅ Verification completed"
                }
            }
        }
    }

    post {
        success {
            script {
                echo ""
                echo "================================================"
                echo "✅ DEPLOYMENT SUCCESSFUL!"
                echo "================================================"
                echo ""
                echo "📚 Book Library Application Deployed"
                echo ""
                echo "Build Information:"
                echo "  - Build Number: ${BUILD_TAG}"
                echo "  - Git Commit: ${GIT_COMMIT_SHORT}"
                echo "  - Deployment Time: ${new Date()}"
                echo ""
                echo "Access your application at:"
                echo "  📖 Frontend:    http://localhost:3000"
                echo "  🔌 API:         http://localhost:3001"
                echo "  📊 phpMyAdmin:  http://localhost:8888"
                echo ""
                echo "API Endpoints:"
                echo "  - Health:       http://localhost:3001/health"
                echo "  - Books:        http://localhost:3001/api/books"
                echo "  - Users:        http://localhost:3001/api/users"
                echo "  - Borrowings:   http://localhost:3001/api/borrowings"
                echo "  - Reviews:      http://localhost:3001/api/reviews/book/:id"
                echo "  - Statistics:   http://localhost:3001/api/stats"
                echo ""
                echo "Database:"
                echo "  - Host:         localhost:3306"
                echo "  - Database:     library_db"
                echo "  - User:         library_user"
                echo ""
                echo "================================================"
            }
        }

        failure {
            script {
                echo ""
                echo "================================================"
                echo "❌ DEPLOYMENT FAILED!"
                echo "================================================"
                echo ""
                echo "Build Information:"
                echo "  - Build Number: ${BUILD_TAG}"
                echo "  - Git Commit: ${GIT_COMMIT_SHORT}"
                echo ""
                echo "Collecting diagnostic information..."
                echo ""
                
                sh '''
                    echo "=== Container Status ==="
                    docker compose ps || true
                    echo ""
                    
                    echo "=== Full Service Logs ==="
                    echo ""
                    echo "--- MySQL Logs ---"
                    docker compose logs --tail=50 mysql || true
                    echo ""
                    echo "--- API Logs ---"
                    docker compose logs --tail=50 api || true
                    echo ""
                    echo "--- Frontend Logs ---"
                    docker compose logs --tail=50 frontend || true
                    echo ""
                    
                    echo "=== Docker System Info ==="
                    docker system df
                    echo ""
                '''
                
                echo "================================================"
                echo "Please check the logs above for error details"
                echo "================================================"
            }
        }

        unstable {
            echo "⚠️  Build is unstable. Please review the test results."
        }

        always {
            script {
                echo ""
                echo "🧹 Cleaning up Docker resources..."
                
                sh """
                    # Remove dangling images
                    echo "Removing dangling images..."
                    docker image prune -f
                    
                    # Remove stopped containers
                    echo "Removing stopped containers..."
                    docker container prune -f
                    
                    # Show disk usage
                    echo ""
                    echo "Docker disk usage after cleanup:"
                    docker system df
                """
                
                echo "✅ Cleanup completed"
            }
        }
    }
}
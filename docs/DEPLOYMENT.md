# 🚀 Deployment Guide

> **Production deployment guide for DeporTur application**

---

## 🎯 Deployment Overview

DeporTur supports multiple deployment strategies for different environments and requirements:

```
Development → Staging → Production
    ↓           ↓          ↓
 Local       Testing    Live
 Docker     Container   Cloud
```

---

## 📋 Pre-Deployment Checklist

### **✅ Infrastructure Requirements**
- [ ] **Database**: PostgreSQL 15+ (Supabase recommended)
- [ ] **Runtime**: Java 17+ for backend, Node.js 18+ for frontend build
- [ ] **SSL Certificate**: Valid SSL certificate for HTTPS
- [ ] **Domain**: Configured domain with DNS records
- [ ] **Auth0 Account**: Configured identity provider
- [ ] **Monitoring**: Application monitoring setup (optional)

### **✅ Configuration Verification**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Auth0 callbacks updated for production URLs
- [ ] CORS origins configured for production
- [ ] SSL/TLS certificates installed
- [ ] Health check endpoints responding

---

## 🐳 Docker Deployment

### **Using Docker Compose (Recommended)**

**1. Create Production Docker Compose:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./deportur-backend
      dockerfile: Dockerfile.prod
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SUPABASE_DB_HOST=${SUPABASE_DB_HOST}
      - SUPABASE_DB_PASSWORD=${SUPABASE_DB_PASSWORD}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
      - AUTH0_ISSUER_URI=${AUTH0_ISSUER_URI}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: ./deportur-frontend
      dockerfile: Dockerfile.prod
      args:
        - VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
        - VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
        - VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}
        - VITE_API_BASE_URL=${VITE_API_BASE_URL}
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```

**2. Backend Production Dockerfile:**
```dockerfile
# deportur-backend/Dockerfile.prod
FROM openjdk:17-jdk-slim as builder

WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM openjdk:17-jre-slim

RUN groupadd -r deportur && useradd -r -g deportur deportur

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
COPY --chown=deportur:deportur . .

USER deportur

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
```

**3. Frontend Production Dockerfile:**
```dockerfile
# deportur-frontend/Dockerfile.prod
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**4. Deploy with Docker Compose:**
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=2

# Update application
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## ☁️ Cloud Deployment

### **AWS Deployment**

**Using AWS ECS with Fargate:**

1. **Create ECS Task Definition:**
```json
{
  "family": "deportur-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "deportur-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/deportur-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        }
      ],
      "secrets": [
        {
          "name": "SUPABASE_DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:deportur-db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/deportur-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

2. **Deploy Script:**
```bash
#!/bin/bash
# deploy-aws.sh

# Build and push Docker images
docker build -t deportur-backend ./deportur-backend
docker build -t deportur-frontend ./deportur-frontend

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

docker tag deportur-backend:latest $ECR_REGISTRY/deportur-backend:latest
docker tag deportur-frontend:latest $ECR_REGISTRY/deportur-frontend:latest

docker push $ECR_REGISTRY/deportur-backend:latest
docker push $ECR_REGISTRY/deportur-frontend:latest

# Update ECS service
aws ecs update-service --cluster deportur-cluster --service deportur-backend-service --force-new-deployment
aws ecs update-service --cluster deportur-cluster --service deportur-frontend-service --force-new-deployment
```

### **Google Cloud Platform (GCP)**

**Using Cloud Run:**

1. **Deploy Backend:**
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/your-project/deportur-backend ./deportur-backend

gcloud run deploy deportur-backend \
  --image gcr.io/your-project/deportur-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod \
  --set-env-vars SUPABASE_DB_HOST=${SUPABASE_DB_HOST} \
  --memory 1Gi \
  --cpu 1
```

2. **Deploy Frontend:**
```bash
# Build and deploy frontend
gcloud builds submit --tag gcr.io/your-project/deportur-frontend ./deportur-frontend

gcloud run deploy deportur-frontend \
  --image gcr.io/your-project/deportur-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80
```

### **Azure Container Instances**

```bash
# Create resource group
az group create --name deportur-rg --location eastus

# Deploy backend
az container create \
  --resource-group deportur-rg \
  --name deportur-backend \
  --image your-registry.azurecr.io/deportur-backend:latest \
  --cpu 1 \
  --memory 2 \
  --ports 8080 \
  --dns-name-label deportur-api \
  --environment-variables \
    SPRING_PROFILES_ACTIVE=prod \
    SUPABASE_DB_HOST=$SUPABASE_DB_HOST \
  --secure-environment-variables \
    SUPABASE_DB_PASSWORD=$SUPABASE_DB_PASSWORD

# Deploy frontend
az container create \
  --resource-group deportur-rg \
  --name deportur-frontend \
  --image your-registry.azurecr.io/deportur-frontend:latest \
  --cpu 0.5 \
  --memory 1 \
  --ports 80 443 \
  --dns-name-label deportur-app
```

---

## 🌐 Traditional Server Deployment

### **VPS/Dedicated Server Setup**

**1. Server Preparation:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

**2. Backend Deployment:**
```bash
# Create application user
sudo useradd -r -m -U -d /opt/deportur -s /bin/false deportur

# Copy application
sudo cp deportur-backend/target/*.jar /opt/deportur/app.jar
sudo chown deportur:deportur /opt/deportur/app.jar

# Create systemd service
sudo tee /etc/systemd/system/deportur.service > /dev/null <<EOF
[Unit]
Description=DeporTur Backend
After=network.target

[Service]
Type=simple
User=deportur
Group=deportur
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/deportur/app.jar
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=deportur
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable deportur
sudo systemctl start deportur
```

**3. Frontend Deployment:**
```bash
# Build frontend
cd deportur-frontend
npm ci
npm run build

# Copy to Nginx directory
sudo cp -r dist/* /var/www/html/

# Configure Nginx
sudo tee /etc/nginx/sites-available/deportur > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/html;
    index index.html;

    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/deportur /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Monitoring & Health Checks

### **Application Health Monitoring**
```bash
# Backend health check
curl -f https://yourdomain.com/api/health

# Frontend health check
curl -f https://yourdomain.com/

# Database connectivity check
curl -f https://yourdomain.com/api/health/db
```

### **Monitoring Setup with Prometheus**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'deportur-backend'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: /api/actuator/prometheus
    scrape_interval: 15s
```

### **Log Monitoring**
```bash
# Backend logs
sudo journalctl -u deportur -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs (if file logging is configured)
tail -f /opt/deportur/logs/application.log
```

---

## 🔄 Deployment Automation

### **GitHub Actions CI/CD Pipeline**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd deportur-backend && ./mvnw test
          cd ../deportur-frontend && npm ci && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t deportur-backend ./deportur-backend
          docker build -t deportur-frontend ./deportur-frontend
      
      - name: Deploy to production
        run: |
          # Your deployment script here
          ./scripts/deploy-production.sh
        env:
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          AUTH0_CLIENT_SECRET: ${{ secrets.AUTH0_CLIENT_SECRET }}
```

### **Deployment Script Template**
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "🚀 Starting deployment..."

# Build applications
echo "📦 Building applications..."
cd deportur-backend && ./mvnw clean package -DskipTests
cd ../deportur-frontend && npm ci && npm run build

# Deploy backend
echo "⚙️ Deploying backend..."
sudo systemctl stop deportur
sudo cp deportur-backend/target/*.jar /opt/deportur/app.jar
sudo systemctl start deportur

# Deploy frontend
echo "⚛️ Deploying frontend..."
sudo cp -r deportur-frontend/dist/* /var/www/html/
sudo systemctl reload nginx

# Health checks
echo "🏥 Running health checks..."
sleep 10
curl -f https://yourdomain.com/api/health
curl -f https://yourdomain.com/

echo "✅ Deployment completed successfully!"
```

---

## 🛡️ Security Considerations

### **Production Security Checklist**
- [ ] **HTTPS Enabled**: SSL/TLS certificates installed and configured
- [ ] **Environment Variables**: Sensitive data stored securely
- [ ] **Database Security**: Connection encryption and access controls
- [ ] **Auth0 Configuration**: Production URLs and security settings
- [ ] **CORS Configuration**: Restricted to production domains
- [ ] **Security Headers**: Nginx security headers configured
- [ ] **Firewall Rules**: Only necessary ports open
- [ ] **Regular Updates**: Security patches applied regularly

### **Environment Variable Security**
```bash
# Use secure secret management
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id deportur/db-password

# Azure Key Vault
az keyvault secret show --vault-name deportur-vault --name db-password

# Google Secret Manager
gcloud secrets versions access latest --secret="db-password"
```

---

## 🔄 Rollback Strategy

### **Quick Rollback Steps**
```bash
# Backend rollback
sudo systemctl stop deportur
sudo cp /opt/deportur/app-previous.jar /opt/deportur/app.jar
sudo systemctl start deportur

# Frontend rollback
sudo cp -r /var/www/html-backup/* /var/www/html/
sudo systemctl reload nginx

# Database rollback (if needed)
# Run specific down migration scripts
```

### **Blue-Green Deployment**
For zero-downtime deployments, consider implementing blue-green deployment strategy with load balancer switching between environments.

---

## 📞 Support & Troubleshooting

### **Common Deployment Issues**
- **Port conflicts**: Check if ports 8080/80/443 are available
- **Permission issues**: Ensure correct file ownership and permissions
- **SSL certificate**: Verify certificate validity and renewal
- **Database connectivity**: Check network access and credentials
- **Memory issues**: Monitor application memory usage

### **Getting Help**
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review application logs for specific errors
- Create issue in GitHub repository
- Contact system administrator for infrastructure issues

---

*Remember: Always test deployments in a staging environment before production!*
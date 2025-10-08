# 🔐 Credential Management Guide

## Overview

This guide explains how to securely manage credentials, secrets, and sensitive configuration in the DeporTur project.

---

## 🎯 Core Principles

1. **Never commit secrets to Git**
2. **Use environment variables for all credentials**
3. **Separate development and production secrets**
4. **Rotate credentials regularly**
5. **Use least-privilege access**

---

## 🗝️ Types of Credentials

### 1. Database Credentials

**What they are:**
- Database host, port, username, password
- Connection strings

**Where they're used:**
- Backend database connections
- Database migrations
- Backup scripts

**Storage:**
```bash
# .env file (NEVER commit this)
SUPABASE_DB_HOST=your-project.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your_project_ref
SUPABASE_DB_PASSWORD=your_secure_password
```

**Usage:**
```java
// application.properties
spring.datasource.url=jdbc:postgresql://${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT}/${SUPABASE_DB_NAME}
spring.datasource.username=${SUPABASE_DB_USER}
spring.datasource.password=${SUPABASE_DB_PASSWORD}
```

### 2. Auth0 Credentials

**What they are:**
- Auth0 domain
- Client ID
- Client Secret
- API Audience

**Where they're used:**
- Backend authentication
- Frontend authentication
- Token validation

**Storage:**
```bash
# Backend Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=your-api-audience
AUTH0_CLIENT_SECRET=your_client_secret

# Frontend Auth0
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=your-api-audience
```

### 3. API Keys (if applicable)

**What they are:**
- Third-party API keys
- Service tokens
- Integration credentials

**Storage:**
```bash
EXTERNAL_API_KEY=your_api_key_here
```

---

## 📁 File Structure for Secrets

### Project Structure

```
DeporTur/
├── .env                          # Root environment file (NOT COMMITTED)
├── .env.example                  # Template (COMMITTED)
├── deportur-backend/
│   ├── .env.example             # Backend template
│   └── src/main/resources/
│       └── application.properties  # Uses ${ENV_VAR} syntax
└── deportur-frontend/
    └── .env.example             # Frontend template
```

### What Gets Committed vs. Not

| File | Committed? | Purpose |
|------|-----------|---------|
| `.env` | ❌ NO | Actual credentials |
| `.env.example` | ✅ YES | Template with placeholders |
| `application.properties` | ✅ YES | Uses environment variables |
| `.gitignore` | ✅ YES | Prevents committing secrets |

---

## 🚀 Environment Setup Workflow

### 1. For New Developers

```bash
# Step 1: Clone repository
git clone https://github.com/YOUR_USERNAME/DeporTur.git
cd DeporTur

# Step 2: Copy environment template
cp .env.example .env

# Step 3: Edit with your credentials
nano .env

# Step 4: Verify .env is not tracked
git status  # Should NOT show .env
```

### 2. For Different Environments

#### Development (.env)
```bash
# Local development database
SUPABASE_DB_HOST=dev-project.pooler.supabase.com
SUPABASE_DB_PASSWORD=dev_password

# Local frontend URL
VITE_API_URL=http://localhost:8080/api
```

#### Production (.env.production)
```bash
# Production database
SUPABASE_DB_HOST=prod-project.pooler.supabase.com
SUPABASE_DB_PASSWORD=strong_production_password

# Production frontend URL
VITE_API_URL=https://api.deportur.com
```

---

## 🔒 Security Best Practices

### 1. Password Strength

✅ **Good passwords:**
- At least 20 characters
- Mix of uppercase, lowercase, numbers, symbols
- Use a password manager to generate

❌ **Bad passwords:**
- "password123"
- "deportur2024"
- Your name or project name

### 2. Credential Rotation

**When to rotate:**
- Every 90 days (best practice)
- Immediately if credentials are exposed
- When team members leave
- After a security incident

**How to rotate:**
```bash
# 1. Generate new credentials in Supabase/Auth0
# 2. Update .env with new credentials
# 3. Restart services
./scripts/start-all.sh

# 4. Revoke old credentials in Supabase/Auth0
```

### 3. Access Control

**Principle of Least Privilege:**
- Database user should only have necessary permissions
- Production credentials separate from development
- Different credentials for each developer (if possible)

---

## 🛡️ Preventing Credential Exposure

### Git Safety Checks

#### Before First Commit

```bash
# Verify .gitignore is working
git status

# Should NOT see:
# - .env
# - application-local.properties
# - Any file with credentials
```

#### If You Accidentally Commit Secrets

⚠️ **IMPORTANT**: Deleting the file in a new commit does NOT remove it from Git history!

```bash
# If you JUST committed (haven't pushed)
git reset --soft HEAD~1
git restore --staged .env
git status

# If you already pushed (CRITICAL)
# 1. Immediately rotate ALL exposed credentials
# 2. Remove from Git history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (use with extreme caution)
git push --force --all
```

### Using Git Hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check if .env is being committed
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$"; then
    echo "ERROR: Attempting to commit .env file!"
    echo "Please remove sensitive files from commit."
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🔍 Credential Scanning

### Tools to Use

#### 1. GitGuardian (Recommended)

```bash
# Install
brew install gitguardian/tap/ggshield

# Scan repository
ggshield secret scan repo .
```

#### 2. TruffleHog

```bash
# Install
pip install truffleHog

# Scan
trufflehog --regex --entropy=False .
```

#### 3. git-secrets

```bash
# Install
brew install git-secrets

# Setup
git secrets --install
git secrets --register-aws
```

---

## 📋 Credential Inventory Checklist

Use this checklist to ensure all credentials are properly managed:

### Database
- [ ] Supabase host is in `.env`
- [ ] Database password is strong (20+ chars)
- [ ] Password is NOT in Git history
- [ ] Connection string uses environment variables

### Authentication
- [ ] Auth0 domain configured
- [ ] Client ID in `.env`
- [ ] Client secret in `.env` (never frontend)
- [ ] Audience configured

### API Keys
- [ ] All API keys in `.env`
- [ ] No hardcoded API keys in code
- [ ] Keys have appropriate scopes/permissions

### Configuration
- [ ] `.env.example` is up to date
- [ ] `.gitignore` includes `.env`
- [ ] `application.properties` uses `${ENV_VAR}`
- [ ] No credentials in logs

---

## 🏭 Production Credential Management

### Platform-Specific Solutions

#### Heroku
```bash
# Set environment variables
heroku config:set SUPABASE_DB_HOST=your_host
heroku config:set SUPABASE_DB_PASSWORD=your_password

# View configured variables
heroku config
```

#### AWS
- Use **AWS Secrets Manager** or **Parameter Store**
- Never put secrets in EC2 instance directly

#### Docker
```bash
# Use docker secrets
docker secret create db_password ./db_password.txt

# Or environment variables (less secure)
docker run -e SUPABASE_DB_PASSWORD=your_password your_image
```

#### Kubernetes
```yaml
# Use Kubernetes Secrets
apiVersion: v1
kind: Secret
metadata:
  name: deportur-secrets
type: Opaque
data:
  db-password: <base64-encoded-password>
```

---

## 🚨 Emergency Response

### If Credentials Are Exposed

1. **Immediately Rotate All Credentials**
   - Database password
   - Auth0 client secret
   - Any exposed API keys

2. **Revoke Exposed Credentials**
   - In Supabase dashboard
   - In Auth0 dashboard
   - In third-party services

3. **Audit Access**
   - Check database access logs
   - Review Auth0 logs
   - Look for suspicious activity

4. **Remove from Git History** (if committed)
   ```bash
   # See "If You Accidentally Commit Secrets" section above
   ```

5. **Notify Team**
   - Inform all developers
   - Update production credentials
   - Review security practices

---

## 📚 Additional Resources

### Internal Documentation
- [Security Policy](../../SECURITY.md)
- [Security Setup Guide](SECURITY-SETUP.md)
- [Auth0 Configuration](AUTH0-CONFIGURATION.md)

### External Resources
- [12 Factor App - Config](https://12factor.net/config)
- [OWASP Secret Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub - Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## ✅ Quick Reference Commands

```bash
# Create environment file from template
cp .env.example .env

# Check if .env is tracked by Git (should be empty)
git ls-files | grep .env

# Verify environment variables are loaded
source .env && echo $SUPABASE_DB_HOST

# Scan for secrets in repository
ggshield secret scan repo .

# Remove file from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch FILENAME" \
  --prune-empty --tag-name-filter cat -- --all
```

---

**Last Updated**: October 2025
**Maintained By**: DeporTur Security Team

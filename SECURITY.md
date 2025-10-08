# 🔒 Security Policy

## 📋 Overview

Security is a top priority for DeporTur. This document outlines our security policies, how to report vulnerabilities, and best practices for contributors.

---

## 🚨 Reporting Security Vulnerabilities

### DO NOT create public GitHub issues for security vulnerabilities!

If you discover a security vulnerability, please follow these steps:

1. **Email the maintainers** at: [your-security-email@example.com]
2. **Include the following information**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)
   - Your contact information

3. **Expected Response Time**:
   - Initial response: Within 48 hours
   - Status update: Within 7 days
   - Resolution target: Within 30 days

### What to Report

Report any security issues including:
- Authentication/Authorization bypasses
- SQL injection vulnerabilities
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Exposed credentials or secrets
- Insecure data transmission
- Privilege escalation
- Any other security concerns

---

## 🔐 Security Measures

### Authentication & Authorization

- **Auth0 OAuth2/OIDC**: Industry-standard authentication
- **JWT Tokens**: Stateless authentication with expiration
- **Secure Token Storage**: HttpOnly cookies where applicable
- **Role-Based Access Control (RBAC)**: Planned for future releases

### Data Protection

- **Database**: PostgreSQL with SSL/TLS encryption (Supabase)
- **Passwords**: Never stored in plain text (handled by Auth0)
- **API Keys**: Stored in environment variables, never in code
- **Sensitive Data**: Encrypted at rest and in transit

### API Security

- **HTTPS Only**: In production (enforced)
- **CORS**: Configured with allowed origins
- **Input Validation**: All user inputs validated
- **SQL Injection Prevention**: Parameterized queries via JPA
- **XSS Prevention**: React's built-in escaping + Content Security Policy
- **Rate Limiting**: Planned for production

### Infrastructure Security

- **Environment Variables**: Credentials stored in `.env` (not committed)
- **Secret Management**: Use of environment-specific secrets
- **Dependency Scanning**: Regular updates to dependencies
- **Database Access**: Restricted to application only

---

## 🛡️ Security Best Practices for Contributors

### 1. Never Commit Secrets

❌ **DON'T DO THIS:**
```bash
# Bad: Hardcoded credentials
DB_PASSWORD = "MySecretPassword123"
AUTH0_SECRET = "abc123xyz456"
```

✅ **DO THIS:**
```bash
# Good: Use environment variables
DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD
AUTH0_SECRET = process.env.AUTH0_CLIENT_SECRET
```

### 2. Use `.gitignore` Properly

Ensure these files are NEVER committed:
- `.env`
- `.env.local`
- `application-local.properties`
- Any files containing credentials

### 3. Secure Coding Practices

#### Backend (Java/Spring Boot)

```java
// ✅ Good: Use parameterized queries (JPA does this automatically)
public Cliente findByEmail(String email) {
    return clienteRepository.findByEmail(email);
}

// ❌ Bad: Never use raw SQL with string concatenation
// NEVER DO THIS: "SELECT * FROM cliente WHERE email = '" + email + "'"
```

#### Frontend (React)

```javascript
// ✅ Good: React automatically escapes content
<div>{cliente.nombre}</div>

// ✅ Good: Validate input
const handleInput = (value) => {
  if (!validator.isEmail(value)) {
    throw new Error('Invalid email');
  }
};

// ❌ Bad: Using dangerouslySetInnerHTML without sanitization
// AVOID: <div dangerouslySetInnerHTML={{__html: userInput}} />
```

### 4. Dependency Management

- **Keep dependencies updated**: Run `npm audit` and `mvn dependency:analyze`
- **Review new dependencies**: Check for known vulnerabilities
- **Use lock files**: Commit `package-lock.json` and `pom.xml`

---

## 🔍 Security Checklist for Pull Requests

Before submitting a PR, verify:

- [ ] No secrets or credentials in code
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose sensitive information
- [ ] Authentication required for protected endpoints
- [ ] CORS configuration is appropriate
- [ ] Dependencies are up to date
- [ ] SQL queries are parameterized
- [ ] File uploads (if any) are validated and sanitized
- [ ] No sensitive data in logs
- [ ] No debug code or console.logs with sensitive data

---

## 🚫 Common Security Mistakes to Avoid

### 1. Exposing Sensitive Information

❌ **Don't:**
- Log passwords or tokens
- Return stack traces to the client
- Expose internal IDs or database structure in error messages

✅ **Do:**
- Log only necessary information
- Return generic error messages to clients
- Use structured logging with appropriate levels

### 2. Weak Authentication

❌ **Don't:**
- Store passwords in plain text
- Use weak password requirements
- Implement custom authentication (use Auth0)

✅ **Do:**
- Use Auth0 for authentication
- Enforce strong password policies in Auth0
- Implement proper session management

### 3. Insecure Data Transmission

❌ **Don't:**
- Send credentials over HTTP
- Store tokens in localStorage (XSS risk)
- Include sensitive data in URLs

✅ **Do:**
- Use HTTPS in production
- Store tokens securely (httpOnly cookies or memory)
- Send sensitive data in request body, not URL

---

## 🔒 Environment-Specific Security

### Development Environment

- Use `.env.local` for local secrets (not committed)
- Test database with non-production data
- CORS can be permissive (`*`) for local development

### Production Environment

- Use platform-specific secret management (e.g., Heroku Config Vars, AWS Secrets Manager)
- Enforce HTTPS
- Restrict CORS to specific domains
- Enable rate limiting
- Monitor for suspicious activity

---

## 📊 Security Audit Checklist

Regular security audits should check:

### Code Review
- [ ] No hardcoded credentials
- [ ] Proper input validation
- [ ] Secure error handling
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

### Configuration Review
- [ ] `.env` not committed to Git
- [ ] `.gitignore` properly configured
- [ ] CORS configured correctly
- [ ] Database credentials secured
- [ ] Auth0 configuration secured

### Dependency Review
- [ ] No known vulnerabilities (`npm audit`, `mvn dependency:check`)
- [ ] Dependencies are up to date
- [ ] Unused dependencies removed

### Infrastructure Review
- [ ] Database access restricted
- [ ] API endpoints protected
- [ ] HTTPS enforced in production
- [ ] Rate limiting enabled

---

## 🛠️ Security Tools

### Recommended Tools

**Backend (Java/Spring Boot):**
- OWASP Dependency-Check: `mvn dependency-check:check`
- SpotBugs: Static analysis for Java
- SonarQube: Code quality and security

**Frontend (React):**
- npm audit: `npm audit`
- ESLint security plugin: Detect security issues
- Snyk: Vulnerability scanning

**General:**
- GitGuardian: Scan for secrets in code
- Dependabot: Automated dependency updates
- Trivy: Container and dependency scanning

---

## 📚 Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Auth0 Security Best Practices](https://auth0.com/docs/security)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

### Internal Documentation
- [Credential Management Guide](docs/security/CREDENTIAL-MANAGEMENT.md)
- [Security Setup Guide](docs/security/SECURITY-SETUP.md)
- [Auth0 Configuration](docs/security/AUTH0-CONFIGURATION.md)

---

## 🔄 Security Update Process

When a security vulnerability is reported:

1. **Acknowledge**: Confirm receipt within 48 hours
2. **Assess**: Evaluate severity and impact
3. **Fix**: Develop and test a fix
4. **Release**: Deploy security patch
5. **Notify**: Inform affected users (if applicable)
6. **Document**: Update security documentation

### Severity Levels

- **Critical**: Immediate action required (< 24 hours)
- **High**: Fix within 7 days
- **Medium**: Fix within 30 days
- **Low**: Fix in next regular release

---

## 📝 Responsible Disclosure

We follow responsible disclosure practices:

1. **Private Reporting**: Vulnerabilities reported privately
2. **Coordinated Disclosure**: Fix developed before public disclosure
3. **Credit**: Security researchers credited (if desired)
4. **Timeline**: 90-day disclosure timeline

---

## 🤝 Security Team

For security-related inquiries:

- **Email**: [security@example.com]
- **PGP Key**: [Link to public key if available]
- **Response Time**: Within 48 hours

---

## ✅ Compliance

DeporTur aims to comply with:

- **OWASP Top 10**: Web application security risks
- **GDPR**: Data protection (if applicable)
- **HTTPS**: Secure data transmission
- **Industry Standards**: Following best practices

---

## 📜 Version History

- **v1.0** (October 2025): Initial security policy

---

## 🙏 Acknowledgments

We thank the security community for helping keep DeporTur secure. Responsible disclosure is appreciated and credited.

---

**Last Updated**: October 2025
**Contact**: [security@example.com]

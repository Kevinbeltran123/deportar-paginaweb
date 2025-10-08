# 🤝 Contributing to DeporTur

Thank you for your interest in contributing to DeporTur! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together and help each other
- **Be Professional**: Maintain a professional and inclusive environment
- **Be Constructive**: Provide helpful and constructive feedback

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Java 17** or higher
- **Node.js 18** or higher
- **Maven 3.8+**
- **Git**
- **PostgreSQL client** (for database testing)
- A **Supabase account** (for database access)
- An **Auth0 account** (for authentication)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/DeporTur.git
   cd DeporTur
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/DeporTur.git
   ```

4. **Set up environment**:
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your credentials
   nano .env
   ```

5. **Install dependencies**:
   ```bash
   # Frontend dependencies
   cd deportur-frontend
   npm install
   cd ..

   # Backend dependencies (Maven auto-downloads)
   cd deportur-backend
   mvn clean install
   cd ..
   ```

6. **Verify setup**:
   ```bash
   ./scripts/check-health.sh
   ```

---

## 🔄 Development Workflow

### Branching Strategy

We follow **Git Flow** with the following branch structure:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `release/*` - Release preparation

### Creating a Feature Branch

```bash
# Ensure you're on the latest develop
git checkout develop
git pull upstream develop

# Create a feature branch
git checkout -b feature/your-feature-name

# Example:
git checkout -b feature/add-payment-system
```

### Working on Your Feature

1. **Make your changes** in small, logical commits
2. **Test thoroughly** before committing
3. **Keep your branch updated** with develop:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

### Pushing Your Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

---

## 📐 Coding Standards

### Backend (Java/Spring Boot)

#### Code Style

- Use **4 spaces** for indentation (no tabs)
- Maximum line length: **120 characters**
- Follow **Oracle Java Code Conventions**
- Use **meaningful variable names**

#### Naming Conventions

```java
// Classes: PascalCase
public class ClienteService { }

// Methods and variables: camelCase
private String nombreCliente;
public void guardarCliente() { }

// Constants: UPPER_SNAKE_CASE
public static final String API_BASE_URL = "/api";

// Packages: lowercase
package com.deportur.service;
```

#### Best Practices

- **One class per file**
- **Use DTOs** for API requests/responses (don't expose entities directly)
- **Service layer** contains business logic, controllers should be thin
- **Use constructor injection** for dependencies (not field injection)
- **Handle exceptions** properly with `@ControllerAdvice`
- **Add JavaDoc** for public methods and complex logic

#### Example:

```java
@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    /**
     * Busca un cliente por su ID.
     *
     * @param id El ID del cliente
     * @return ClienteResponse con los datos del cliente
     * @throws ResourceNotFoundException si el cliente no existe
     */
    public ClienteResponse obtenerPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
        return ClienteMapper.toResponse(cliente);
    }
}
```

### Frontend (React/JavaScript)

#### Code Style

- Use **2 spaces** for indentation
- Maximum line length: **100 characters**
- Use **semicolons**
- Use **single quotes** for strings
- Use **arrow functions** for components

#### Naming Conventions

```javascript
// Components: PascalCase
const ClienteList = () => { }

// Functions and variables: camelCase
const fetchClientes = async () => { }
const isLoading = true;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:8080/api';

// Files: Match component name
ClienteList.jsx
```

#### Best Practices

- **Use functional components** with hooks (no class components)
- **Extract reusable logic** into custom hooks
- **Keep components small** and focused (< 200 lines)
- **Use prop types** or TypeScript for type checking
- **Avoid inline styles** - use Tailwind classes
- **Handle loading and error states**
- **Add comments** for complex logic

#### Example:

```javascript
import { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';

const ClienteList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await clienteService.getAll();
        setClientes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto">
      {/* Component content */}
    </div>
  );
};

export default ClienteList;
```

---

## 📝 Commit Guidelines

### Commit Message Format

We use **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature or bug fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD configuration changes

#### Examples

```bash
# Feature
feat(clientes): add search by document number

# Bug fix
fix(reservas): prevent double booking on same equipment

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(equipos): extract validation logic to separate method

# Multiple files
feat(backend): implement reservation cancellation endpoint
- Add cancelReservation method to ReservaService
- Create DELETE endpoint in ReservaController
- Add validation for cancellation permissions
```

#### Commit Rules

- Use **present tense** ("add feature" not "added feature")
- Use **imperative mood** ("move cursor to..." not "moves cursor to...")
- Capitalize first letter of subject
- No period at the end of subject
- Limit subject line to **50 characters**
- Limit body lines to **72 characters**
- Separate subject from body with a blank line

---

## 🔀 Pull Request Process

### Before Creating a PR

1. **Ensure your code works**:
   ```bash
   # Backend tests
   cd deportur-backend
   mvn test

   # Frontend tests
   cd deportur-frontend
   npm run test
   ```

2. **Update documentation** if needed

3. **Rebase on latest develop**:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

4. **Squash commits** if necessary:
   ```bash
   git rebase -i HEAD~3  # For last 3 commits
   ```

### Creating the Pull Request

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Added new endpoint for...
- Refactored service layer to...
- Updated documentation for...

## Testing
- [ ] All existing tests pass
- [ ] Added new tests for new functionality
- [ ] Tested manually in local environment

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### PR Review Process

1. **Automated checks** must pass:
   - Build success
   - All tests pass
   - Code style checks

2. **Code review** by at least one maintainer:
   - Reviews typically completed within 2-3 days
   - Address reviewer feedback promptly

3. **Approval and merge**:
   - PRs are merged by maintainers
   - Branches are automatically deleted after merge

---

## 🧪 Testing Guidelines

### Backend Testing

#### Unit Tests

```java
@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private ClienteService clienteService;

    @Test
    void obtenerPorId_DeberiaRetornarCliente_CuandoExiste() {
        // Given
        Long id = 1L;
        Cliente cliente = new Cliente();
        cliente.setId(id);
        when(clienteRepository.findById(id)).thenReturn(Optional.of(cliente));

        // When
        ClienteResponse result = clienteService.obtenerPorId(id);

        // Then
        assertNotNull(result);
        assertEquals(id, result.getId());
    }
}
```

#### Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class ClienteControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void crearCliente_DeberiaRetornar201() throws Exception {
        String clienteJson = "{\"nombre\":\"Juan\",\"documento\":\"12345\"}";

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(clienteJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Juan"));
    }
}
```

### Frontend Testing

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClienteList from './ClienteList';

describe('ClienteList', () => {
  test('renders cliente list', async () => {
    render(<ClienteList />);

    await waitFor(() => {
      expect(screen.getByText(/clientes/i)).toBeInTheDocument();
    });
  });

  test('handles search input', async () => {
    const user = userEvent.setup();
    render(<ClienteList />);

    const searchInput = screen.getByPlaceholderText(/buscar/i);
    await user.type(searchInput, 'Juan');

    expect(searchInput).toHaveValue('Juan');
  });
});
```

### Testing Checklist

- [ ] Write tests for new features
- [ ] Update tests when refactoring
- [ ] Maintain at least **70% code coverage**
- [ ] Test edge cases and error conditions
- [ ] Test happy path scenarios
- [ ] All tests must pass before submitting PR

---

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing API endpoints
- Updating configuration
- Changing setup process
- Fixing bugs that affect documentation

### Documentation Files to Update

- `README.md` - Main project overview
- `PROJECT-STRUCTURE.md` - If project structure changes
- `docs/` - Relevant guides and documentation
- Code comments - For complex logic
- API documentation - For endpoint changes
- `CHANGELOG.md` - For version releases

### Documentation Style

- Use **clear, concise language**
- Include **code examples** where helpful
- Add **screenshots** for UI changes
- Keep documentation **up to date**
- Use **proper markdown formatting**

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Verify the bug** in the latest version
3. **Collect information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Java version, Node version)
   - Error messages or logs

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. macOS 14.0]
- Java Version: [e.g. 17.0.5]
- Node Version: [e.g. 18.12.0]
- Browser: [e.g. Chrome 120]

**Additional context**
Add any other context about the problem here.
```

---

## 💡 Feature Requests

### Suggesting a Feature

1. **Check if feature already exists**
2. **Open an issue** with the feature request template
3. **Provide use cases** and examples
4. **Discuss with maintainers** before implementation

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

---

## 🆘 Getting Help

### Resources

- **Documentation**: Check the `docs/` directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **Email**: [your-email@example.com]
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions

---

## 📄 License

By contributing to DeporTur, you agree that your contributions will be licensed under the same license as the project.

---

## 🙏 Thank You!

Thank you for contributing to DeporTur! Your contributions help make this project better for everyone.

---

**Last Updated**: October 2025
**Maintained By**: DeporTur Team (Juan Perea, Kevin Beltran)

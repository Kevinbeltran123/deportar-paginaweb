# 🧪 Testing Guide

> **Comprehensive testing strategy for DeporTur application**

---

## 🎯 Testing Philosophy

DeporTur follows a **testing pyramid** approach with comprehensive coverage across all layers:

```
           /\
          /  \
         / E2E \           ← Few, High-Level, Expensive
        /______\
       /        \
      /Integration\       ← Some, Medium-Level, Moderate Cost
     /____________\
    /              \
   /   Unit Tests   \     ← Many, Low-Level, Fast & Cheap
  /________________\
```

---

## 🏗️ Testing Architecture

### **Backend Testing Stack**
| Layer | Framework | Purpose |
|-------|-----------|---------|
| **Unit Tests** | JUnit 5 + Mockito | Service and utility testing |
| **Integration Tests** | Spring Boot Test | Repository and controller testing |
| **Contract Tests** | Spring Cloud Contract | API contract validation |
| **Security Tests** | Spring Security Test | Authentication and authorization |

### **Frontend Testing Stack**
| Layer | Framework | Purpose |
|-------|-----------|---------|
| **Unit Tests** | Vitest + Testing Library | Component and hook testing |
| **Integration Tests** | React Testing Library | Component interaction testing |
| **E2E Tests** | Playwright (planned) | Full user workflow testing |
| **Visual Tests** | Chromatic (planned) | UI regression testing |

---

## ⚙️ Backend Testing

### **Unit Testing Example**
```java
@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {
    
    @Mock
    private ReservaRepository reservaRepository;
    
    @Mock
    private EquipoRepository equipoRepository;
    
    @InjectMocks
    private ReservaService reservaService;
    
    @Test
    @DisplayName("Should create reservation successfully with valid data")
    void shouldCreateReservaSuccessfully() {
        // Given
        CrearReservaDto dto = CrearReservaDto.builder()
            .clienteId(UUID.randomUUID())
            .equipoIds(List.of(UUID.randomUUID()))
            .fechaInicio(LocalDate.now().plusDays(1))
            .fechaFin(LocalDate.now().plusDays(3))
            .build();
            
        Cliente cliente = createMockCliente();
        EquipoDeportivo equipo = createMockEquipo();
        
        when(clienteRepository.findById(dto.getClienteId()))
            .thenReturn(Optional.of(cliente));
        when(equipoRepository.findById(any()))
            .thenReturn(Optional.of(equipo));
        when(reservaRepository.save(any(Reserva.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        ReservaDto result = reservaService.crearReserva(dto);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEstado()).isEqualTo(EstadoReserva.CONFIRMADA);
        assertThat(result.getTotal()).isGreaterThan(BigDecimal.ZERO);
        
        verify(reservaRepository).save(any(Reserva.class));
    }
    
    @Test
    @DisplayName("Should throw exception when equipment not available")
    void shouldThrowExceptionWhenEquipmentNotAvailable() {
        // Given
        CrearReservaDto dto = createReservaDto();
        EquipoDeportivo equipoOcupado = createMockEquipo();
        equipoOcupado.setEstado(EstadoEquipo.RESERVADO);
        
        when(equipoRepository.findById(any()))
            .thenReturn(Optional.of(equipoOcupado));
        
        // When & Then
        assertThrows(EquipoNoDisponibleException.class, () -> {
            reservaService.crearReserva(dto);
        });
        
        verify(reservaRepository, never()).save(any());
    }
}
```

### **Integration Testing Example**
```java
@SpringBootTest
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
class ReservaControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Test
    @WithMockUser(roles = "USER")
    void shouldCreateReservaEndToEnd() {
        // Given
        Cliente cliente = createAndSaveCliente();
        EquipoDeportivo equipo = createAndSaveEquipo();
        
        CrearReservaDto dto = CrearReservaDto.builder()
            .clienteId(cliente.getId())
            .equipoIds(List.of(equipo.getId()))
            .fechaInicio(LocalDate.now().plusDays(1))
            .fechaFin(LocalDate.now().plusDays(3))
            .build();
        
        // When
        ResponseEntity<ReservaDto> response = restTemplate.postForEntity(
            "/api/reservas", dto, ReservaDto.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getId()).isNotNull();
        
        // Verify database state
        Reserva savedReserva = entityManager.find(Reserva.class, 
            response.getBody().getId());
        assertThat(savedReserva).isNotNull();
        assertThat(savedReserva.getEstado()).isEqualTo(EstadoReserva.CONFIRMADA);
    }
}
```

### **Repository Testing Example**
```java
@DataJpaTest
class ReservaRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private ReservaRepository reservaRepository;
    
    @Test
    void shouldFindReservasByClienteAndDateRange() {
        // Given
        Cliente cliente = createAndSaveCliente();
        LocalDate fechaInicio = LocalDate.now();
        LocalDate fechaFin = LocalDate.now().plusDays(7);
        
        createAndSaveReserva(cliente, fechaInicio, fechaFin);
        createAndSaveReserva(cliente, fechaInicio.plusDays(10), fechaFin.plusDays(10));
        
        // When
        List<Reserva> reservas = reservaRepository
            .findByClienteAndFechasBetween(cliente.getId(), fechaInicio, fechaFin);
        
        // Then
        assertThat(reservas).hasSize(1);
        assertThat(reservas.get(0).getCliente()).isEqualTo(cliente);
    }
}
```

---

## ⚛️ Frontend Testing

### **Component Unit Testing**
```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReservaForm } from '../components/reservas/ReservaForm';

describe('ReservaForm', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });
  
  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ReservaForm {...props} />
      </QueryClientProvider>
    );
  };
  
  test('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    
    renderComponent({ onSubmit: mockOnSubmit });
    
    // Fill form fields
    await user.selectOptions(screen.getByLabelText(/cliente/i), 'cliente-id-1');
    await user.selectOptions(screen.getByLabelText(/equipo/i), 'equipo-id-1');
    await user.type(screen.getByLabelText(/fecha inicio/i), '2025-12-01');
    await user.type(screen.getByLabelText(/fecha fin/i), '2025-12-03');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /crear reserva/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        clienteId: 'cliente-id-1',
        equipoIds: ['equipo-id-1'],
        fechaInicio: '2025-12-01',
        fechaFin: '2025-12-03',
      });
    });
  });
  
  test('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    renderComponent();
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /crear reserva/i }));
    
    // Check validation errors
    expect(screen.getByText(/cliente es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/selecciona al menos un equipo/i)).toBeInTheDocument();
  });
});
```

### **Custom Hook Testing**
```jsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReservas } from '../hooks/useReservas';
import * as reservaService from '../services/reservaService';

jest.mock('../services/reservaService');

describe('useReservas', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });
  
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  test('should fetch reservas successfully', async () => {
    const mockReservas = [
      { id: '1', cliente: 'Juan Pérez', estado: 'CONFIRMADA' },
      { id: '2', cliente: 'María García', estado: 'PENDIENTE' },
    ];
    
    reservaService.getReservas.mockResolvedValue(mockReservas);
    
    const { result } = renderHook(() => useReservas(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(mockReservas);
    expect(reservaService.getReservas).toHaveBeenCalledTimes(1);
  });
});
```

### **Integration Testing**
```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ReservasPage } from '../pages/ReservasPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API service
jest.mock('../services/reservaService', () => ({
  getReservas: jest.fn(),
  crearReserva: jest.fn(),
}));

describe('ReservasPage Integration', () => {
  test('should display reservas and allow creating new ones', async () => {
    const user = userEvent.setup();
    
    // Setup providers
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ReservasPage />
        </QueryClientProvider>
      </BrowserRouter>
    );
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText(/Lista de Reservas/i)).toBeInTheDocument();
    });
    
    // Test creating new reservation
    await user.click(screen.getByText(/Nueva Reserva/i));
    
    expect(screen.getByText(/Crear Nueva Reserva/i)).toBeInTheDocument();
  });
});
```

---

## 🔧 Test Configuration

### **Backend Test Configuration**
```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: http://localhost:8080/.well-known/jwks_test.json

logging:
  level:
    com.deportur: DEBUG
    org.springframework.security: DEBUG
```

### **Frontend Test Configuration**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
});
```

```javascript
// src/test/setup.js
import '@testing-library/jest-dom';

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { sub: 'test-user-id', email: 'test@example.com' },
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
  }),
  withAuthenticationRequired: (component) => component,
}));

// Global test utils
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

---

## 🚀 Running Tests

### **Backend Testing Commands**
```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ReservaServiceTest

# Run tests with coverage
./mvnw test jacoco:report

# Run integration tests only
./mvnw test -Dtest="**/*IntegrationTest"

# Run tests in continuous mode
./mvnw test -Dspring.profiles.active=test -Dspring-boot.run.fork=false
```

### **Frontend Testing Commands**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- ReservaForm.test.jsx

# Run tests matching pattern
npm run test -- --grep "should create"
```

---

## 📊 Test Coverage Goals

### **Backend Coverage Targets**
- **Service Layer**: > 90%
- **Repository Layer**: > 80%
- **Controller Layer**: > 85%
- **Utility Classes**: > 95%

### **Frontend Coverage Targets**
- **Components**: > 80%
- **Custom Hooks**: > 90%
- **Services**: > 85%
- **Utilities**: > 95%

---

## 🎯 Testing Best Practices

### **General Principles**
- ✅ **Test behavior, not implementation**
- ✅ **Write descriptive test names**
- ✅ **Use AAA pattern** (Arrange, Act, Assert)
- ✅ **Keep tests isolated and independent**
- ✅ **Mock external dependencies**
- ✅ **Test edge cases and error scenarios**

### **Backend Best Practices**
- Use `@MockBean` for Spring components
- Test repository methods with `@DataJpaTest`
- Use `@WebMvcTest` for controller testing
- Implement custom `TestConfiguration` for common setup
- Use `@Sql` for database test data setup

### **Frontend Best Practices**
- Use `screen.getByRole()` over `querySelector()`
- Test user interactions, not implementation details
- Mock API calls at the service level
- Use `waitFor()` for async operations
- Create custom render utilities for providers

---

## 🐛 Debugging Tests

### **Backend Test Debugging**
```java
// Enable debug logging for tests
@TestPropertySource(properties = {
    "logging.level.com.deportur=DEBUG",
    "spring.jpa.show-sql=true"
})

// Use @Sql to inspect database state
@Sql(statements = "SELECT * FROM reserva", 
     executionPhase = AFTER_TEST_METHOD)
```

### **Frontend Test Debugging**
```javascript
// Debug component state
import { screen } from '@testing-library/react';

test('debug test', () => {
  render(<MyComponent />);
  screen.debug(); // Prints current DOM
});

// Debug queries
import { logRoles } from '@testing-library/dom';

test('debug roles', () => {
  const { container } = render(<MyComponent />);
  logRoles(container); // Shows available roles
});
```

---

## 📈 Continuous Integration

### **GitHub Actions Test Pipeline**
```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run backend tests
        run: ./mvnw test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run frontend tests
        run: npm run test:coverage
```

---

*Testing is not just about finding bugs—it's about building confidence in your code!*
# Adopaws — Backend Foundation

A modular monolith backend for the **Adopaws** platform, supporting pet adoption, a marketplace for pet-related items, and veterinarian/association consultations.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | .NET 8 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 8 |
| Database | SQL Server |
| API Docs | Swagger / OpenAPI (Swashbuckle) |
| Architecture | Modular Monolith — Layered / Clean Architecture |

---

## Solution Structure

```
Adopaws.sln
│
├── Adopaws.Api                   # Presentation layer
│   ├── Controllers/              # Thin REST controllers
│   ├── Middlewares/              # Global exception handling
│   ├── Extensions/               # Swagger & service registration helpers
│   ├── appsettings.json
│   └── Program.cs
│
├── Adopaws.Application           # Business logic layer
│   ├── DTOs/                     # Request/response models
│   ├── Interfaces/               # Repository & service contracts
│   ├── Services/                 # Use-case implementations
│   └── Mappings/                 # Entity ↔ DTO mappers
│
├── Adopaws.Domain                # Core domain layer (no dependencies)
│   └── Entities/                 # Clean entity classes
│
└── Adopaws.Infrastructure        # Data access layer
    ├── Persistence/              # AdopawsDbContext
    ├── Configurations/           # Fluent API entity configurations
    ├── Repositories/             # EF Core repository implementations
    └── DependencyInjection/      # IServiceCollection extensions
```

---

## Domain Model

### Entities & Relationships

```
Users ──────< Pets ──────< PetPhotos
  │               └──────< AdoptionRequests >──── Users
  ├──────────< MarketplaceItems
  ├──────────< Consultations (as Sender)
  ├──────────< Consultations (as Receiver)
  └──────────< ConsultationResponses

Consultations ──────< ConsultationResponses
```

### Key Constraints
- `AdoptionRequests`: unique constraint on `(IdPet, IdUser)` — one request per user per pet.
- `Users.Email`: unique index.

---

## API Endpoints

| Controller | Route | Methods |
|---|---|---|
| Users | `/api/users` | GET, POST |
| Users | `/api/users/{id}` | GET, PUT, DELETE |
| Pets | `/api/pets` | GET, POST |
| Pets | `/api/pets/{id}` | GET, PUT, DELETE |
| PetPhotos | `/api/pet-photos/by-pet/{petId}` | GET |
| PetPhotos | `/api/pet-photos` | POST |
| PetPhotos | `/api/pet-photos/{id}` | DELETE |
| AdoptionRequests | `/api/adoption-requests/{id}` | GET |
| AdoptionRequests | `/api/adoption-requests/by-pet/{petId}` | GET |
| AdoptionRequests | `/api/adoption-requests/by-user/{userId}` | GET |
| AdoptionRequests | `/api/adoption-requests` | POST |
| AdoptionRequests | `/api/adoption-requests/{id}/status` | PATCH |
| AdoptionRequests | `/api/adoption-requests/{id}` | DELETE |
| MarketplaceItems | `/api/marketplace-items` | GET, POST |
| MarketplaceItems | `/api/marketplace-items/{id}` | GET, PUT, DELETE |
| Consultations | `/api/consultations/{id}` | GET |
| Consultations | `/api/consultations/by-sender/{senderUserId}` | GET |
| Consultations | `/api/consultations/by-receiver/{receiverUserId}` | GET |
| Consultations | `/api/consultations` | POST |
| Consultations | `/api/consultations/{id}/status` | PATCH |
| ConsultationResponses | `/api/consultation-responses/by-consultation/{consultationId}` | GET |
| ConsultationResponses | `/api/consultation-responses` | POST |

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (local or remote)
- EF Core CLI tools

### 1. Install EF Core CLI Tools

```bash
dotnet tool install --global dotnet-ef
```

### 2. Configure the Connection String

Edit `Adopaws.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=AdopawsDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

Adjust `Server=.` to your SQL Server instance if needed (e.g., `Server=localhost,1433`).

### 3. Run EF Core Migrations

From the **solution root** (where `Adopaws.sln` lives):

```bash
# Create the initial migration
dotnet ef migrations add InitialCreate \
  --project Adopaws.Infrastructure \
  --startup-project Adopaws.Api

# Apply the migration to create AdopawsDB
dotnet ef database update \
  --project Adopaws.Infrastructure \
  --startup-project Adopaws.Api
```

### 4. Run the API

```bash
cd Adopaws.Api
dotnet run
```

Swagger UI will be available at: **http://localhost:{port}/**

---

## Design Decisions

### Architecture
- **Modular Monolith / Layered Architecture** — Domain has zero external dependencies. Application depends only on Domain. Infrastructure implements Application contracts. API depends on Application and Infrastructure.
- **Thin Controllers** — Controllers only validate input and delegate to services; all business logic lives in the Application layer.
- **Repository Pattern** — Repositories are defined as interfaces in Application and implemented in Infrastructure, keeping the Application layer database-agnostic.

### Error Handling
- Global `ExceptionHandlingMiddleware` catches all unhandled exceptions and returns consistent JSON error responses with `statusCode`, `message`, and `timestamp`.

### Dependency Injection
- All registrations are encapsulated in `InfrastructureServiceExtensions.AddInfrastructure()` to keep `Program.cs` clean.

### Future Authentication
- `appsettings.json` includes a `Jwt` section as a placeholder.
- Swagger is pre-configured with a Bearer token security definition.
- No authentication is implemented yet — add `Microsoft.AspNetCore.Authentication.JwtBearer` and configure middleware when ready.

---

## Next Steps

1. **Add input validation** — Add FluentValidation or DataAnnotations to DTOs.
2. **Implement JWT authentication** — Use the `Jwt` config section in `appsettings.json`.
3. **Add pagination** — Wrap list responses in `PagedResult<T>`.
4. **Add filtering** — Query parameters on `/api/pets`, `/api/marketplace-items`, etc.
5. **Add unit tests** — Test services using mocked repositories.
6. **Add integration tests** — Use `WebApplicationFactory` with an in-memory database.

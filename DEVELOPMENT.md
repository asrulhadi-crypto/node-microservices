# Development Guide

## Project Structure

```
node-microserv-exp/
├── services/
│   ├── api-gateway/          # Port 3000 - Entry point for all requests
│   ├── user-service/         # Port 3001 - User management & auth
│   ├── product-service/      # Port 3002 - Product catalog
│   └── order-service/        # Port 3003 - Order processing
├── packages/
│   └── shared/               # Shared utilities, types, and helpers
├── scripts/
│   ├── setup.sh              # Initial setup script
│   └── seed.sh               # Database seeding script
├── docker-compose.yml        # Docker orchestration
└── package.json              # Root package with workspaces
```

## Architecture Patterns

### 1. Database per Service
Each service has its own PostgreSQL database:
- `microservices_user` - User data
- `microservices_product` - Product catalog
- `microservices_order` - Order data

### 2. API Gateway Pattern
All client requests go through the API Gateway which:
- Handles authentication
- Routes requests to appropriate services
- Implements rate limiting
- Aggregates responses

### 3. Synchronous Communication
Services communicate via HTTP/REST for immediate responses.

### 4. Shared Kernel
The `@shared/utils` package contains:
- Common error classes
- Logging utilities
- Zod validators
- TypeScript types

## Local Development

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL (for local development without Docker)
- Docker & Docker Compose (recommended)

### Quick Start with Docker

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

### Local Development (without Docker)

```bash
# 1. Setup
./scripts/setup.sh

# 2. Configure environment
cp .env.example .env
# Edit .env with your local database credentials

# 3. Create databases
createdb microservices_user
createdb microservices_product
createdb microservices_order

# 4. Run migrations
# (SQL files are in each service's database/migrations folder)

# 5. Start all services in dev mode
npm run dev

# Or start individual services
npm run dev:user
npm run dev:product
npm run dev:order
npm run dev:gateway
```

## Testing

```bash
# Run all tests
npm test

# Test specific service
npm test --workspace=services/user-service
```

## Code Style

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Adding a New Service

1. Create service directory:
```bash
mkdir -p services/new-service/src
```

2. Copy package.json from an existing service and update name

3. Create tsconfig.json:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

4. Add to root package.json workspaces

5. Add to docker-compose.yml

6. Update API Gateway routes

## Environment Variables

### API Gateway
| Variable | Default | Description |
|----------|---------|-------------|
| GATEWAY_PORT | 3000 | Server port |
| USER_SERVICE_URL | http://localhost:3001 | User service URL |
| PRODUCT_SERVICE_URL | http://localhost:3002 | Product service URL |
| ORDER_SERVICE_URL | http://localhost:3003 | Order service URL |
| JWT_SECRET | - | Secret for JWT tokens |
| CORS_ORIGIN | * | Allowed CORS origins |

### User Service
| Variable | Default | Description |
|----------|---------|-------------|
| USER_SERVICE_PORT | 3001 | Server port |
| USER_DB_HOST | localhost | Database host |
| USER_DB_NAME | microservices_user | Database name |
| JWT_SECRET | - | Secret for JWT tokens |
| JWT_EXPIRES_IN | 24h | Token expiration |

### Product Service
| Variable | Default | Description |
|----------|---------|-------------|
| PRODUCT_SERVICE_PORT | 3002 | Server port |
| PRODUCT_DB_HOST | localhost | Database host |
| PRODUCT_DB_NAME | microservices_product | Database name |

### Order Service
| Variable | Default | Description |
|----------|---------|-------------|
| ORDER_SERVICE_PORT | 3003 | Server port |
| ORDER_DB_HOST | localhost | Database host |
| ORDER_DB_NAME | microservices_order | Database name |
| PRODUCT_SERVICE_URL | http://localhost:3002 | Product service URL |

## Debugging

### Using VS Code

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "API Gateway",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:gateway"],
      "autoAttachChildProcesses": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "User Service",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:user"],
      "autoAttachChildProcesses": true
    }
  ]
}
```

### Logging

Logs are written to:
- Console (development)
- `logs/<service-name>.log` (all levels)
- `logs/<service-name>-error.log` (errors only)

## Common Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL (macOS with Homebrew)
brew services restart postgresql@15
```

### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild
npm run docker:build
npm run docker:up
```

## Performance Tips

1. **Connection Pooling**: Already configured in database.ts
2. **Caching**: Add Redis for frequently accessed data
3. **Rate Limiting**: Configured in API Gateway
4. **Database Indexes**: Defined in migrations

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Set appropriate CORS_ORIGIN
- [ ] Enable rate limiting
- [ ] Use environment-specific database credentials
- [ ] Regular dependency updates
- [ ] Input validation on all endpoints

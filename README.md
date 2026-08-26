# Node.js Microservices Architecture

A production-ready microservices architecture built with Node.js, demonstrating best practices for scalable distributed systems.

## 🏗️ Architecture

```
┌─────────────────┐
│   API Gateway   │ (Port 3000)
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
    ▼         ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│  User  │ │ Product│ │  Order │ │  Message   │
│ Service│ │ Service│ │ Service│ │  Broker    │
│ :3001  │ │ :3002  │ │ :3003  │ │ (RabbitMQ) │
└────────┘ └────────┘ └────────┘ └────────────┘
    │         │            │            │
    └─────────┴────────────┴────────────┘
                      │
                ┌─────▼─────┐
                │  Redis    │
                │  Cache    │
                └───────────┘
```

## 📁 Project Structure

```
node-microserv-exp/
├── services/
│   ├── api-gateway/       # API Gateway service
│   ├── user-service/      # User management
│   ├── product-service/   # Product catalog
│   └── order-service/     # Order processing
├── packages/
│   └── shared/            # Shared utilities and types
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🚀 Features

- **API Gateway**: Centralized routing, authentication, rate limiting
- **Service Discovery**: Internal service communication
- **Message Broker**: Async communication via RabbitMQ
- **Caching**: Redis for performance optimization
- **Database**: PostgreSQL for each service (Database per Service pattern)
- **Authentication**: JWT-based auth with centralized validation
- **Logging**: Structured logging with Winston
- **Monitoring**: Prometheus metrics and health checks
- **Docker**: Full containerization support

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Container**: Docker & Docker Compose

## 📦 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Docker & Docker Compose
- npm >= 9.0.0

### Quick Start

1. **Clone and install dependencies**
```bash
cd node-microserv-exp
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
```

3. **Run with Docker (Recommended)**
```bash
npm run docker:up
```

4. **Or run locally**
```bash
# Start all services
npm run dev

# Or start individual services
npm run dev:user
npm run dev:product
npm run dev:order
npm run dev:gateway
```

## 📡 API Endpoints

### API Gateway (Port 3000)

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

#### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile

#### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Health Checks
- `GET /health` - Gateway health
- `GET /api/users/health` - User service health
- `GET /api/products/health` - Product service health
- `GET /api/orders/health` - Order service health

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific service
npm test --workspace=services/user-service
```

## 📊 Monitoring

Each service exposes metrics at `/metrics` endpoint (Prometheus format).

Health checks available at `/health` for each service.

## 🐳 Docker Commands

```bash
# Build all containers
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs
```

## 🔄 Inter-Service Communication

Services communicate via:
1. **HTTP** (synchronous) - For immediate responses
2. **RabbitMQ** (asynchronous) - For event-driven workflows

Example events:
- `order.created` - Triggered when new order is placed
- `order.completed` - Triggered when order is fulfilled
- `user.registered` - Triggered when user registers

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT

# dema-instalacoes

A modern, type-safe API built with [Igniter.js](https://github.com/felipebarcelospro/igniter-js) and nextjs.

## Features

- **logging**: Enabled
- **telemetry**: Enabled
- **Database**: postgresql
- **Docker**: Compose setup included

## Development

### Prerequisites

- Node.js 18+
- bun
- Docker and Docker Compose

### Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start services with Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Setup database:**
   ```bash
   bun run db:push
   ```

4. **Start development server:**
   ```bash
   bun run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
src/
├── igniter.ts                     # Core initialization
├── igniter.client.ts              # Client implementation
├── igniter.context.ts             # Context management
├── igniter.router.ts              # Router configuration
├── igniter.schema.ts             # Schemas configuration
├── features/                      # Application features
│   └── example/
│       ├── controllers/           # Feature controllers
│       ├── procedures/            # Feature procedures/middleware
│       ├── example.interfaces.ts  # Type definitions
│       └── index.ts               # Feature exports
└── providers/                     # Providers layer
```

## API Endpoints

- `GET /api/v1/example` - Health check



## Learn More

- [Igniter.js Documentation](https://github.com/felipebarcelospro/igniter-js)
- [nextjs Documentation](https://docs.nextjs.org)
- [Prisma Documentation](https://prisma.io/docs)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

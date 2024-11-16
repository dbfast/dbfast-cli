# DBFast MVP

🚀 Natural language database interface for TypeScript developers. Write schemas and queries in plain English, get type-safe database operations.

> ⚠️ **Early Development**: Core features only. Advanced features coming soon.

## Features

✨ Current:
- Natural language schema definition
- Prisma schema generation
- Type-safe outputs
- CLI tools for quick setup

🔮 Coming Soon:
- Smart query optimization
- Usage pattern detection
- Automatic field selection
- Real-time adaptivity

## Quick Start

```bash
# Initialize new project
npx dbfast-cli init

# Create schema in plain English
npx dbfast-cli generate "
  User has:
  - name (text)
  - email (text)
  - age (number)

  has many Posts
"
```

### Generated Prisma Schema:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  age       Int
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

## Development

```bash
# Install deps
npm install

# Run tests
npm test

# Build
npm run build
```

## Contributing

PRs welcome! Check out our [contribution guidelines](CONTRIBUTING.md).

## License

- Core Features (this repo): MIT
- Advanced Features (coming soon): Proprietary

## Author

[@0xultrainstinct](https://twitter.com/0xultrainstinct)
```

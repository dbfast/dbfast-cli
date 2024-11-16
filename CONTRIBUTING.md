# Contributing to DBFast

🔥 First off, thanks for taking the time to contribute!

## Development Process

1. Fork the repo
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Write tests
4. Make your changes
5. Run tests (`npm test`)
6. Commit (`git commit -am 'feat: add amazing feature'`)
7. Push (`git push origin feat/amazing-feature`)
8. Open a Pull Request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `test:` adding tests
- `refactor:` code change that neither fixes a bug nor adds a feature
- `chore:` other changes that don't modify src or test files

## Pull Request Guidelines

1. Update the README.md with details of changes if needed
2. Update the tests if needed
3. Make sure all tests pass
4. Request review from maintainers

## Development Setup
```bash
npm install
npm run build
npm test
```

## Code Style

- Use TypeScript
- Follow existing patterns
- Add JSDoc comments for public APIs
- Keep it strongly typed
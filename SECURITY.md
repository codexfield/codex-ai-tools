# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to [INSERT_EMAIL]. Do not create a public issue.

## API Keys & Secrets

- Never commit API keys or secrets to the repository
- Use environment variables for sensitive data
- Document required keys in your tool's README
- Consider using backend proxies for API calls

## Code Review Process

All PRs are reviewed for:
- Exposed credentials
- Malicious code
- Dependency vulnerabilities
- Secure coding practices

## Dependencies

- Keep dependencies up to date
- Review security advisories
- Use `dependabot` alerts

## Best Practices

1. Use HTTPS for all API calls
2. Validate user input
3. Follow OWASP guidelines
4. Minimize third-party dependencies
5. Document security considerations

## Contact

For security concerns, please contact:
- Email: [INSERT_EMAIL]
- GitHub: Open a security advisory
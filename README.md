# assetFlow

## Mailpit

For local password-reset emails, start Mailpit:

```bash
docker compose up -d mailpit
```

Mailpit exposes:

- SMTP on `localhost:1025`
- Web UI on [http://localhost:8025](http://localhost:8025)

The API is configured to send reset emails there by default through SMTP.

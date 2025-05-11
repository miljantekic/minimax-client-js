# Minimax API Reference

This document provides detailed information about the Minimax accounting API for use with the minimax-client JavaScript library.

## Base URLs

- **API Base**: `https://moj.minimax.rs/RS/API/`
- **Authentication**: `https://moj.minimax.rs/RS/AUT/oauth20/token`
- **API Documentation**: `https://moj.minimax.rs/RS/API/swagger/ui/index`

## Authentication

The Minimax API uses OAuth 2.0 for authentication with the password grant flow.

### Authentication Process

1. Register an application in the Minimax account portal to obtain client credentials
2. Use these credentials along with user credentials to obtain an access token
3. Include the access token in all API requests

### Required Parameters for Authentication

| Parameter | Description |
|-----------|-------------|
| client_id | Your application's client ID |
| client_secret | Your application's client secret |
| grant_type | Must be set to "password" |
| username | The username of the Minimax user |
| password | The password of the Minimax user |
| scope | Must be set to "minimax.rs" |

### Token Response

```json
{
  "access_token": "your-access-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "your-refresh-token"
}
```

### Usage in API Requests

Add the access token to the Authorization header in all API requests:

```
Authorization: Bearer your-access-token
```

## Concurrency Control

The Minimax API uses `RowVersion` data for concurrency control. When updating records:

1. First, retrieve the current version of the record, which includes the `RowVersion` field
2. Include the `RowVersion` in your update request
3. If the record has been changed by another process, the API will return a concurrency error

### Concurrency Error

```
Concurrency error - record changed by another action (RowVersion)
```

## Sample Repositories

Minimax provides sample code repositories that can be referenced:

- PHP: [MinimaxAPISamplePHP](https://github.com/minimaxapi/MinimaxAPISamplePHP)
- C#: [MinimaxAPISample](https://github.com/minimaxapi/MinimaxAPISample)

## Important Considerations

- After several failed authentication attempts, the application may be locked, requiring recreation through the Minimax profile
- The API documentation is primarily in Serbian
- API follows REST principles with JSON data exchange

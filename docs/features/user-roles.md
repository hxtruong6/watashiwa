# User Roles & Permissions

## Overview

Multi-tier permission system to manage content moderation and administrative functions.

## Role Hierarchy

| Role | Level | Description |
|:-----|:------|:------------|
| **Admin** | 3 | Full system access. Can manage users, roles, and all content. |
| **Moderator** | 2 | Can hide/delete comments, manage reported content. Cannot manage users or roles. |
| **User** | 1 | Default role. Can study, comment, vote, and manage own content. |

## Permission Matrix

| Action | User | Moderator | Admin |
|:-------|:----:|:---------:|:-----:|
| Study cards | ✓ | ✓ | ✓ |
| Create comments | ✓ | ✓ | ✓ |
| Vote on comments | ✓ | ✓ | ✓ |
| Edit own comments | ✓ | ✓ | ✓ |
| Delete own comments | ✓ | ✓ | ✓ |
| Hide any comment | ✗ | ✓ | ✓ |
| Delete any comment | ✗ | ✓ | ✓ |
| Access Admin Panel | ✗ | ✓ | ✓ |
| View moderation queue | ✗ | ✓ | ✓ |
| Manage user roles | ✗ | ✗ | ✓ |
| Manage system settings | ✗ | ✗ | ✓ |

## Database Schema Extension

```prisma
// Add to User model
model User {
  // ... existing fields
  role    UserRole @default(USER)
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}
```

## Admin Panel Routes

| Route | Access | Purpose |
|:------|:-------|:--------|
| `/admin` | Admin, Moderator | Dashboard overview |
| `/admin/comments` | Admin, Moderator | Comment moderation queue |
| `/admin/users` | Admin only | User management |
| `/admin/settings` | Admin only | System configuration |

## UI Components

### Role Badge

Display user role as a colored badge next to username:

- **Admin**: Red badge `#E64A19`
- **Moderator**: Blue badge `#1976D2`
- **User**: No badge (default)

### Access Guard

Middleware to protect admin routes:

```typescript
// Pseudo-code
if (user.role === 'USER') {
  redirect('/dashboard');
}
```

## Security Considerations

- Role changes require Admin action
- All admin actions are logged
- Session invalidation on role downgrade

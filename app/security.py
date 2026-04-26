# app/security.py
"""
Satark Security — JWT authentication and role-based access control.
Full implementation in Phase 2 (auth endpoints + JWT validation).

This module will provide:
  - get_current_user: Extract user from JWT bearer token
  - get_optional_user: Same but returns None if no token (for guest access)
  - require_role(*roles): FastAPI dependency that enforces role membership
"""

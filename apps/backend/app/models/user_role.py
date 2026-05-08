from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    SUPER_ADMIN = "super_admin"
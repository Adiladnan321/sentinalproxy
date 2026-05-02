from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS = {
    "alice": {
        "user_id": "u1",
        "hashed_password": pwd_context.hash("alice123"),
        "role": "analyst"
    },
    "bob": {
        "user_id": "u2",
        "hashed_password": pwd_context.hash("bob123"),
        "role": "engineer"
    },
    "carol": {
        "user_id": "u3",
        "hashed_password": pwd_context.hash("carol123"),
        "role": "admin"
    },
}

def get_user(username: str):
    return USERS.get(username)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


from os import environ
from flask_restful import Resource, reqparse, request
from db.utils.db import Database
from psycopg2.errors import UniqueViolation
from functools import wraps
import hashlib
import secrets


def require_login(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        session_key = request.headers.get("session-key")

        if session_key is None:
            return {"message": "Error: Session key is required"}, 401

        schema = environ.get("DB_SCHEMA", "public")
        db = Database(schema)

        result = db.tables["logins"].select(where={"session_key": session_key})

        if not result:
            return {"message": "Error: Invalid session key"}, 401

        login_entry = result[0] if isinstance(result, list) else result
        request.user_id = login_entry["user_id"]

        return func(*args, **kwargs)

    return wrapper


class GetLoginTable(Resource):
    @require_login
    def get(self):
        db = Database(environ.get("DB_SCHEMA", "public"))
        return db.tables["logins"].select(["id", "user_id", "session_key"])


def generate_session_key():
    """Random 64 character string in hex, secrets library"""
    return secrets.token_hex(32)


class LoginAPI(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=str, required=True)
        parser.add_argument("password", type=str, required=True)
        args = parser.parse_args()

        db = Database(environ.get("DB_SCHEMA", "public"))

        user_result = db.tables["accounts"].select(where={"email": args["email"]})
        if not user_result:
            return {"message": "Invalid email or password"}, 401

        user = user_result[0] if isinstance(user_result, list) else user_result
        stored_password = user["password"]
        salt = user["salt"]

        """Checking if password is correct"""
        hashed_attempt = hashlib.sha512((salt + args["password"]).encode()).hexdigest()
        if stored_password != hashed_attempt:
            return {"message": "Invalid email or password"}, 401

        existing_session = db.tables["logins"].select(
            where={"user_id": str(user["id"])}
        )
        if existing_session:
            return {"message": "Error: User is already logged in!"}, 400

        session_key = generate_session_key()

        db.tables["logins"].insert({"user_id": user["id"], "session_key": session_key})

        return {"message": "Login successful", "session_key": session_key}


class LogoutAPI(Resource):
    @require_login
    def post(self):
        """This will log a user out, and remove the session key from the session table"""
        session_key = request.headers.get("session-key")

        db = Database(environ.get("DB_SCHEMA", "public"))
        user_result = db.tables["logins"].select(where={"session-key": session_key})
        if not user_result:
            return {"message": "Login session not found"}, 404

        """Delete the session keys from the logins table to fully log out"""
        db.tables["logins"].delete(where={"session-key": session_key})
        return {"message": "Logout complete"}


def get_username_by_ID(user_id):
    """Returns a username if it exists from an ID, and None if not"""
    db = Database(environ.get("DB_SCHEMA", "public"))
    result = db.tables["accounts"].select(where={"id": user_id})
    if result:
        user = result[0] if isinstance(result, list) else result
        return user["username"]
    return None

def get_user_id_from_session_key(session_key):
    """Helper function that returns a username from the session key"""
    db = Database(environ.get("DB_SCHEMA", "public"))
    result = db.tables["logins"].select(where={"session_key": session_key})
    if result:
        user_id = result[0] if isinstance(result, list) else result
        return user_id["user_id"]
    return {"message": "Error: Invalid Session Key"}, 401

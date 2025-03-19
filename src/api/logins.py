from os import environ
from flask_restful import Resource, reqparse, request
from db.utils.db import Database
from psycopg2.errors import UniqueViolation
from functools import wraps
import hashlib
import secrets

def requireLogin(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        session_key = request.headers.get('session_key')

        if not session_key:
            return {"message": "Error: Session key is required"}, 401

        schema = environ.get('DB_SCHEMA', 'public')
        db = Database(schema)

        result = db.tables['logins'].select(where={"session_key": session_key})

        print("Session key from request:", session_key)
        print("Login table contents:", db.tables['logins'].select(['user_id', 'session_key']))

        if not result:
            return {"message": "Error: Invalid session key"}, 401

        login_entry = result[0] if isinstance(result, list) else result
        request.user_id = login_entry['user_id'] 

        return func(*args, **kwargs)
    return wrapper

class GetLoginTable(Resource):
    @requireLogin
    def get(self):
        db = Database(environ.get('DB_SCHEMA', 'public'))
        return db.tables['logins'].select(['id', 'user_id', 'session_key'])

def generateSessionKey():
    """Random 64 character string in hex, secrets library"""
    return secrets.token_hex(32) 

def checkpassword(stored_hash, salt, provided_password):
    """Checks whether the provided password, when hashed with the salt, matches the stored password hash."""
    test_hash = hashlib.sha512((salt + provided_password).encode()).hexdigest()
    return stored_hash == test_hash

def hash_password(password):
    """Generates a salt and hashes the password with it"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha512((salt + password).encode()).hexdigest()
    return salt, hashed

class LoginAPI(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("username", type=str, required=True)
        parser.add_argument("password", type=str, required=True)
        args = parser.parse_args()

        db = Database(environ.get('DB_SCHEMA', 'public'))

        user_result = db.tables['accounts'].select(where={"username": args['username']})
        if not user_result:
            return {"message": "Invalid username or password"}, 401

        user = user_result[0] if isinstance(user_result, list) else user_result
        stored_password = user['password']
        salt = user['salt']

        hashed_attempt = hashlib.sha512((salt + args['password']).encode()).hexdigest()
        if stored_password != hashed_attempt:
            return {"message": "Invalid username or password"}, 401

        existing_session = db.tables['logins'].select(where={"user_id": str(user['id'])})
        if existing_session:
            return {"message": "Error: User is already logged in!"}, 400

        session_key = generateSessionKey()

        db.tables['logins'].insert({
            "user_id": user['id'],
            "session_key": session_key
        })

        return {"message": "Login successful", "session_key": session_key}

class LogoutAPI(Resource):
    def post(self):
        """This will log a user out, and remove the session key from the session table"""
        parser = reqparse.RequestParser()
        parser.add_argument("username", type=str, required=True)
        args = parser.parse_args()

        db = Database(environ.get('DB_SCHEMA', 'public'))
        user_result = db.tables['accounts'].select(where={"username": args['username']})
        if not user_result:
            return {"message": "User not found"}, 404

        user_id = user_result[0]['id'] if isinstance(user_result, list) else user_result['id']

        """Delete the session keys from the logins table to fully log out"""
        db.tables['logins'].delete(where={"user_id": str(user_id)})
        return {"message": "Logout complete"}
    
def getUsernameByID(user_id):
    """Returns a username if it exists from an ID, and None if not"""
    db = Database(environ.get('DB_SCHEMA', 'public'))
    result = db.tables['accounts'].select(where={"id": user_id})
    if result:
        user = result[0] if isinstance(result, list) else result
        return user['username']
    return None
from os import environ
from flask_restful import Resource, reqparse
from db.utils.db import Database
from psycopg2.errors import UniqueViolation

class Accounts(Resource):
  def get(self):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    return db.tables['accounts'].select(['username', 'email'])
  
  def post(self):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    parser = reqparse.RequestParser(bundle_errors=True)
    parser.add_argument('username', type=str, help="'username' must be a string", required=False)
    parser.add_argument('email', type=str, help="'email' is a required property", required=True)
    parser.add_argument('password', type=str, help="'password' is a required property", required=True)
    args = parser.parse_args()
    try:
      db.tables['accounts'].insert({ 'username': args['username'], 'email': args['email'], 'password': args['password']})
      return '', 201
    except UniqueViolation as uv:
      return { 'message': 'email already in use' }, 409
    
class Account(Resource):
  def get(self, account_id):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    try:
      accounts = db.tables['accounts'].select(['username', 'email'], { 'id': account_id })
      if len(accounts) == 1: return accounts[0], 200
      return { 'message' : 'No account found' }, 404 
    except Exception as e:
      print(e)
      return { 'message' : 'Something went wrong' }, 500
  
  def put(self, account_id):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    parser = reqparse.RequestParser(bundle_errors=True)
    parser.add_argument('username', type=str, help="'username' must be a string", required=True)
    parser.add_argument('email', type=str, help="'email' is a required property", required=True)
    parser.add_argument('password', type=str, help="'password' is a required property", required=True)
    args = parser.parse_args()
    try:
      db.tables['accounts'].update({
        'username': args['username'], 
        'email': args['email'], 
        'password': args['password']
      }, { 'id': account_id })
      return '', 200
    except UniqueViolation as uv:
      return { 'message': 'email already in use' }, 409
from flask_restful import Resource, reqparse
from db.utils.db import Database
from psycopg2.errors import UniqueViolation

class Accounts(Resource):
  db = Database('public')
  def get(self):
    return Accounts.db.tables['accounts'].select('*')
  
  def post(self):
    parser = reqparse.RequestParser()
    parser.add_argument('username', type=str, help="'username' must be a string", required=False)
    parser.add_argument('email', type=str, help="'email' is a required property", required=True)
    parser.add_argument('password', type=str, help="'password' is a required property", required=True)
    args = parser.parse_args()
    try:
      Accounts.db.tables['accounts'].insert({ 'username': args['username'], 'email': args['email'], 'password': args['password']})
    except UniqueViolation as uv:
      return 'email already in use', 409

from flask_restful import Resource, reqparse
from db.utils.db import Database

class Accounts(Resource):
  db = Database('public')
  def get(self):
    return Accounts.db.tables['accounts'].select('*')
  
  def post(self):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, help="'name' is a required property", required=True)
    parser.add_argument('password', type=str, help="'password' is a required property", required=True)
    args = parser.parse_args()
    return Accounts.db.tables['accounts'].insert({ 'name': args['name'], 'password': args['password']})

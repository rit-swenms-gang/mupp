from dotenv import load_dotenv
from os import environ
from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
from db.utils.db import Database

from api.accounts import Accounts, Account
from api.logins import LoginAPI, LogoutAPI, GetLoginTable

try:
  environ.pop('DB_SCHEMA')
except Exception as e:
  print('No environment var DB_SCHEMA. Continuing')
load_dotenv()

class Root(Resource):
  def get(self):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    return db.tables['mupp_setup_demo'].select('*')

app = Flask(__name__)
CORS(app)
api = Api(app)

api.add_resource(Root, '/')
api.add_resource(Accounts, '/accounts')
api.add_resource(Account, '/accounts/<int:account_id>')
api.add_resource(LoginAPI, '/login')
api.add_resource(LogoutAPI, '/logout')
api.add_resource(GetLoginTable, '/logins') #This api call is just for testing, and making sure the wrapper function is working correctly

if __name__ == '__main__':
  app.run(host='::', port=5001, debug=True)
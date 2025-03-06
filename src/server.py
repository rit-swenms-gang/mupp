from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
from db.utils.db import Database

from api.acounts import Accounts

class Root(Resource):
  def get(self):
    db = Database('public')
    return db.tables['mupp_setup_demo'].select('*')

app = Flask(__name__)
CORS(app)
api = Api(app)

api.add_resource(Root, '/')
api.add_resource(Accounts, '/accounts')

if __name__ == '__main__':
  app.run(host='::', port=5001, debug=True)
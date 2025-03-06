from flask_restful import Resource
from db.utils.db import Database;

class Accounts(Resource):
  def get(self):
    db = Database('public')
    return db.tables['accounts'].select('*')
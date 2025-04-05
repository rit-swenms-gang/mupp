from os import environ
from flask_restful import Resource, reqparse
from psycopg2.errors import ForeignKeyViolation
from db.utils.db import Database
from db.form_hosting import generate_form_table

class Forms(Resource):
  def post(self):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    # TODO: Form structure validation, login and posting to database
    parser = reqparse.RequestParser(bundle_errors=True)
    parser.add_argument('account_id', type=int, help="Forms must have an owner 'account_id'", required=True)
    args = parser.parse_args()
    form = None

    try:
      form = db.tables['hosted_forms'].insert({'account_id': args['account_id']}, ['id'])
    except ForeignKeyViolation:
      return { 'message': 'Account not found' }, 406
    
    try:
      generate_form_table(db, form['id'])
      return { 'form_endpoint': form['id'] }, 200
    except Exception as e:
      print(e)
      return { 'message': 'Something went wrong' }, 500

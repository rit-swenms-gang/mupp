from os import environ
from flask import request
from flask_restful import Resource, reqparse
from psycopg2.errors import ForeignKeyViolation
from db.utils.db import Database
from db.form_hosting import generate_form_table, format_table_name
from json import dumps

class Forms(Resource):
  def post(self):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    # TODO: Form structure validation, login and posting to database
    parser = reqparse.RequestParser(bundle_errors=True)
    parser.add_argument('account_id', type=int, help="Forms must have an owner 'account_id'", required=True)
    parser.add_argument('form_structure', type=dict, help="Forms must have form data 'form_structure'", required=True)
    args = parser.parse_args()

    try:
      form = db.tables['hosted_forms'].insert({
        'account_id': args['account_id'],
        'form_structure': dumps(args['form_structure'])
        }, ['id'])
      generate_form_table(db, form['id'])
      # TODO: Consider returning formatted id
      return { 'form_endpoint': form['id'] }, 201
    except ForeignKeyViolation:
      return { 'message': 'Account not found' }, 406
    except Exception as e:
      print(e)
      return { 'message': 'Something went wrong' }, 500
    
class Form(Resource):
  def get(self, form_id:str):
    form_name = format_table_name(form_id)
    db = Database(environ.get('DB_SCHEMA', 'public'))
    if db.tables.get(form_name) is None:
      return { 'message': 'Form not found' }, 404
    try:
      data = db.tables.get('hosted_forms').select(['form_structure'], { 'id::text': form_id }, 1)
      return data, 200
    except Exception as e:
      print(e)
      return { 'message': 'Something went wrong' }, 500
  
  def post(self, form_id:str):
    db = Database(environ.get('DB_SCHEMA', 'public'))
    body = request.get_json()
    table_name = format_table_name(form_id)
    if db.tables.get(table_name) is None:
      return { 'message': 'Form not found' }, 404
    try:
      db.tables[table_name].insert(body)
      return '', 201
    except Exception as e:
      print(e)
      return { 'message': 'Unable to submit' }, 500

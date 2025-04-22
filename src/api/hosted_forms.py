from os import environ
from flask import request
from flask_restful import Resource, reqparse
from psycopg2.errors import ForeignKeyViolation
from db.utils.db import Database
from db.form_hosting import generate_form_table, format_table_name
from json import dumps, loads
from api.logins import require_login, get_user_id_from_session_key
from db.form_hosting import generate_groupings_for_form
from flask import jsonify
import traceback



class Forms(Resource):
    @require_login
    def get(self):        
        db = Database(environ.get("DB_SCHEMA", "public"))
        user_id = get_user_id_from_session_key(request.headers.get('Session-Key'))
        return (db.tables['hosted_forms'].select(where={ 'account_id': user_id }))
    
    @require_login
    def post(self):
        db = Database(environ.get("DB_SCHEMA", "public"))
        # TODO: Form structure validation, login and posting to database
        parser = reqparse.RequestParser(bundle_errors=True)
        parser.add_argument(
            "form_structure",
            type=dict,
            help="Forms must have form data 'form_structure'",
            required=True,
        )
        args = parser.parse_args()

        account_id = get_user_id_from_session_key(request.headers.get('Session-Key'))
        print(account_id, args.get('form_structure'))

        try:
            # print("Parsed args:", args)
            form = db.tables["hosted_forms"].insert(
                {
                    "account_id": account_id,
                    "form_structure": dumps(args["form_structure"]),
                },
                ["id"],
            )

            # print("Inserted into hosted_forms, new form id:", form["id"])
            generate_form_table(db, form["id"])
            # TODO: Consider returning formatted id
            return {"form_endpoint": form["id"]}, 201
        except ForeignKeyViolation:
            return {"message": "Account not found"}, 406
        except Exception as e:
            print(e)
            return {"message": "Something went wrong"}, 500


class Form(Resource):
    @require_login
    def delete(self, form_id: str):
        db = Database(environ.get("DB_SCHEMA", "public"))

        # Delete form table if it exists
        table_name = format_table_name(form_id)
        if db.tables.get(table_name):
            db.exec_commit(f'DROP TABLE IF EXISTS {table_name}')

        # Delete from hosted_forms
        try:
            result = db.tables["hosted_forms"].delete(where={"id": form_id})
            if result == 0:
                return {"message": "Form not found"}, 404
            return "", 204
        except Exception as e:
            print(e)
            return {"message": "Failed to delete form"}, 500

    def get(self, form_id: str):
        form_name = format_table_name(form_id)
        db = Database(environ.get("DB_SCHEMA", "public"))
        if db.tables.get(form_name) is None:
            return {"message": "Form not found"}, 404
        try:
            data = db.tables.get("hosted_forms").select(
                ["form_structure"], {"id": form_id}, 1
            )
            data['form_structure'] = loads(data['form_structure'])
            return data, 200
        except Exception as e:
            print(e)
            return {"message": "Something went wrong"}, 500

    def post(self, form_id: str):
        db = Database(environ.get("DB_SCHEMA", "public"))
        body = request.get_json()
        table_name = format_table_name(form_id)
        if db.tables.get(table_name) is None:
            return {"message": "Form not found"}, 404
        try:
            valid_fields = db.tables[table_name]._columns
            ordered_columns = [col["column_name"] for col in valid_fields if col["column_name"] != "id"]

            print("Ordered columns:", ordered_columns)
            print("Incoming body values:", list(body.values()))

            values = list(body.values())  

            if len(values) != len(ordered_columns):
                return {"message": "Mismatched fields"}, 400

            insert_dict = {}
            for col_name, value in zip(ordered_columns, values):
                col_type = next(col["type"] for col in valid_fields if col["column_name"] == col_name)
                if col_type == "json" and not isinstance(value, str):
                    insert_dict[col_name] = dumps(value)
                else:
                    insert_dict[col_name] = value

            print("Filtered body being inserted:", insert_dict)
            db.tables[table_name].insert(insert_dict)
            return "", 201
        except Exception as e:
            print(e)
            return {"message": "Unable to submit"}, 500

class FormResponses(Resource):
    @require_login
    def get(self, form_id):
        form_name = format_table_name(form_id)
        db = Database(environ.get("DB_SCHEMA", "public"))
        if db.tables.get(form_name) is None:
            return {"message": "Form not found"}, 404
        try:
            data = db.tables.get(form_name).select()
            return data, 200
        except Exception as e:
            print(e)
            return {"message": "Something went wrong"}, 500
    
class FormGroupings(Resource):
    @require_login
    def get(self, form_id):
        db = Database(environ.get("DB_SCHEMA", "public"))
        try:
            result = generate_groupings_for_form(db, form_id)
            return jsonify(result)
        except Exception as e:
            print("Grouping failed:", str(e))
            traceback.print_exc()
            return {"message": "Unable to generate groupings"}, 500
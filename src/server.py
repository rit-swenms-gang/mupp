from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS

class Root(Resource):
  def get(self):
    return 'Hello world'

app = Flask(__name__)
CORS(app)
api = Api(app)

api.add_resource(Root, '/')

if __name__ == '__main__':
  app.run(host='::', port=5001, debug=True)
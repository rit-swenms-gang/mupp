from flask import Flask
from flask_restful import Resource, Api

class Root(Resource):
  def get(self):
    return 'Hello world'

app = Flask(__name__)
api = Api(app)

api.add_resource(Root, '/')

if __name__ == '__main__':
  app.run(host='::', port=5001, debug=True)
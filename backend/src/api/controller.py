from flask import Flask, request, json
from flask.ext.cors import CORS
from handler import gmaps
from handler.events import generate_resp
from util.mapgridutils import loadMapGrids, calcPathIntegral
import json

B1 = (-38.3,144.2)
B2 = (-37.4,145.7)
LONG_STEPS = 2634
TABLES = {}

app = Flask(__name__)
CORS(app, resources=r'/api/*', allow_headers='Content-Type')


@app.route("/aggregate", methods=['POST'])
def aggregate():
    try:
        print "Getting path for GoogleMaps request"
        path = gmaps.get_path(request.get_json())
        print "Generate response using calcPathIntegral"
        resp = generate_resp(TABLES, path, calcPathIntegral)
        print "Generate json response"
        return json.dumps(resp)
    except Exception:
        return json.dumps({'error' : "There was an error"})        

@app.route("/test")
def hello():
    return json.dumps({'msg': "Hello World!"})

if __name__ == "__main__":
    TABLES = loadMapGrids(B1, B2, LONG_STEPS)
    app.run()

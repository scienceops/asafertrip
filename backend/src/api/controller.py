from flask import Flask, request, json
from handler import gmaps
import requests
app = Flask(__name__)


@app.route("/aggregate", methods=['POST'])
def aggregate():
    return str(gmaps.get_path(request.get_json()))

@app.route("/test")
def hello():
    return json.dumps({'msg': "Hello World!"})

if __name__ == "__main__":
    app.run(debug=True)

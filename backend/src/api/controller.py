from flask import Flask, request
from handler import gmaps
import requests
app = Flask(__name__)


@app.route("/aggregate", methods=['POST'])
def aggregate():
    return str(gmaps.get_path(request.get_json()))


if __name__ == "__main__":
    app.run(debug=True)

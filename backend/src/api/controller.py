from flask import Flask, request
from handler import gmaps
app = Flask(__name__)


@app.route("/aggregate", methods=['POST'])
def aggregate():
    return(str(gmaps.get_path(request.get_json())))

@app.route('/hello')
def hello():
    return 'Hello World'


if __name__ == "__main__":
    app.run(debug=True)

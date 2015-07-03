from flask import Flask, json
app = Flask(__name__)

@app.route("/")
def hello():
    return json.dumps([{'msg': "Hello World!"}])

if __name__ == "__main__":
    app.run()
from flask import Flask, jsonify, render_template
from flask_compress import Compress
from flask_cors import CORS
from logger import putlog
from proto import readJson

log = putlog(__file__)
app = Flask(__name__)

configuration = readJson("config/app.setting.json")

app.config['JSON_SORT_KEYS'] = False
app.config['SECRET_KEY'] = configuration["Application"]["Token"]

Compress(app)
CORS(app, resource={"/*": {"origins": "*"}})


@app.route('/spindata')
def spinData():
    response = [
        {"Label": "Question 1", "Question": "Who was the first Indian to win the Booker Prize?"},
        {"Label": "Question 2", "Question": "Who was the first Man to Climb Mount Everest Without Oxygen?"},
        {"Label": "Question 3", "Question": "Who was the first Indian woman to win the Miss World Title?"},
        {"Label": "Question 4", "Question": "What country has the most islands in the world?"},
        {"Label": "Question 5", "Question": "What is the slang name for New York City, used by locals?"}
    ]
    return jsonify(response)


@app.route('/')
def homepage():
    return render_template("index.html", QuestionLimit=configuration["QuestionLimit"])


if __name__ == '__main__':
    app.run(host=configuration["Application"]["Host"],
            port=configuration["Application"]["Port"],
            debug=True,
            threaded=True)

from flask import Flask, request, render_template, url_for, redirect, jsonify
from flask_pymongo import PyMongo
from datetime import datetime
from pymongo import MongoClient
from bson import json_util
from apscheduler.schedulers.background import BackgroundScheduler
import time
from firebase import firebase
from firebase_token_generator import create_token

# db establishment
app = Flask(__name__)
# Create a new client and connect to the server
client = MongoClient('mongodb+srv://masao1112:qtGdMPZYltnxiFyK@testing.z78xt.mongodb.net/?retryWrites=true&w=majority&appName=Testing')
# this is the name of the database
db = client.testing

# Firebase URL
firebaseURL = firebase.FirebaseApplication('https://sensor-data-6f9b0-default-rtdb.asia-southeast1.firebasedatabase.app/', None)



# fetch data from firebase to MongoDB
def firebase_fetch():
    sensorData = firebaseURL.get('/sensor_data', None)
    db.sensor_data.insert_one({
        "temp": sensorData['temp'],
        "humid": sensorData['hum'],
        "date": datetime.now()})
    print('Data fetched')

    # threshold = firebaseURL.get('/threshold', None)
    # threshold
# this is mongo db collection
registrants = db.sensor_data

@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        registrants.insert_one({
            "name": request.form.get("name"),
            "field": request.form.get("sport"),
            "date": datetime.now()
        })
        return redirect(url_for('index'))
    registrants_data = registrants.find()
    return render_template('index.html', registers=registrants_data)

@app.route("/data/visualize")
def sensorDataVisualize():
    return render_template("mainPage.html")


# Return fetched data on a webpage for xml req in JS
@app.route("/data/mongo")
def fetchFromMongo():
    data = db.sensor_data.find()
    return json_util.dumps(data)


# Return user desired threshold on a web page for xml req in JS
@app.route('/users/input/fetch',  methods=['GET', 'POST'])
def fetchFromUser():
    return render_template('body.html')


scheduler = BackgroundScheduler()
scheduler.add_job(firebase_fetch, 'interval', seconds=5)
scheduler.start()


if __name__ == "__main__":
    app.run(debug=True)

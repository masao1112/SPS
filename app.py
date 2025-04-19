from flask import Flask, request, render_template, url_for, redirect, jsonify
from datetime import datetime
from pymongo import MongoClient
from bson import json_util
from apscheduler.schedulers.background import BackgroundScheduler
from firebase import firebase

# Flask intergration
app = Flask(__name__)
# Create a new client and connect to the server
client = MongoClient('mongodb+srv://masao1112:qtGdMPZYltnxiFyK@testing.z78xt.mongodb.net/?retryWrites=true&w=majority&appName=Testing')
# this is the name of the database
db = client.testing

# Firebase URL
firebaseURL = firebase.FirebaseApplication('https://sensor-data-6f9b0-default-rtdb.asia-southeast1.firebasedatabase.app/', None)



# fetch data from firebase to MongoDB
def firebase_fetch():
    sensorData = firebaseURL.get('/sensor_data/number', None)
    db.sensor_data.insert_one({
        "temp": sensorData['temp'],
        "humid": sensorData['hum'],
        "date": datetime.now()})
    print('Data fetched')

# this is mongo db collection
registrants = db.sensor_data

@app.route("/", methods=['GET', 'POST'])
def sensorDataVisualize():
    return render_template("mainPage.html")    

# Return fetched data on a webpage for xml req in JS
@app.route("/data/mongo")
def fetchFromMongo():
    data = db.sensor_data.find()
    return json_util.dumps(data)


scheduler = BackgroundScheduler()
scheduler.add_job(firebase_fetch, 'interval', seconds=5)
scheduler.start()


if __name__ == "__main__":
    app.run(debug=True)

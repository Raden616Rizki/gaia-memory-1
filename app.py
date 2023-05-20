from flask import Flask, render_template, jsonify, request

import os
from os.path import join, dirname
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

MONGODB_URI = os.environ.get("MONGODB_URI")
DB_NAME =  os.environ.get("DB_NAME")

client = MongoClient(MONGODB_URI)

db = client[DB_NAME]

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html');

@app.route('/add-card', methods=['POST'])
def add_card():
    title = request.form.get('title')
    
    # Create folder to save images
    os.makedirs(f'static/images/{title}', exist_ok=True)
    # print(title)
    # images = []
    
    for i in range(8):
        i += 1
        file = request.files[f'img-{i}']
        extension = file.filename.split('.')[-1]
        image_path = f'static/images/{title}/img-{i}.{extension}'
        # images.append(image_path)
        file.save(image_path)
        # print(file)
        
    doc = {
        'title': title,
    }

    db.menu.insert_one(doc)
    return jsonify({'message': 'New Card Added successfully'})

@app.route('/show-menu', methods=['GET'])
def show_menu():
    menu = list(db.menu.find({}, {'_id': False}))
    return jsonify({'menu': menu})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
from flask import Flask, render_template, jsonify, request

import os
from os.path import join, dirname
from pymongo import MongoClient
from dotenv import load_dotenv
from pymongo.cursor import CursorType

import random

# from pytz import timezone, utc
# # import requests
# import ipapi
from datetime import datetime

from http import cookies

cookie = cookies.SimpleCookie()

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

@app.route('/set-cookies', methods=['POST'])
def set_cookies():
    username = request.form.get('username')
    found = checkUsername(username)
    # print(found)

    if (found):
        return jsonify({'message': f'Sorry :( {username} Already used'})
    # print(username)
    cookie['username'] = username
    cookie['username']['expires'] = 3600;
    cookie['username']['httponly'] = True;
    cookie['user-details'] = get_user()
    # print(cookie['username'])
    
    return jsonify({'message': f'Welcome {username}, The Username lasts about 1 hour, "do you dare to start over?"'})

@app.route('/get-cookies', methods=['GET'])
def get_cookies():
    try:
        # key_value = cookie['username'].output(header='Set-Cookie')
        # cookie.load(key_value)
        # username = cookie['username'].value
        username = get_cookies_value('username')
        # print('try : ', username)
    except:
        username = get_username()
        cookie['user-details'] = get_user()
        cookie['username'] = username
        cookie['username']['expires'] = 3600;
        cookie['username']['httponly'] = True;
        # print('except', username)
    
    today = datetime.now()
    this_time = today.strftime('%Y/%m/%d|%H:%M:%S')
    
    # get user details every device
    # key_value = cookie['user-details'].output(header='Set-Cookie')
    # cookie.load(key_value)
    # user1 = cookie['user-details'].value
    user1 = get_cookies_value('user-details')
    user2 = get_user()
    # print(user1, user2)
    
    if not cek_user(user1, user2):
        username = get_username()
        
    doc = {
        'username': username,
        'time_created': this_time,
        # 'user1': user1,
        # 'user2': user2,
    }
    
    db.username.insert_one(doc)
        
    cookies = {
        'username': username,
    }
    
    # print(cookies)
    return jsonify({'cookies': cookies})

@app.route('/send-chat', methods=['POST'])
def send_chat():
    # key_value = cookie['username'].output(header='Set-Cookie')
    # cookie.load(key_value)
    # sender = cookie['username'].value
    sender = get_cookies_value('username')
    
    today = datetime.now()
    # client_ip = request.remote_addr
    # url = f'http://ip-api.com/json/{client_ip}'
    # response = requests.get(url)
    # data = response.json()
    # location = ipapi.location(ip=client_ip)
    
    # timezone_str = location['timezone']
    # server_time = datetime.now(utc)
    # client_time = server_time.astimezone(timezone(timezone_str))
    
    this_time = today.strftime('%Y-%m-%d %H:%M:%S')
    time = this_time
    
    chat = request.form.get('chat')
    
    # print(sender, this_time, chat)
    
    doc = {
        'sender': sender,
        'time': time,
        'chat': chat,
    }
    
    db.chat.insert_one(doc)
    
    return jsonify({'message': 'success send chat'})

@app.route('/get-chat', methods=['GET'])
def get_chat():
    chat = list(db.chat.find({}, {'_id': False}))
    # user_now = get_cookies_value('username')
    return jsonify({'chat': chat})

@app.route('/new-chat', methods=['GET'])
def new_chat():
    with db.chat.watch() as stream:
        for change in stream:
            # print('Dokumen baru ditambahkan:')
            # print(change['fullDocument']['sender'])
            # print(type(change['fullDocument']))
            # new_chat = list(change['fullDocument'])
            sender = change['fullDocument']['sender']
            time = change['fullDocument']['time']
            chat = change['fullDocument']['chat']
            id_chat = change['fullDocument']['_id']
            
            try:
                # key_value = cookie['id_chat'].output(header='Set-Cookie')
                # cookie.load(key_value)
                # id_chat_cookie = cookie['id_chat'].value
                id_chat_cookie = get_cookies_value('id_chat')
            except:
                id_chat_cookie = '0'
                
            if (cek_id_chat(id_chat, id_chat_cookie)):
                return jsonify()
                
            cookie['id_chat'] = id_chat
            cookie['id_chat']['expires'] = 60;
            cookie['id_chat']['httponly'] = True;
            
            new_chat = {
                'sender': sender,
                'time': time,
                'chat': chat,
            }
            return jsonify({'new_chat': new_chat})

def get_username():
    animal_list = ['anoa', 'bekantan', 'cicak', 'dugong', 'elang', 'flaktivus', 'gajah', 'harimau', 'iguana', 'jaguar', 'kalong', 'merak', 'nyambek', 'orangutan', 'penyu', 'quda', 'rusa', 'sriti', 'tuna', 'vinguin', 'walrus', 'xigung', 'yuyu', 'zebra']
    
    word_list = ['bersin', 'berdasi', 'cantik', 'cengeng', 'galau', 'jomblo', 'ketawa', 'lompat', 'lari', 'nangis', 'panik', 'pingsan', 'qlilipan', 'rindu', 'solutip', 'setia', 'skiding', 'terbang', 'uzur', 'xixi', 'nyantai', 'woles']
    
    animal = random.choice(animal_list)
    word = random.choice(word_list)
    number = random.randint(0, 16)
    
    username = animal + '_' + word + '_' + str(number)
    found = checkUsername(username)
    # print(found)
    if(found):
        get_username()
    
    return username

def checkUsername(username):
    usernames = list(db.username.find({}, {'_id': False, 'time_created': False}))
    # found = any(username in username.values() for username in usernames)
    
    # if found:
    #     return found
    # else:
    #     return found
    
    # print(usernames)
    for user in usernames:
        # print(username, user['username'])
        if (username == user['username']):
            return True
        
    return False

def get_user():
    user_agent = request.headers.get('User-Agent')
    ip_address = request.remote_addr
    # mac_address = request.headers.get('X-Forwarded-For')
    user_value = f'{user_agent}:{ip_address}'
    return user_value

def get_cookies_value(key):
    key_value = cookie[key].output(header='Set-Cookie')
    cookie.load(key_value)
    final_value = cookie[key].value
    return final_value

def cek_user(user_1, user_2):
    return user_1 == user_2

def cek_id_chat(id_chat, id_chat_cookie):
    return id_chat == id_chat_cookie

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
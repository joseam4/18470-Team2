import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import bcrypt

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Connect to MongoDB Atlas
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['haas_db']
users_collection = db['users']


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    userid = data.get('userid', '').strip()
    password = data.get('password', '').strip()

    # Validate inputs
    if not userid or not password:
        return jsonify({'error': 'User ID and password are required'}), 400

    # Check if userid already exists
    if users_collection.find_one({'userid': userid}):
        return jsonify({'error': 'This userid is already taken'}), 409

    # Hash the password with bcrypt
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Save user to database
    users_collection.insert_one({
        'userid': userid,
        'password': hashed,
    })

    return jsonify({'success': True}), 200


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    userid = data.get('userid', '').strip()
    password = data.get('password', '').strip()

    # Validate inputs
    if not userid or not password:
        return jsonify({'error': 'User ID and password are required'}), 400

    # Find user in database
    user = users_collection.find_one({'userid': userid})
    if not user:
        return jsonify({'error': 'Invalid userid or password'}), 401

    # Check password against stored hash
    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid userid or password'}), 401

    return jsonify({'success': True}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5001)

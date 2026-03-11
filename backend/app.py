import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import bcrypt
import certifi

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Connect to MongoDB Atlas
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
db = client['haas_db']
users_collection = db['users']
projects_collection = db['projects']
hardware_collection = db['hardware']


# Initialize default hardware sets if they don't exist
def init_hardware():
    for hw_name in ['HWSet1', 'HWSet2']:
        if not hardware_collection.find_one({'name': hw_name}):
            hardware_collection.insert_one({
                'name': hw_name,
                'capacity': 100,
                'available': 100,
                'checkouts': {}
            })


init_hardware()


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


@app.route('/api/projects', methods=['GET'])
def get_projects():
    user_id = request.args.get('userId', '').strip()

    if not user_id:
        return jsonify({'error': 'userId is required'}), 400

    projects = projects_collection.find({'members': user_id})

    project_list = []
    for project in projects:
        project_list.append({
            'projectId': project['projectId'],
            'name': project['name'],
            'description': project['description'],
        })

    return jsonify({'projects': project_list}), 200


@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    project_id = data.get('projectId', '').strip()
    user_id = data.get('userId', '').strip()

    # Validate inputs
    if not name or not project_id or not user_id:
        return jsonify({'error': 'Project name, project ID, and user ID are required'}), 400

    # Check if projectId already exists
    if projects_collection.find_one({'projectId': project_id}):
        return jsonify({'error': 'A project with this ID already exists'}), 409

    # Save project to database
    projects_collection.insert_one({
        'projectId': project_id,
        'name': name,
        'description': description,
        'members': [user_id],
    })

    return jsonify({'success': True}), 200


@app.route('/api/projects/join', methods=['POST'])
def join_project():
    data = request.get_json()
    project_id = data.get('projectId', '').strip()
    user_id = data.get('userId', '').strip()

    # Validate inputs
    if not project_id or not user_id:
        return jsonify({'error': 'Project ID and user ID are required'}), 400

    # Check if project exists
    project = projects_collection.find_one({'projectId': project_id})
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Check if user is already a member
    if user_id in project['members']:
        return jsonify({'error': 'You are already a member of this project'}), 409

    # Add user to members
    projects_collection.update_one(
        {'projectId': project_id},
        {'$addToSet': {'members': user_id}}
    )

    return jsonify({'success': True}), 200


@app.route('/api/projects/leave', methods=['POST'])
def leave_project():
    data = request.get_json()
    project_id = data.get('projectId', '').strip()
    user_id = data.get('userId', '').strip()

    # Validate inputs
    if not project_id or not user_id:
        return jsonify({'error': 'Project ID and user ID are required'}), 400

    # Check if project exists
    project = projects_collection.find_one({'projectId': project_id})
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Check if user is a member
    if user_id not in project['members']:
        return jsonify({'error': 'You are not a member of this project'}), 400

    # Remove user from members
    projects_collection.update_one(
        {'projectId': project_id},
        {'$pull': {'members': user_id}}
    )

    # Delete project if no members left
    updated = projects_collection.find_one({'projectId': project_id})
    if not updated['members']:
        projects_collection.delete_one({'projectId': project_id})

    return jsonify({'success': True}), 200


@app.route('/api/hardware', methods=['GET'])
def get_hardware():
    project_id = request.args.get('projectId', '').strip()

    if not project_id:
        return jsonify({'error': 'projectId is required'}), 400

    hw_sets = hardware_collection.find()

    result = []
    for hw in hw_sets:
        checked_out = hw.get('checkouts', {}).get(project_id, 0)
        result.append({
            'name': hw['name'],
            'capacity': hw['capacity'],
            'available': hw['available'],
            'checkedOut': checked_out,
        })

    return jsonify({'hwSets': result}), 200


@app.route('/api/hardware/checkout', methods=['POST'])
def checkout_hardware():
    data = request.get_json()
    project_id = data.get('projectId', '').strip()
    hw_set = data.get('hwSet', '').strip()
    quantity = data.get('quantity', 0)

    if not project_id or not hw_set or not quantity:
        return jsonify({'error': 'projectId, hwSet, and quantity are required'}), 400

    if quantity <= 0:
        return jsonify({'error': 'Quantity must be positive'}), 400

    # Verify project exists
    project = projects_collection.find_one({'projectId': project_id})
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Find hardware set
    hw = hardware_collection.find_one({'name': hw_set})
    if not hw:
        return jsonify({'error': 'Hardware set not found'}), 404

    if quantity > hw['available']:
        return jsonify({'error': f'Not enough units available. Only {hw["available"]} remaining'}), 400

    # Decrease available, increase this project's checkout count
    hardware_collection.update_one(
        {'name': hw_set},
        {'$inc': {'available': -quantity, f'checkouts.{project_id}': quantity}}
    )

    return jsonify({'success': True}), 200


@app.route('/api/hardware/checkin', methods=['POST'])
def checkin_hardware():
    data = request.get_json()
    project_id = data.get('projectId', '').strip()
    hw_set = data.get('hwSet', '').strip()
    quantity = data.get('quantity', 0)

    if not project_id or not hw_set or not quantity:
        return jsonify({'error': 'projectId, hwSet, and quantity are required'}), 400

    if quantity <= 0:
        return jsonify({'error': 'Quantity must be positive'}), 400

    # Find hardware set
    hw = hardware_collection.find_one({'name': hw_set})
    if not hw:
        return jsonify({'error': 'Hardware set not found'}), 404

    # Check how much this project has checked out
    current_checkout = hw.get('checkouts', {}).get(project_id, 0)
    if quantity > current_checkout:
        return jsonify({'error': f'Cannot check in {quantity} units. Only {current_checkout} checked out by this project'}), 400

    # Increase available, decrease this project's checkout count
    hardware_collection.update_one(
        {'name': hw_set},
        {'$inc': {'available': quantity, f'checkouts.{project_id}': -quantity}}
    )

    # Clean up: remove project key if checkout is now 0
    if current_checkout - quantity == 0:
        hardware_collection.update_one(
            {'name': hw_set},
            {'$unset': {f'checkouts.{project_id}': ''}}
        )

    return jsonify({'success': True}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5001)

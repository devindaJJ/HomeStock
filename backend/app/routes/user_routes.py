from flask import Blueprint, request, jsonify
from ..models.user import User
from .. import db

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],  # In real apps, hash the password!
        role=data.get('role', 'user')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201

@user_routes.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    user_list = [{"user_id": user.user_id, "username": user.username, "email": user.email, "role": user.role} for user in users]
    return jsonify(user_list), 200

@user_routes.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({"user_id": user.user_id, "username": user.username, "email": user.email, "role": user.role}), 200
    return jsonify({"message": "User not found!"}), 404

@user_routes.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if user:
        data = request.get_json()
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        db.session.commit()
        return jsonify({"message": "User updated successfully!"}), 200
    return jsonify({"message": "User not found!"}), 404

@user_routes.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully!"}), 200
    return jsonify({"message": "User not found!"}), 404
"""This file contains business logic for user managemen"""

from ..models.user import User
from .. import db

def create_user(data):
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        role=data.get('role', 'user')
    )
    db.session.add(new_user)
    db.session.commit()
    return new_user

def get_all_users():
    return User.query.all()

def get_user_by_id(user_id):
    return User.query.get(user_id)

def update_user(user_id, data):
    user = User.query.get(user_id)
    if user:
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        db.session.commit()
        return user
    return None

def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return True
    return False
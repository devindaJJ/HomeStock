from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import check_password_hash, generate_password_hash
from db import db
from models.user import User
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask_mail import Message
import secrets
from extensions import mail, reset_tokens
from flask import current_app

auth_routes = Blueprint('auth_routes', __name__, url_prefix='/auth')

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user or current_user.role != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
        except:
            return jsonify({'message': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated

@auth_routes.route('/setup', methods=['GET'])
def setup():
    """Create a test user if none exists"""
    if User.query.count() == 0:
        test_user = User(
            username='admin',
            email='admin@example.com',
            password='admin123',  # Password will be hashed by User model
            role='admin'
        )
        try:
            db.session.add(test_user)
            db.session.commit()
            print("Test user created successfully")
            return jsonify({'message': 'Test user created successfully'}), 200
        except Exception as e:
            print(f"Error creating test user: {e}")
            db.session.rollback()
            return jsonify({'message': 'Error creating test user'}), 500
    return jsonify({'message': 'Users already exist'}), 200

@auth_routes.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response
        
    data = request.get_json()
    
    # Debug logging
    print("Login attempt with data:", data)
    
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    
    # Debug logging
    print("Found user:", user)
    if user:
        print("Password check:", check_password_hash(user.password, password))

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401

    # Generate JWT token
    token = jwt.encode(
        {
            'user_id': user.user_id,
            'email': user.email,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )

    response = jsonify({
        'token': token,
        'user': {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    })
    
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    return response, 200

@auth_routes.route('/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    
    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'If a user with this email exists, they will receive a password reset link'}), 200
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_tokens[reset_token] = {
        'email': email,
        'expiry': datetime.utcnow() + timedelta(hours=1)
    }
    
    # Send reset email
    try:
        msg = Message(
            'Password Reset Request',
            sender=mail.username,
            recipients=[email]
        )
        msg.body = f'''To reset your password, use the following token:

{reset_token}

This token will expire in 1 hour.

If you did not request a password reset, please ignore this email.
'''
        mail.send(msg)
        return jsonify({'message': 'Password reset instructions have been sent to your email'}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'message': 'Failed to send reset email'}), 500

@auth_routes.route('/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400
    
    # Verify token
    token_data = reset_tokens.get(token)
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 400
    
    # Check token expiry
    if datetime.utcnow() > token_data['expiry']:
        del reset_tokens[token]
        return jsonify({'message': 'Token has expired'}), 400
    
    # Update user password
    user = User.query.filter_by(email=token_data['email']).first()
    if user:
        user.password = generate_password_hash(new_password)
        user.save()
        # Remove used token
        del reset_tokens[token]
        return jsonify({'message': 'Password has been reset successfully'}), 200
    
    return jsonify({'message': 'User not found'}), 404

@auth_routes.route('/verify-token', methods=['GET', 'OPTIONS'])
def verify_token():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing'}), 401

    try:
        token = token.split(' ')[1]  # Remove 'Bearer ' prefix
        data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        
        # Check if user still exists and is active
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 401

        response = jsonify({
            'message': 'Token is valid',
            'user': {
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        return response
    except Exception as e:
        print(f"Token verification error: {e}")
        return jsonify({'message': 'Invalid token'}), 401 
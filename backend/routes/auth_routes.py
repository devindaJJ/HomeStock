from flask import Blueprint, request, jsonify, make_response
from werkzeug.security import check_password_hash, generate_password_hash
from db import db
from models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from functools import wraps
from flask_mail import Message
import secrets
from extensions import mail, reset_tokens
from flask import current_app

auth_routes = Blueprint('auth_routes', __name__, url_prefix='/api/auth')

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
            
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

    # Create access token
    access_token = create_access_token(
        identity=user.user_id,
        additional_claims={
            'email': user.email,
            'role': user.role
        }
    )

    response = jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "username": user.username,
            "role": user.role
        }
    })
    
    # Add CORS headers to the response
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    
    return response, 200

@auth_routes.route('/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "No account found with this email"}), 404

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_tokens[reset_token] = {
        'user_id': user.user_id,
        'expires': datetime.utcnow() + timedelta(hours=1)
    }

    # Send reset email
    msg = Message(
        'Password Reset Request',
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[email]
    )
    msg.body = f'''
    To reset your password, visit the following link:
    http://localhost:3000/reset-password?token={reset_token}
    
    This link will expire in 1 hour.
    '''
    mail.send(msg)

    return jsonify({"message": "Password reset email sent"}), 200

@auth_routes.route('/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({"message": "Token and new password are required"}), 400

    token_data = reset_tokens.get(token)
    if not token_data or datetime.utcnow() > token_data['expires']:
        return jsonify({"message": "Invalid or expired token"}), 400

    user = User.query.get(token_data['user_id'])
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.password = generate_password_hash(new_password)
    db.session.commit()

    # Remove used token
    del reset_tokens[token]

    return jsonify({"message": "Password reset successful"}), 200

@auth_routes.route('/verify-token', methods=['GET', 'OPTIONS'])
@jwt_required()
def verify_token():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "message": "Token is valid",
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "username": user.username,
            "role": user.role
        }
    }), 200 
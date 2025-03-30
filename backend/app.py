"""Entry point for running the Flask application"""
from flask import Flask
from flask_cors import CORS
from config import Config
from db import db
from routes.user_routes import user_routes
from routes.auth_routes import auth_routes
from extensions import mail
import os

def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Initialize extensions with proper CORS configuration
    CORS(app, 
        resources={
            r"/*": {
                "origins": ["http://localhost:3000"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "expose_headers": ["Content-Type", "Authorization"]
            }
        },
        supports_credentials=True
    )
    
    # Initialize database
    db.init_app(app)
    mail.init_app(app)
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {e}")
            raise
    
    # Register blueprints
    app.register_blueprint(user_routes)  # Remove url_prefix for user routes
    app.register_blueprint(auth_routes)  # Remove url_prefix for auth routes
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
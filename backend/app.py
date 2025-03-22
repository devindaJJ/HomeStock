"""Entry point for running the Flask application"""
from flask import Flask
from flask_cors import CORS
from config import Config
from db import db
from routes.user_routes import user_routes
from routes.stock_routes import stock_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # Initialize the database with the Flask app
    db.init_app(app)

    # Register routes
    app.register_blueprint(user_routes)
    app.register_blueprint(stock_routes)

    return app

if __name__ == '__main__':
    app = create_app()

    # Create database tables within the app context
    with app.app_context():
        db.create_all()

    app.run(debug=True)
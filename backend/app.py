"""Entry point for running the Flask application"""
from flask import Flask
from flask_cors import CORS
from config import Config
from db import db  # Assuming db.py initializes SQLAlchemy
from routes.item_routes import item_routes
from routes.user_routes import user_routes
from routes.stock_routes import stock_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)


    # Initialize SQLAlchemy with the app
    db.init_app(app)  # Proper initialization of SQLAlchemy with app

    # Enable CORS (Cross-Origin Resource Sharing)
    CORS(app)

    # Register routes
    app.register_blueprint(user_routes)
    app.register_blueprint(item_routes)
    app.register_blueprint(stock_routes)

    return app

if __name__ == '__main__':
    app = create_app()

    # Create database tables within the app context
    with app.app_context():
        db.create_all()  # This will create the tables based on your models

    # Run the application in debug mode
    app.run(debug=True)

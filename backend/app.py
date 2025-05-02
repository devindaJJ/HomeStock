from flask import Flask
from flask_cors import CORS
from config import Config
from db import db 
from routes.item_routes import item_routes
from routes.user_routes import user_routes
from routes.stock_routes import stock_routes
from routes.auth_routes import auth_routes
from routes.reminder_routes import reminder_routes
from routes.shopping_list_routes import shopping_list_routes
from routes.dashboard_routes import dashboard_routes
from extensions import mail
from flask_jwt_extended import JWTManager
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Apply CORS to the app
   
    CORS(app, supports_credentials=True, origins=["http://localhost:3001"])
    # CORS(app, supports_credentials=True, origins="*")
    CORS(app, supports_credentials=True)

    

    db.init_app(app)
    mail.init_app(app)
    jwt = JWTManager(app)

    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {e}")
            raise

    # Register blueprints
    app.register_blueprint(user_routes)
    app.register_blueprint(auth_routes)
    app.register_blueprint(stock_routes)
    app.register_blueprint(reminder_routes)
    app.register_blueprint(item_routes)
    app.register_blueprint(shopping_list_routes)
    app.register_blueprint(dashboard_routes)

    # Handle OPTIONS requests
    @app.route('/<path:path>', methods=['OPTIONS'])
    def options(path):
        return '', 204

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

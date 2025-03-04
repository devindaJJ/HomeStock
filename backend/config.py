""" Configuration file for the Flask app. """
import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://username:password@localhost/homestock'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
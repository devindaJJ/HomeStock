"""Contains configuration details such as database credentials"""
class Config: 
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:Ishani191211%40@localhost:3306/homestock"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'your-secret-key'


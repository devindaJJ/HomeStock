"""Entry point for the application 
    Devinda Jayathilake 04/03/2025
"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
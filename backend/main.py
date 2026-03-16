from __init__ import app
from flask import render_template
from routes import admin
from routes import auth

# create the blueprints for auth and admin
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(admin, url_prefix="/api/admin")


# Create a route for the homepage
@app.route("/")
def home():
    return render_template("project.html")


# Run the app
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

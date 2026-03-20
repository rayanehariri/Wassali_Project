from __init__ import app
from flask import render_template
from routes.admin import admin
from routes.auth import auth
from routes.client import client
from routes.deliverer import deliverer

# create the blueprints for auth and admin
app.register_blueprint(admin, url_prefix="/api/admin")
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(client, url_prefix="/api/client")
app.register_blueprint(deliverer, url_prefix="/api/deliverer")


# Create a route for the homepage
@app.route("/")
def home():
    return render_template("project.html")


# Run the app
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

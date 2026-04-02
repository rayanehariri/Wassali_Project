from __init__ import app
from flask import render_template, jsonify
from routes.admin import admin
from routes.auth import auth
from routes.client import client
from routes.deliverer import deliverer

# Register blueprints with URL prefixes
app.register_blueprint(admin, url_prefix="/api/admin")
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(client, url_prefix="/api/client")
app.register_blueprint(deliverer, url_prefix="/api/deliverer")


@app.route("/")
def home():
    """Homepage route that serves the main application interface."""
    return render_template("project.html")


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify the API is running."""
    return jsonify({"success": True, "message": "Service is healthy"}), 200


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

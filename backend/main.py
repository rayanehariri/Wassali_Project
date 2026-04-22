from __init__ import app
from flask import render_template, jsonify
from werkzeug.security import generate_password_hash
from routes.admin import admin
from routes.auth import auth
from routes.client import client
from routes.deliverer import deliverer
from error_handlers import register_error_handlers
from verification_routes import verification
from __init__ import users_collection

# Register blueprints with URL prefixes
app.register_blueprint(admin, url_prefix="/api/admin")
app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(client, url_prefix="/api/client")
app.register_blueprint(deliverer, url_prefix="/api/deliverer")
app.register_blueprint(verification, url_prefix="/api/verification")
register_error_handlers(app)

def ensure_default_admin():
    """
    Seed one real admin in MongoDB.
    This prevents the frontend from falling back to "offline admin"
    while the admin dashboards expect DB-backed data.
    """
    default_admin_id = "ADMIN-ROOT-001"
    default_username = "admin@wassali.com"
    default_email = "admin@wassali.com"
    default_password = "123456"

    existing = users_collection.find_one({"$or": [{"_id": default_admin_id}, {"username": default_username}, {"email": default_email}]})
    if existing:
        users_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"role": "admin", "status": "active", "onboardingDone": True}},
        )
        return

    users_collection.insert_one(
        {
            "_id": default_admin_id,
            "username": default_username,
            "email": default_email,
            "password": generate_password_hash(default_password, method="pbkdf2:sha256", salt_length=8),
            "role": "admin",
            "status": "active",
            "onboardingDone": True,
        }
    )

ensure_default_admin()


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

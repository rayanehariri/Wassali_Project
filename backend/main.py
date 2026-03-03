# Save this as app.py
from models import Role, User
from flask import Flask, jsonify, render_template, request

# Create a route for the home page
app = Flask(__name__)


@app.route("/")
def home():
    return render_template("project.html")


@app.route("/users")
# create a home page
def users():
    users_list = User.get_all_users(Role.ADMIN)
    for u in users_list:
        u["_id"] = str(u["_id"])
    return jsonify(users_list)


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

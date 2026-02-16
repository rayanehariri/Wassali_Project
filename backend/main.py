# Save this as app.py
from flask import Flask, jsonify
from models import User

app = Flask(__name__)


# Create a route for the home page
@app.route("/")
# create a home page
def home():
    users_list = User.get_all_users()
    for u in users_list:
        u["_id"] = str(u["_id"])

    return jsonify(users_list)


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

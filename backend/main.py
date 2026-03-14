from models import Role, User, Identity, Status
from flask import Flask, jsonify, render_template

test_identity: Identity = Identity("user_test", "user_test@test.com", "test123!")
test_user: User = User(test_identity, Status.ACTIVE, Role.CLIENT)

# Create a route for the homepage
app = Flask(__name__)


# create a homepage
@app.route("/")
def home():
    return render_template("project.html")


# create the route for getting all users as a list
@app.route("/users")
def users():
    users_list = User.get_all_users(Role.ADMIN)
    return jsonify(users_list)


# create the route for getting the user by id
@app.route("/users/<id>")
def user_id(id: str):
    find_user = User.find_user(id)
    if find_user["success"]:
        return jsonify(find_user)
    else:
        return jsonify({"success": False, "message": find_user["message"]})


# create the route for registering a user
@app.route("/register/", methods=["POST"])
def register():
    return jsonify(test_user.register())


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

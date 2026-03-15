from __init__ import app
from flask import render_template
from routes.admin import admin
from routes.auth import auth


app.register_blueprint(auth)
app.register_blueprint(admin)


# Create a route for the homepage
@app.route("/")
def home():
    return render_template("project.html")


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

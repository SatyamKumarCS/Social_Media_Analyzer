from flask import Flask, request, jsonify, render_template
import requests
from os import environ
from dotenv import load_dotenv

app = Flask(__name__)

# Configuration
load_dotenv()
LANGFLOW_ID = environ.get("LANGFLOW_ID")
FLOW_ID = environ.get("FLOW_ID")
BASE_API_URL = environ.get("BASE_API_URL")
TOKEN = environ.get("TOKEN")

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        message = request.json.get("message", "")
        if not message:
            return jsonify({"error": "Empty message"}), 400

        url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{FLOW_ID}"

        headers = {
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        }

        payload = {"input_value": message, "output_type": "chat", "input_type": "chat"}

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            response_data = response.json()
            try:
                message_text = response_data["outputs"][0]["outputs"][0]["results"][
                    "message"
                ]["text"]
                return jsonify({"response": message_text})
            except (KeyError, IndexError) as e:
                return (
                    jsonify(
                        {
                            "error": "Response Processing Error",
                            "details": f"Could not extract message from API response: {str(e)}",
                        }
                    ),
                    500,
                )
        else:
            return (
                jsonify(
                    {
                        "error": "API Error",
                        "details": f"Error {response.status_code}: {response.text}",
                    }
                ),
                response.status_code,
            )

    except Exception as e:
        return jsonify({"error": "Server Error", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=4500)

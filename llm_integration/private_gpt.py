import requests
import logging
import time

def is_api_available(hostname="10.10.10.30", port=8001):
    url = f"http://{hostname}:{port}/v1/chat/completions"
    try:
        response = requests.head(url)
        return response.status_code == 200
    except requests.RequestException:
        return False

def query_api(query, history, hostname="10.10.10.30", port=8001, verbose=False, debug=False):
    results = []
    logger = logging.getLogger('q_root')
    logger.info(f"Running a query ${query}")

    if not is_api_available(hostname, port):
        print("API is not available")
        logger.error("API is not available")
        return results

    url = f"http://{hostname}:{port}/v1/chat/completions"
    full_response = ""
    user_message = ""
    headers = {
        "Content-Type": "application/json"
    }
    params = {
        "description": "Generate data for template",
        "include_sources": False,
        "messages": [
            {
                "content": "You are Alfred, my personal assistant. Please respond politely and helpfully.\
                history: ",
                "role": "system"
            },
            {
                "content": f"{query}\n{history}",
                "role": "user"
            }
        ],
        "stream": False
    }

    logger.debug(params)
    try:
        response = requests.post(url, json=params, headers=headers, verify=False, stream=False)
        logger.info(response)
        response.raise_for_status()  # Raise an exception for 4XX and 5XX status codes
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    if line.startswith(b"data:"):
                        line = line[len(b"data:"):].strip()
                    if line == b"[DONE]":
                        print("\nAPI RESPONSE COMPLETED\n\n")
                        break
                    try:
                        parsed_data = json.loads(line)
                        content_text = parsed_data["choices"][0]["message"]["content"]
                        if verbose:
                            print(content_text)
                    except json.decoder.JSONDecodeError as e:
                        print("Error decoding JSON:", e)
                        # Log the error
                        logger.error("Error decoding JSON: %s", e)
                        # Optionally raise the exception to propagate it
                        # raise
            results.append({
                "request_type": "chat/completions",
                "user_prompt": user_message,
                "model_response": content_text
            })
    except requests.RequestException as e:
        print("Request Exception:", e)
        # Log the error
        logger.error("Request Exception: %s", e)
        # Optionally raise the exception to propagate it
        # raise
    return results

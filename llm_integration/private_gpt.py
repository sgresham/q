import requests
import json
import logging

def query_api(query, history, hostname="localhost", port=8001, verbose=False, debug=False):
    results = []
    logger = logging.getLogger('q_root')
    logger.info(f"Running a query ${query}")

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
    with requests.post(url, json=params, headers=headers, verify=False, stream=False) as response:
        logger.info(response)
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
                    except json.decoder.JSONDecodeError:
                        print("Error decoding JSON:", line)
            results.append({
                "request_type": "chat/completions",
                "user_prompt": user_message,
                "model_response": content_text
            })
    return results

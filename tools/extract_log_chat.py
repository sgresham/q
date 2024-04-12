import json
from datetime import datetime, timedelta, timezone

def getlogsbyduration(length):

    # Read the log file
    with open('logs/q_core.json', 'r') as f:
        lines = f.readlines()

    # Initialize an empty list to store parsed logs
    logs = []

    # Parse each line as a JSON object
    for line in lines:
        log = json.loads(line)
        logs.append(log)

    # Get the current time in UTC timezone
    current_time = datetime.now(timezone.utc)

    # Define the time window for filtering (last 5 minutes)
    time_window = current_time - timedelta(minutes=length)

    # Convert time_window to UTC timezone
    time_window_utc = time_window.astimezone(timezone.utc)

    # Filter the logs within the time window
    filtered_logs = [log for log in logs if datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00')) >= time_window_utc]

    # Display the filtered logs with the time in hh:mm:ss format and the message
    for log in filtered_logs:
        log_time = datetime.fromisoformat(log['timestamp'].replace('Z', '+00:00')).strftime('%H:%M:%S')
        print(f"{log_time}: {log['message']}")


if __name__ == "__main__":
    getlogsbyduration(10)
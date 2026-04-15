import json
import os

def load_data(filename: str, default_data):
    if not os.path.exists(filename):
        save_data(filename, default_data)
        return default_data
    with open(filename, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return default_data

def save_data(filename: str, data):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

#!/usr/bin/env python3

import os
import sys
from pathlib import Path

def validate_env_file(filepath, required_keys):
    if not os.path.exists(filepath):
        print(f"✗ {filepath} does not exist")
        return False
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    missing_keys = []
    empty_keys = []
    
    for key in required_keys:
        if key not in content:
            missing_keys.append(key)
        else:
            lines = [line.strip() for line in content.split('\n') if line.strip().startswith(key)]
            if lines:
                value = lines[0].split('=', 1)[1] if '=' in lines[0] else ''
                if not value or 'your_' in value.lower() or '[your' in value.lower():
                    empty_keys.append(key)
    
    if missing_keys:
        print(f"✗ {filepath} is missing keys: {', '.join(missing_keys)}")
        return False
    
    if empty_keys:
        print(f"⚠ {filepath} has placeholder values for: {', '.join(empty_keys)}")
        return True
    
    print(f"✓ {filepath} is valid")
    return True

def main():
    print("========================================")
    print("Environment Configuration Validator")
    print("========================================\n")
    
    backend_required = [
        'user', 'password', 'host', 'port', 'dbname',
        'GROQ_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY',
        'GEMINI_API_KEY', 'YOUTUBE_API_KEY', 'REDIS_HOST', 'REDIS_PORT'
    ]
    
    frontend_required = [
        'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY',
        'VITE_YOUTUBE_API_KEY', 'VITE_API_URL'
    ]
    
    backend_valid = validate_env_file('Backend/.env', backend_required)
    frontend_valid = validate_env_file('Frontend/.env', frontend_required)
    
    print("\n========================================")
    if backend_valid and frontend_valid:
        print("✓ Configuration is ready!")
        print("========================================\n")
        print("Start the application with:")
        print("  docker compose up --build\n")
        sys.exit(0)
    else:
        print("✗ Please fix configuration issues")
        print("========================================\n")
        print("Copy example files:")
        print("  cp Backend/.env.example Backend/.env")
        print("  cp Frontend/.env.example Frontend/.env\n")
        sys.exit(1)

if __name__ == '__main__':
    main()

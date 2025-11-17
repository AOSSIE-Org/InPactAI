#!/usr/bin/env python3
"""
Script to list all API endpoints from the FastAPI application
"""
import sys
import os
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.main import app

def list_endpoints():
    """List all registered routes in the FastAPI app"""
    print("=" * 80)
    print("INPACT AI - API ENDPOINTS")
    print("=" * 80)
    print()

    # Group endpoints by method
    endpoints_by_method = {}

    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            methods = list(route.methods)
            path = route.path

            for method in methods:
                if method not in endpoints_by_method:
                    endpoints_by_method[method] = []
                endpoints_by_method[method].append(path)

    # Print endpoints grouped by HTTP method
    for method in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
        if method in endpoints_by_method:
            print(f"\n{method} Endpoints:")
            print("-" * 80)
            for path in sorted(set(endpoints_by_method[method])):
                print(f"  {method:6} {path}")

    print("\n" + "=" * 80)
    print(f"Total unique endpoints: {len(set([route.path for route in app.routes if hasattr(route, 'path')]))}")
    print("=" * 80)
    print()
    print("💡 TIP: Visit /docs for interactive API documentation")
    print("💡 TIP: Visit /redoc for alternative API documentation")

if __name__ == "__main__":
    list_endpoints()


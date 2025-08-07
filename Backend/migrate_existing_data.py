import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

supabase: Client = create_client(url, key)

def migrate_existing_data():
    """Migrate existing comments and update history from terms_and_conditions to dedicated columns"""
    try:
        print("Starting migration of existing data...")
        
        # Get all contracts
        result = supabase.table("contracts").select("*").execute()
        contracts = result.data
        
        print(f"Found {len(contracts)} contracts to process")
        
        migrated_count = 0
        
        for contract in contracts:
            contract_id = contract.get("id")
            terms_and_conditions = contract.get("terms_and_conditions", {})
            
            # Skip if terms_and_conditions is not a dict
            if not isinstance(terms_and_conditions, dict):
                continue
            
            update_payload = {}
            has_changes = False
            
            # Migrate comments
            if "comments" in terms_and_conditions and terms_and_conditions["comments"]:
                comments_data = terms_and_conditions["comments"]
                update_payload["comments"] = comments_data
                # Remove from terms_and_conditions
                del terms_and_conditions["comments"]
                has_changes = True
                print(f"Migrating {len(comments_data)} comments for contract {contract_id}")
            
            # Migrate update_history
            if "update_history" in terms_and_conditions and terms_and_conditions["update_history"]:
                history_data = terms_and_conditions["update_history"]
                update_payload["update_history"] = history_data
                # Remove from terms_and_conditions
                del terms_and_conditions["update_history"]
                has_changes = True
                print(f"Migrating {len(history_data)} update history entries for contract {contract_id}")
            
            # Update the contract if there were changes
            if has_changes:
                update_payload["terms_and_conditions"] = terms_and_conditions
                
                try:
                    supabase.table("contracts").update(update_payload).eq("id", contract_id).execute()
                    migrated_count += 1
                    print(f"✅ Successfully migrated contract {contract_id}")
                except Exception as e:
                    print(f"❌ Error migrating contract {contract_id}: {str(e)}")
        
        print(f"\n🎉 Migration completed! {migrated_count} contracts were updated.")
        
        # Verify migration
        print("\nVerifying migration...")
        result = supabase.table("contracts").select("id, comments, update_history").execute()
        contracts_after = result.data
        
        contracts_with_comments = sum(1 for c in contracts_after if c.get("comments"))
        contracts_with_history = sum(1 for c in contracts_after if c.get("update_history"))
        
        print(f"Contracts with comments: {contracts_with_comments}")
        print(f"Contracts with update history: {contracts_with_history}")
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")

if __name__ == "__main__":
    migrate_existing_data() 
#!/usr/bin/env python3
"""
Script to fix TypeScript type issues with UserModel.findById() calls
This adds proper IUser type imports and type annotations across all API route files
"""

import os
import re
from pathlib import Path

# Configuration
SRC_DIR = Path(__file__).parent.parent / "src" / "app" / "api"
DRY_RUN = False  # Set to True to preview changes without applying them

def fix_user_model_imports(content):
    """Add IUser import if UserModel is imported but IUser is not"""
    # Check if UserModel is imported
    if "import UserModel" not in content:
        return content, False
    
    # Check if IUser is already imported
    if "IUser" in content:
        return content, False
    
    # Find and replace the UserModel import
    pattern = r"import\s+UserModel\s+from\s+['\"]@/models/user/User['\"]"
    replacement = "import UserModel, { IUser } from '@/models/user/User'"
    
    new_content = re.sub(pattern, replacement, content)
    return new_content, new_content != content

def fix_findbyid_typing(content):
    """Add type annotations to UserModel.findById() calls"""
    modified = False
    lines = content.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        # Pattern: const varName = await UserModel.findById(
        match = re.search(r'const\s+(\w+)\s*=\s*await\s+UserModel\.findById\(', line)
        
        if match:
            var_name = match.group(1)
            # Check if already has type annotation
            if f"{var_name}: IUser" not in line and f"{var_name}:" not in line:
                # Add type annotation
                new_line = line.replace(
                    f"const {var_name} =",
                    f"const {var_name}: IUser | null ="
                )
                new_lines.append(new_line)
                modified = True
                continue
        
        new_lines.append(line)
    
    return '\n'.join(new_lines), modified

def fix_user_id_access(content):
    """Add 'as any' type assertion to user._id access"""
    modified = False
    
    # Pattern: user._id (but not user._id! or user._id as any)
    pattern = r'(\buser\._id)(?!\s*(?:!|as\s+any))'
    
    def replacement(match):
        nonlocal modified
        modified = True
        return match.group(1) + ' as any'
    
    new_content = re.sub(pattern, replacement, content)
    return new_content, modified

def process_file(file_path):
    """Process a single file and apply all fixes"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = []
        
        # Apply fixes
        content, changed = fix_user_model_imports(content)
        if changed:
            changes.append("Added IUser import")
        
        content, changed = fix_findbyid_typing(content)
        if changed:
            changes.append("Added type annotations to findById")
        
        content, changed = fix_user_id_access(content)
        if changed:
            changes.append("Added type assertions to user._id")
        
        # Write back if changed
        if content != original_content:
            if not DRY_RUN:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            rel_path = file_path.relative_to(Path.cwd())
            print(f"✓ {rel_path}")
            for change in changes:
                print(f"  - {change}")
            return True
        
        return False
    
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all route files"""
    print("=" * 60)
    print("Fixing TypeScript User Model Type Issues")
    print("=" * 60)
    print()
    
    if DRY_RUN:
        print("🔍 DRY RUN MODE - No files will be modified")
        print()
    
    # Find all route.ts files
    route_files = list(SRC_DIR.rglob("route.ts"))
    
    print(f"Found {len(route_files)} route files")
    print()
    
    fixed_count = 0
    skipped_count = 0
    
    for file_path in sorted(route_files):
        if process_file(file_path):
            fixed_count += 1
        else:
            skipped_count += 1
    
    print()
    print("=" * 60)
    print("Summary:")
    print(f"  ✓ Files fixed: {fixed_count}")
    print(f"  - Files skipped: {skipped_count}")
    print(f"  Total files: {len(route_files)}")
    print("=" * 60)

if __name__ == "__main__":
    main()

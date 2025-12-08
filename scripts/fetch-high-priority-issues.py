#!/usr/bin/env python3
"""
Fetch high-priority SonarQube issues (BLOCKER, CRITICAL, MAJOR) for SimpleAccounts-UAE project.
"""

import json
import requests
from collections import defaultdict
from urllib.parse import urlencode

# Configuration
SONARQUBE_URL = "https://sonar-r0w40gg48okc00wkc08oowo4.46.62.252.63.sslip.io"
SONARQUBE_TOKEN = "squ_a9dfb5e603c5ced7c6bb3133cce0b3cfdaf3c514"
PROJECT_KEY = "SimpleAccounts_SimpleAccounts-UAE_f0046086-4810-411a-9ca7-6017268b2eb9"
PAGE_SIZE = 500

def fetch_issues_by_severity(severities):
    """Fetch issues filtered by severity."""
    all_issues = []
    page = 1
    
    severities_str = ','.join(severities)
    print(f"Fetching {severities_str} issues for project: {PROJECT_KEY}\n")
    
    while True:
        params = {
            'componentKeys': PROJECT_KEY,
            'statuses': 'OPEN',
            'severities': severities_str,
            'ps': PAGE_SIZE,
            'p': page
        }
        
        url = f"{SONARQUBE_URL}/api/issues/search?{urlencode(params)}"
        response = requests.get(url, auth=(SONARQUBE_TOKEN, ''), verify=False)
        response.raise_for_status()
        
        data = response.json()
        issues = data.get('issues', [])
        all_issues.extend(issues)
        
        total = data.get('total', 0)
        current_count = len(all_issues)
        
        print(f"Page {page}: Fetched {len(issues)} issues (Total: {current_count}/{total})")
        
        if current_count >= total or len(issues) == 0:
            break
        
        page += 1
    
    return all_issues

def analyze_issues(issues, severity):
    """Analyze issues and generate statistics."""
    rule_count = defaultdict(int)
    component_count = defaultdict(int)
    type_count = defaultdict(int)
    
    for issue in issues:
        rule = issue.get('rule', 'UNKNOWN')
        issue_type = issue.get('type', 'UNKNOWN')
        
        rule_count[rule] += 1
        type_count[issue_type] += 1
        
        # Extract component name
        component = issue.get('component', '')
        if ':' in component:
            component = component.split(':')[-1]
        component_count[component] += 1
    
    return {
        'rule_count': rule_count,
        'component_count': component_count,
        'type_count': type_count
    }

def print_summary(issues, severity, stats):
    """Print a formatted summary of the issues."""
    print("\n" + "=" * 80)
    print(f"{severity} ISSUES SUMMARY")
    print("=" * 80)
    print(f"\nTotal {severity} Issues: {len(issues):,}")
    
    print("\n" + "=" * 80)
    print("BREAKDOWN BY TYPE")
    print("=" * 80)
    type_order = ['BUG', 'VULNERABILITY', 'CODE_SMELL', 'SECURITY_HOTSPOT']
    for issue_type in type_order:
        count = stats['type_count'].get(issue_type, 0)
        if count > 0:
            percentage = (count / len(issues)) * 100
            print(f"{issue_type:15}: {count:6,} ({percentage:5.1f}%)")
    
    print("\n" + "=" * 80)
    print("TOP 20 MOST COMMON RULES")
    print("=" * 80)
    sorted_rules = sorted(stats['rule_count'].items(), key=lambda x: x[1], reverse=True)[:20]
    for i, (rule, count) in enumerate(sorted_rules, 1):
        print(f"{i:2}. {rule:30}: {count:6,}")
    
    print("\n" + "=" * 80)
    print("TOP 20 FILES WITH MOST ISSUES")
    print("=" * 80)
    sorted_components = sorted(stats['component_count'].items(), key=lambda x: x[1], reverse=True)[:20]
    for i, (component, count) in enumerate(sorted_components, 1):
        # Truncate long paths
        display_name = component if len(component) <= 70 else "..." + component[-67:]
        print(f"{i:2}. {display_name:70}: {count:5}")

def main():
    """Main function."""
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    severities = ['BLOCKER', 'CRITICAL', 'MAJOR']
    
    all_issues_by_severity = {}
    
    for severity in severities:
        try:
            print(f"\n{'='*80}")
            print(f"Processing {severity} issues...")
            print('='*80)
            issues = fetch_issues_by_severity([severity])
            stats = analyze_issues(issues, severity)
            print_summary(issues, severity, stats)
            
            # Save to file
            output_file = f"/tmp/sonarqube_{severity.lower()}_issues.json"
            with open(output_file, 'w') as f:
                json.dump(issues, f, indent=2)
            print(f"\n{severity} issues saved to: {output_file}")
            
            all_issues_by_severity[severity] = issues
            
        except Exception as e:
            print(f"Error fetching {severity} issues: {e}")
            import traceback
            traceback.print_exc()
    
    # Save combined high-priority issues
    all_high_priority = []
    for severity in severities:
        all_high_priority.extend(all_issues_by_severity.get(severity, []))
    
    combined_file = "/tmp/sonarqube_high_priority_issues.json"
    with open(combined_file, 'w') as f:
        json.dump(all_high_priority, f, indent=2)
    print(f"\n\nAll high-priority issues (BLOCKER+CRITICAL+MAJOR) saved to: {combined_file}")
    print(f"Total high-priority issues: {len(all_high_priority):,}")

if __name__ == "__main__":
    main()

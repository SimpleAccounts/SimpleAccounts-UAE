#!/usr/bin/env python3
"""
Fetch and analyze all open SonarQube issues for SimpleAccounts-UAE project.
"""

import json
import os
import requests
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlencode

# Configuration
DEFAULT_SONARQUBE_URL = (
    "https://sonar-r0w40gg48okc00wkc08oowo4.46.62.252.63.sslip.io"
)
DEFAULT_PROJECT_KEY = "SimpleAccounts_SimpleAccounts-UAE_f0046086-4810-411a-9ca7-6017268b2eb9"
PAGE_SIZE = 500
DEFAULT_VERIFY_SSL = True


def load_mcp_env():
    """Load gitignored `.mcp.env` into process env if present (no overrides)."""
    mcp_env_path = Path(__file__).resolve().parent.parent / ".mcp.env"
    if not mcp_env_path.is_file():
        return

    for line in mcp_env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_mcp_env()

SONARQUBE_URL = (
    os.getenv("SONARQUBE_URL") or os.getenv("SONAR_HOST_URL") or DEFAULT_SONARQUBE_URL
).rstrip("/")
SONARQUBE_TOKEN = os.getenv("SONAR_TOKEN") or os.getenv("SONARQUBE_TOKEN")
PROJECT_KEY = os.getenv("SONAR_PROJECT_KEY") or DEFAULT_PROJECT_KEY

VERIFY_SSL = os.getenv("SONARQUBE_VERIFY_SSL")
if VERIFY_SSL is None:
    VERIFY_SSL = DEFAULT_VERIFY_SSL
else:
    VERIFY_SSL = VERIFY_SSL.strip().lower() not in {"0", "false", "no"}

def fetch_all_issues():
    """Fetch all open issues from SonarQube."""
    all_issues = []
    page = 1
    
    print(f"Fetching open issues for project: {PROJECT_KEY}")
    print(f"SonarQube URL: {SONARQUBE_URL}\n")
    
    while True:
        params = {
            'componentKeys': PROJECT_KEY,
            'statuses': 'OPEN',
            'ps': PAGE_SIZE,
            'p': page
        }
        
        url = f"{SONARQUBE_URL}/api/issues/search?{urlencode(params)}"
        response = requests.get(
            url, auth=(SONARQUBE_TOKEN, ""), verify=VERIFY_SSL, timeout=30
        )
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
    
    return all_issues, data.get('effortTotal', 0)

def analyze_issues(issues):
    """Analyze issues and generate statistics."""
    severity_count = defaultdict(int)
    type_count = defaultdict(int)
    rule_count = defaultdict(int)
    component_count = defaultdict(int)
    effort_by_severity = defaultdict(int)
    
    for issue in issues:
        severity = issue.get('severity', 'UNKNOWN')
        issue_type = issue.get('type', 'UNKNOWN')
        rule = issue.get('rule', 'UNKNOWN')
        
        severity_count[severity] += 1
        type_count[issue_type] += 1
        rule_count[rule] += 1
        
        # Extract component name
        component = issue.get('component', '')
        if ':' in component:
            component = component.split(':')[-1]
        component_count[component] += 1
        
        # Calculate effort
        effort_str = issue.get('effort', '0min')
        try:
            effort_minutes = int(effort_str.replace('min', ''))
            effort_by_severity[severity] += effort_minutes
        except (ValueError, TypeError):
            pass
    
    return {
        'severity_count': severity_count,
        'type_count': type_count,
        'rule_count': rule_count,
        'component_count': component_count,
        'effort_by_severity': effort_by_severity
    }

def print_summary(total_issues, total_effort, stats):
    """Print a formatted summary of the issues."""
    print("\n" + "=" * 80)
    print("SONARQUBE OPEN ISSUES SUMMARY")
    print("=" * 80)
    print(f"\nTotal Open Issues: {total_issues:,}")
    print(f"Total Estimated Effort: {total_effort:,} minutes ({total_effort/60:.1f} hours)")
    
    print("\n" + "=" * 80)
    print("BREAKDOWN BY SEVERITY")
    print("=" * 80)
    severity_order = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']
    for severity in severity_order:
        count = stats['severity_count'].get(severity, 0)
        if count > 0:
            percentage = (count / total_issues) * 100
            effort = stats['effort_by_severity'].get(severity, 0)
            print(f"{severity:12}: {count:6,} ({percentage:5.1f}%) - Effort: {effort:6,} min")
    
    print("\n" + "=" * 80)
    print("BREAKDOWN BY TYPE")
    print("=" * 80)
    type_order = ['BUG', 'VULNERABILITY', 'CODE_SMELL', 'SECURITY_HOTSPOT']
    for issue_type in type_order:
        count = stats['type_count'].get(issue_type, 0)
        if count > 0:
            percentage = (count / total_issues) * 100
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

    if not VERIFY_SSL:
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    if not SONARQUBE_TOKEN:
        raise SystemExit(
            "ERROR: missing SonarQube token; set SONAR_TOKEN (preferred) or "
            "SONARQUBE_TOKEN (or configure it in .mcp.env)."
        )
    
    try:
        issues, total_effort = fetch_all_issues()
        stats = analyze_issues(issues)
        print_summary(len(issues), total_effort, stats)
        
        # Save to file
        output_file = "/tmp/sonarqube_all_issues.json"
        with open(output_file, 'w') as f:
            json.dump(issues, f, indent=2)
        print(f"\n\nAll issues saved to: {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

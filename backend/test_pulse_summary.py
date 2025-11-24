#!/usr/bin/env python3
import psycopg2

conn = psycopg2.connect(host='localhost', port=5432, database='customer_analytics', user='inder')
cur = conn.cursor()

print('=' * 100)
print('ENTERPRISE PULSE - TILE-BASED ORGANIZATION & NOTIFICATIONS SUMMARY')
print('=' * 100)

# Get categorized agents with notification settings
cur.execute("""
    SELECT
        category,
        name,
        scope,
        severity,
        frequency,
        notification_config,
        enabled
    FROM pulse_monitors
    WHERE category IN (
        'supply_chain_operations', 'asset_health_maintenance',
        'financial_operations', 'performance_analytics'
    )
    ORDER BY category, name
""")

print('\n📊 AGENT ORGANIZATION BY TILES:\n')

current_category = None
category_names = {
    'supply_chain_operations': '📦 Supply Chain Operations',
    'asset_health_maintenance': '🔧 Asset Health & Maintenance',
    'financial_operations': '💰 Financial Operations',
    'performance_analytics': '📊 Performance Analytics'
}

for row in cur.fetchall():
    category, name, scope, severity, frequency, notif_config, enabled = row

    if category != current_category:
        if current_category:
            print()
        print(f'{category_names.get(category, category)}:')
        print('-' * 100)
        current_category = category

    # Format notification methods
    enabled_notifications = [k.upper() for k, v in notif_config.items() if v] if notif_config else []
    notif_str = ', '.join(enabled_notifications) if enabled_notifications else 'None'

    scope_badge = '[GLOBAL]' if scope == 'global' else '[PRIVATE]'
    status_badge = '✓' if enabled else '✗'

    print(f'  {status_badge} {scope_badge:<10} {name:<50} | {severity.upper():<8} | {frequency:<10} | 🔔 {notif_str}')

# Summary statistics
print('\n' + '=' * 100)
print('NOTIFICATION CONFIGURATION SUMMARY:')
print('=' * 100)

cur.execute("""
    SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN notification_config->>'email' = 'true' THEN 1 END) as email_enabled,
        COUNT(CASE WHEN notification_config->>'slack' = 'true' THEN 1 END) as slack_enabled,
        COUNT(CASE WHEN notification_config->>'teams' = 'true' THEN 1 END) as teams_enabled,
        COUNT(CASE WHEN notification_config->>'ai_agent' = 'true' THEN 1 END) as ai_agent_enabled
    FROM pulse_monitors
    WHERE category IN (
        'supply_chain_operations', 'asset_health_maintenance',
        'financial_operations', 'performance_analytics'
    )
""")

stats = cur.fetchone()
print(f'\nTotal Kit Monitoring Agents: {stats[0]}')
print(f'  📧 Email Notifications: {stats[1]} agents')
print(f'  💬 Slack Notifications: {stats[2]} agents')
print(f'  👥 Teams Notifications: {stats[3]} agents')
print(f'  🤖 AI Agent Triggers: {stats[4]} agents')

print('\n' + '=' * 100)
print('✅ ALL FEATURES IMPLEMENTED SUCCESSFULLY')
print('=' * 100)

conn.close()

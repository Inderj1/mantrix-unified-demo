#!/usr/bin/env python3
import psycopg2

conn = psycopg2.connect(host='localhost', port=5433, database='mantrix_nexxt', user='mantrix', password='mantrix123')
cur = conn.cursor()

print('='*80)
print('TESTING PULSE MONITORING QUERIES')
print('='*80)

# Test 1: Loaner Kit Workflow Delay Alert
print('\n1. Loaner Kit Workflow Delays:')
cur.execute("""
    SELECT
        request_id,
        asset_id,
        current_step,
        CASE current_step
            WHEN 1 THEN 'Kit Request'
            WHEN 2 THEN 'Transfer Order'
            WHEN 3 THEN 'Pick & Ship DC'
            WHEN 4 THEN 'Kit in Transit'
            WHEN 5 THEN 'Receipt'
            WHEN 6 THEN 'Surgery'
            WHEN 7 THEN 'Usage Report'
            WHEN 8 THEN 'Return Arrange'
            WHEN 9 THEN 'Return Transit'
            WHEN 10 THEN 'DC Receipt & QC'
            WHEN 11 THEN 'Invoice Process'
        END as step_name,
        workflow_status
    FROM loaner_process_flow
    WHERE workflow_status = 'active'
""")
for row in cur.fetchall():
    print(f'  {row[0]} - Step {row[2]}: {row[3]} ({row[4]})')

# Test 2: Overdue Kits
print('\n2. Overdue Loaner Kits:')
cur.execute("""
    SELECT
        lf.request_id,
        sk.asset_name,
        lf.expected_completion_date,
        lf.current_step,
        lf.is_overdue
    FROM loaner_process_flow lf
    JOIN surgical_kits sk ON lf.asset_id = sk.asset_id
    WHERE lf.is_overdue = true
""")
results = cur.fetchall()
if results:
    for row in results:
        print(f'  {row[0]} - {row[1]} (Expected: {row[2]}, Step: {row[3]})')
else:
    print('  No overdue kits found')

# Test 3: High Autoclave Cycles
print('\n3. Kits with High Autoclave Cycles:')
cur.execute("""
    SELECT
        sk.asset_id,
        sk.asset_name,
        MAX(kle.total_autoclave_cycles) as cycles,
        sk.value_usd
    FROM surgical_kits sk
    JOIN kit_lifecycle_events kle ON sk.asset_id = kle.asset_id
    GROUP BY sk.asset_id, sk.asset_name, sk.value_usd
    HAVING MAX(kle.total_autoclave_cycles) > 140
    ORDER BY cycles DESC
""")
for row in cur.fetchall():
    print(f'  {row[0]} - {row[1]}: {row[2]} cycles (${row[3]:,})')

# Test 4: Low Battery Trackers
print('\n4. IoT Trackers with Low Battery:')
cur.execute("""
    SELECT
        it.tracker_id,
        sk.asset_name,
        it.battery_level,
        it.battery_status
    FROM iot_trackers it
    LEFT JOIN surgical_kits sk ON it.tracker_id = sk.tracker_id
    WHERE it.battery_level < 20
    ORDER BY it.battery_level ASC
""")
results = cur.fetchall()
if results:
    for row in results:
        print(f'  {row[0]} - {row[1]}: {row[2]}% ({row[3]})')
else:
    print('  All trackers have adequate battery')

# Test 5: Active Alerts
print('\n5. Active Kit Process Alerts:')
cur.execute("""
    SELECT
        alert_type,
        severity,
        asset_id,
        message,
        current_value,
        alert_timestamp
    FROM kit_process_alerts
    WHERE acknowledged = false
    ORDER BY severity DESC, alert_timestamp DESC
""")
for row in cur.fetchall():
    print(f'  [{row[1].upper()}] {row[0]}: {row[3]}')
    print(f'    Asset: {row[2]}, Value: {row[4]}, Time: {row[5]}')

# Test 6: Consignment Workflow Status
print('\n6. Consignment Kit Workflows:')
cur.execute("""
    SELECT
        cf.consignment_id,
        sk.asset_name,
        cf.current_step,
        cf.workflow_status,
        cf.step1_hospital_id
    FROM consignment_process_flow cf
    JOIN surgical_kits sk ON cf.asset_id = sk.asset_id
""")
for row in cur.fetchall():
    print(f'  {row[0]} - {row[1]} at {row[4]}')
    print(f'    Step {row[2]}, Status: {row[3]}')

# Test 7: Summary Counts
print('\n7. System Summary:')
cur.execute("SELECT COUNT(*) FROM iot_trackers")
print(f'  IoT Trackers: {cur.fetchone()[0]}')

cur.execute("SELECT COUNT(*) FROM surgical_kits")
print(f'  Surgical Kits: {cur.fetchone()[0]}')

cur.execute("SELECT COUNT(*) FROM loaner_process_flow WHERE workflow_status = 'active'")
print(f'  Active Loaner Workflows: {cur.fetchone()[0]}')

cur.execute("SELECT COUNT(*) FROM consignment_process_flow WHERE workflow_status = 'active'")
print(f'  Active Consignment Workflows: {cur.fetchone()[0]}')

cur.execute("SELECT COUNT(*) FROM kit_process_alerts WHERE acknowledged = false")
print(f'  Unacknowledged Alerts: {cur.fetchone()[0]}')

conn.close()
print('\n' + '='*80)
print('PULSE MONITORING TEST COMPLETE')
print('='*80)

#!/usr/bin/env python3
"""
Generate sample IoT tracker and kit workflow data for testing Enterprise Pulse agents
"""
import psycopg2
from datetime import datetime, timedelta
import random
import json

conn = psycopg2.connect(
    host='localhost',
    port=5433,
    database='mantrix_nexxt',
    user='mantrix',
    password='mantrix123'
)
cur = conn.cursor()

print("="*80)
print("GENERATING TEST KIT TRACKING DATA")
print("="*80)

# 1. Create IoT Trackers
print("\n1. Creating IoT Trackers...")
trackers = [
    ('SMADE-HOT-12345', 'HOT', 'HT-2024-00892', '2.4.1', 87, 'good', 1240, 'LPWAN', -78),
    ('SMADE-HOT-12346', 'HOT', 'HT-2024-00893', '2.4.1', 45, 'fair', 580, 'LPWAN', -82),
    ('SMADE-HOT-12347', 'HOT', 'HT-2024-00894', '2.4.1', 15, 'low', 180, 'LPWAN', -89),
    ('SMADE-HOT-12348', 'HOT', 'HT-2024-00895', '2.4.1', 92, 'good', 1450, 'LPWAN', -75),
    ('SMADE-COLD-56789', 'COLD', 'CT-2024-01234', '2.3.8', 73, 'good', 920, 'LPWAN', -80),
]

for tracker in trackers:
    cur.execute("""
        INSERT INTO iot_trackers (
            tracker_id, tracker_type, serial_number, firmware_version,
            battery_level, battery_status, estimated_battery_life_days,
            connectivity_type, signal_strength, last_transmission
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (tracker_id) DO NOTHING
    """, (*tracker, datetime.now() - timedelta(hours=random.randint(1, 12))))

conn.commit()
print(f"✅ Created {len(trackers)} IoT trackers")

# 2. Create Surgical Kits
print("\n2. Creating Surgical Kits...")
kits = [
    ('TRAY-ORTHO-456', 'Hip Replacement Surgical Tray Set A', 'surgical_tray', 'Acme Orthopedics', 'loaner', 125000, 'SMADE-HOT-12345'),
    ('TRAY-SPINE-789', 'Cervical Spine Fusion Kit Pro', 'surgical_tray', 'SpineTech Inc', 'loaner', 145000, 'SMADE-HOT-12346'),
    ('TRAY-KNEE-234', 'Total Knee Replacement Set B', 'surgical_tray', 'Acme Orthopedics', 'consignment', 98000, 'SMADE-HOT-12347'),
    ('TRAY-HIP-567', 'Hip Revision Surgery Kit', 'surgical_tray', 'Advanced Ortho', 'consignment', 135000, 'SMADE-HOT-12348'),
    ('TRAY-TRAUMA-890', 'Trauma Emergency Kit', 'surgical_tray', 'EmergencyMed', 'loaner', 115000, 'SMADE-COLD-56789'),
]

for kit in kits:
    cur.execute("""
        INSERT INTO surgical_kits (
            asset_id, asset_name, asset_type, manufacturer,
            logistics_status, value_usd, tracker_id, pairing_date
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (asset_id) DO NOTHING
    """, (*kit, datetime.now() - timedelta(days=random.randint(30, 365))))

conn.commit()
print(f"✅ Created {len(kits)} surgical kits")

# 3. Create Location History
print("\n3. Creating Location History...")
facilities = [
    ('HOSP-0892', 'St. Mary\'s Medical Center', 'Central Sterile Processing', 42.3398, -71.1006),
    ('HOSP-0451', 'Boston General Hospital', 'Surgery Department', 42.3601, -71.0589),
    ('DC-001', 'Northeast Distribution Center', 'Warehouse', 42.4072, -71.3824),
    ('HOSP-0723', 'Cambridge Medical Center', 'OR Suite 3', 42.3736, -71.1097),
]

for kit in kits:
    asset_id = kit[0]
    # Create 3-5 location events per kit
    for i in range(random.randint(3, 5)):
        facility = random.choice(facilities)
        arrival = datetime.now() - timedelta(days=random.randint(1, 30), hours=random.randint(0, 23))
        departure = arrival + timedelta(days=random.randint(1, 7))

        cur.execute("""
            INSERT INTO kit_location_history (
                asset_id, tracker_id, facility_id, facility_name, department,
                latitude, longitude, accuracy_meters, location_method,
                arrival_timestamp, departure_timestamp,
                duration_hours
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            asset_id, kit[6], facility[0], facility[1], facility[2],
            facility[3], facility[4], random.randint(5, 15), 'wifi',
            arrival, departure if i < 2 else None,
            (departure - arrival).total_seconds() / 3600 if i < 2 else None
        ))

conn.commit()
print(f"✅ Created location history")

# 4. Create Lifecycle Events
print("\n4. Creating Lifecycle Events...")
for kit in kits:
    asset_id = kit[0]
    tracker_id = kit[6]

    # Autoclave events
    autoclave_cycles = random.randint(120, 155)
    for i in range(3):
        event_time = datetime.now() - timedelta(days=random.randint(1, 15))
        cur.execute("""
            INSERT INTO kit_lifecycle_events (
                asset_id, tracker_id, event_type, event_timestamp,
                facility_id, autoclave_duration_minutes, max_temperature_celsius,
                max_pressure_bar, cycle_complete, total_autoclave_cycles,
                total_washing_cycles, total_usage_count, total_drop_count
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            asset_id, tracker_id, 'autoclave', event_time,
            random.choice(facilities)[0], random.randint(25, 35),
            random.uniform(132, 136), random.uniform(2.5, 3.0), True,
            autoclave_cycles - i, autoclave_cycles * 1.3, autoclave_cycles - 5, random.randint(1, 5)
        ))

    # Drop events (some with high impact)
    if random.random() > 0.5:
        drop_time = datetime.now() - timedelta(days=random.randint(1, 7))
        impact_g = random.uniform(8, 15)
        cur.execute("""
            INSERT INTO kit_lifecycle_events (
                asset_id, tracker_id, event_type, event_timestamp,
                facility_id, impact_force_g, total_drop_count
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            asset_id, tracker_id, 'drop', drop_time,
            random.choice(facilities)[0], impact_g, random.randint(1, 3)
        ))

conn.commit()
print(f"✅ Created lifecycle events")

# 5. Create Loaner Workflows
print("\n5. Creating Loaner Process Flows...")
loaner_kits = [k for k in kits if k[4] == 'loaner']

for idx, kit in enumerate(loaner_kits, 1):
    asset_id = kit[0]
    request_id = f'LNR-2025-{1000 + idx}'

    # Simulate different stages
    stage = random.choice(['early', 'mid', 'late', 'overdue'])

    step1_time = datetime.now() - timedelta(days=random.randint(3, 12))

    cur.execute("""
        INSERT INTO loaner_process_flow (
            asset_id, request_id,
            step1_request_timestamp, step1_requestor, step1_hospital_id, step1_status,
            step2_transfer_timestamp, step2_distributor_id, step2_status,
            step3_pick_timestamp, step3_ship_timestamp, step3_tracking_number, step3_status,
            step4_transit_start, step4_carrier, step4_status,
            step5_receipt_timestamp, step5_received_by, step5_status,
            step6_surgery_timestamp, step6_surgeon, step6_procedure_type, step6_status,
            current_step, workflow_status, is_overdue,
            expected_completion_date
        ) VALUES (
            %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s
        )
    """, (
        asset_id, request_id,
        step1_time, 'Dr. Johnson', 'HOSP-0892', 'Complete',
        step1_time + timedelta(hours=2), 'DIST-001', 'Complete',
        step1_time + timedelta(days=1), step1_time + timedelta(days=1, hours=4), 'FDX-123456', 'Complete',
        step1_time + timedelta(days=2), 'FedEx', 'Complete' if stage != 'early' else 'Active',
        step1_time + timedelta(days=4) if stage != 'early' else None, 'Receiving Staff' if stage != 'early' else None, 'Complete' if stage != 'early' else None,
        step1_time + timedelta(days=5) if stage in ['late', 'overdue'] else None, 'Dr. Smith' if stage in ['late', 'overdue'] else None, 'Hip Replacement' if stage in ['late', 'overdue'] else None, 'Complete' if stage in ['late', 'overdue'] else None,
        4 if stage == 'early' else (6 if stage == 'mid' else (8 if stage == 'late' else 9)),
        'active',
        stage == 'overdue',
        step1_time + timedelta(days=10)
    ))

conn.commit()
print(f"✅ Created {len(loaner_kits)} loaner workflows")

# 6. Create Consignment Workflows
print("\n6. Creating Consignment Process Flows...")
consignment_kits = [k for k in kits if k[4] == 'consignment']

for idx, kit in enumerate(consignment_kits, 1):
    asset_id = kit[0]
    consignment_id = f'CNS-2025-{2000 + idx}'

    step1_time = datetime.now() - timedelta(days=random.randint(2, 8))

    cur.execute("""
        INSERT INTO consignment_process_flow (
            asset_id, consignment_id,
            step1_request_timestamp, step1_requestor, step1_hospital_id, step1_status,
            step2_consign_timestamp, step2_distributor_id, step2_consignment_agreement, step2_status,
            step3_deploy_timestamp, step3_tracking_number, step3_delivery_timestamp, step3_status,
            step4_surgery_timestamp, step4_surgeon, step4_procedure_type, step4_status,
            step5_record_timestamp, step5_items_used, step5_status,
            current_step, workflow_status, is_overdue,
            expected_completion_date
        ) VALUES (
            %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s, %s
        )
    """, (
        asset_id, consignment_id,
        step1_time, 'Dr. Williams', 'HOSP-0723', 'Complete',
        step1_time + timedelta(hours=3), 'DIST-002', 'CSG-AGR-2025-001', 'Complete',
        step1_time + timedelta(days=1), 'FDX-234567', step1_time + timedelta(days=3), 'Complete',
        step1_time + timedelta(days=4), 'Dr. Anderson', 'Knee Replacement', 'Complete',
        step1_time + timedelta(days=4, hours=6), json.dumps({'screws': 12, 'plates': 2}), 'Complete',
        5 if random.random() > 0.5 else 7,
        'active',
        random.random() > 0.7,
        step1_time + timedelta(days=7)
    ))

conn.commit()
print(f"✅ Created {len(consignment_kits)} consignment workflows")

# 7. Generate Alerts
print("\n7. Creating Sample Alerts...")
alerts = [
    ('high_cycle_count', 'warning', 'TRAY-ORTHO-456', 'SMADE-HOT-12345', 'loaner', 'LNR-2025-1001', 6, 'Asset approaching recommended autoclave cycle limit', 150, 147),
    ('battery_low', 'high', 'TRAY-SPINE-789', 'SMADE-HOT-12346', 'loaner', 'LNR-2025-1002', 4, 'IoT tracker battery below 20%', 20, 15),
    ('workflow_delay', 'high', 'TRAY-KNEE-234', 'SMADE-HOT-12347', 'consignment', 'CNS-2025-2001', 5, 'Kit delayed in restocking step', 48, 72),
]

for alert in alerts:
    cur.execute("""
        INSERT INTO kit_process_alerts (
            alert_type, severity, asset_id, tracker_id, workflow_type, workflow_id,
            current_step, message, threshold_value, current_value
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, alert)

conn.commit()
print(f"✅ Created {len(alerts)} sample alerts")

print("\n" + "="*80)
print("TEST DATA GENERATION COMPLETE")
print("="*80)
print(f"\n📊 Summary:")
print(f"  - {len(trackers)} IoT Trackers")
print(f"  - {len(kits)} Surgical Kits")
print(f"  - {len(loaner_kits)} Loaner Workflows")
print(f"  - {len(consignment_kits)} Consignment Workflows")
print(f"  - {len(alerts)} Active Alerts")

conn.close()

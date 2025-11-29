-- Update monitor names from "Monitor" to "Agent" in pulse_monitors table
UPDATE pulse_monitors 
SET name = REPLACE(name, 'Monitor', 'Agent')
WHERE name LIKE '%Monitor%';

-- Update monitor names from "Alert" to "Agent" where applicable (optional)
-- UPDATE pulse_monitors 
-- SET name = REPLACE(name, 'Alert', 'Agent')
-- WHERE name LIKE '%Alert%';

-- Show updated names
SELECT id, name, category FROM pulse_monitors ORDER BY category, name;

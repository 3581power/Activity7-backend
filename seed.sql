INSERT INTO records (title, category, description, status)
SELECT *
FROM (VALUES
    ('Broken classroom chair', 'Furniture', 'A chair in the classroom is damaged and needs repair.', 'Pending'),
    ('Faulty classroom lights', 'Electrical', 'Several lights in the classroom are not working.', 'In progress'),
    ('Blocked washroom sink', 'Plumbing', 'The sink in the washroom is blocked.', 'Pending'),
    ('Damaged classroom door', 'Carpentry', 'The classroom door does not close properly.', 'Completed'),
    ('Water leakage', 'Plumbing', 'Water is leaking from a pipe near the lecture rooms.', 'Pending'),
    ('Broken window', 'Building', 'A window in the computer laboratory is damaged.', 'In progress'),
    ('Faulty power socket', 'Electrical', 'A power socket in the laboratory is not working.', 'Pending'),
    ('Damaged ceiling fan', 'Electrical', 'The ceiling fan in the lecture room is not functioning.', 'Completed')
) AS sample(title, category, description, status)
WHERE NOT EXISTS (
    SELECT 1 FROM records
);
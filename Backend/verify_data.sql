-- 1. List all projects
SELECT id, projectname, projecttype, status
FROM projects
LIMIT 10;

-- 2. Count addresses per project
SELECT p.projectname, COUNT(a.id) AS address_count
FROM projects p
LEFT JOIN project_addresses a ON p.id = a.projectid
GROUP BY p.projectname
LIMIT 10;

-- 3. Count configurations per project
SELECT p.projectname, COUNT(c.id) AS configuration_count
FROM projects p
LEFT JOIN configurations c ON p.id = c.projectid
GROUP BY p.projectname
LIMIT 10;

-- 4. Count variants per configuration
SELECT c.id AS configuration_id, COUNT(v.id) AS variant_count
FROM configurations c
LEFT JOIN variants v ON c.id = v.configurationid
GROUP BY c.id
LIMIT 10;

-- 5. Example: Show a variant with JSON fields
SELECT id, furnishingtype, propertyimages
FROM variants
LIMIT 5;

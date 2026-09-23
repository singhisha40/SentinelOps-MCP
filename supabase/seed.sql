-- ============================================================
-- SentinelOps Development Seed Data
-- ============================================================


-- ============================================================
-- EMPLOYEES
-- ============================================================

insert into public.employees (
    id,
    name,
    email,
    role,
    created_at
)
values
    (
        'EMP001',
        'Alice Johnson',
        'alice.johnson@sentinelops.local',
        'EMPLOYEE',
        now()
    ),
    (
        'EMP002',
        'Bob Smith',
        'bob.smith@sentinelops.local',
        'EMPLOYEE',
        now()
    ),
    (
        'EMP003',
        'Carol Williams',
        'carol.williams@sentinelops.local',
        'EMPLOYEE',
        now()
    ),
    (
        'EMP004',
        'David Brown',
        'david.brown@sentinelops.local',
        'IT_SUPPORT',
        now()
    ),
    (
        'EMP005',
        'Eve Davis',
        'eve.davis@sentinelops.local',
        'SECURITY_ADMIN',
        now()
    )
on conflict (id) do nothing;

-- ============================================================
-- DEVICES
-- ============================================================

insert into public.devices (
    id,
    employee_id,
    device_type,
    manufacturer,
    model,
    os,
    os_version,
    hostname,
    serial_number,
    status,
    last_seen
)
values
    (
        'DEV001',
        'EMP001',
        'LAPTOP',
        'Dell',
        'Latitude 7440',
        'Windows',
        '11',
        'ALICE-LAPTOP',
        'SN-ALICE-001',
        'ACTIVE',
        now()
    ),
    (
        'DEV002',
        'EMP002',
        'LAPTOP',
        'Lenovo',
        'ThinkPad T14',
        'Windows',
        '11',
        'BOB-LAPTOP',
        'SN-BOB-002',
        'ACTIVE',
        now()
    ),
    (
        'DEV003',
        'EMP003',
        'LAPTOP',
        'Apple',
        'MacBook Pro',
        'macOS',
        '15',
        'CAROL-MAC',
        'SN-CAROL-003',
        'ACTIVE',
        now()
    ),
    (
        'DEV004',
        'EMP004',
        'LAPTOP',
        'Dell',
        'Latitude 7450',
        'Windows',
        '11',
        'DAVID-LAPTOP',
        'SN-DAVID-004',
        'ACTIVE',
        now()
    ),
    (
        'DEV005',
        'EMP005',
        'LAPTOP',
        'Lenovo',
        'ThinkPad X1',
        'Windows',
        '11',
        'EVE-LAPTOP',
        'SN-EVE-005',
        'ACTIVE',
        now()
    )
on conflict (id) do nothing;

-- ============================================================
-- POLICIES
-- ============================================================

insert into public.policies (
    id,
    operation,
    risk_level,
    required_role,
    approval_required,
    approval_count,
    description
)
values
    (
        'POL001',
        'get_device',
        'LOW',
        'EMPLOYEE',
        false,
        0,
        'Retrieve device information.'
    ),
    (
        'POL002',
        'search_tickets',
        'LOW',
        'EMPLOYEE',
        false,
        0,
        'Search support tickets.'
    ),
    (
        'POL003',
        'create_ticket',
        'LOW',
        'EMPLOYEE',
        false,
        0,
        'Create a support ticket.'
    ),
    (
        'POL004',
        'reset_vpn',
        'HIGH',
        'IT_SUPPORT',
        true,
        1,
        'Reset VPN credentials or configuration.'
    ),
    (
        'POL005',
        'reset_password',
        'HIGH',
        'IT_ADMINISTRATOR',
        true,
        1,
        'Reset an employee password.'
    ),
    (
        'POL006',
        'disable_account',
        'HIGH',
        'SECURITY_ADMIN',
        true,
        1,
        'Disable an employee account.'
    ),
    (
        'POL007',
        'wipe_device',
        'CRITICAL',
        'SECURITY_ADMIN',
        true,
        2,
        'Wipe a device. Requires elevated authorization.'
    );


-- ============================================================
-- TICKETS
-- ============================================================

insert into public.tickets (
    id,
    employee_id,
    device_id,
    title,
    description,
    category,
    priority,
    status,
    assigned_to,
    created_at,
    updated_at
)
values
    (
        'TCK001',
        'EMP001',
        'DEV001',
        'VPN connection failing',
        'Unable to connect to the corporate VPN from the office network.',
        'NETWORK',
        'HIGH',
        'OPEN',
        'EMP004',
        now(),
        now()
    ),
    (
        'TCK002',
        'EMP002',
        'DEV002',
        'Laptop running slowly',
        'Laptop performance has become very slow during normal work.',
        'HARDWARE',
        'MEDIUM',
        'OPEN',
        'EMP004',
        now(),
        now()
    ),
    (
        'TCK003',
        'EMP003',
        'DEV003',
        'Cannot access company email',
        'Company email is not loading and messages cannot be sent.',
        'EMAIL',
        'HIGH',
        'IN_PROGRESS',
        'EMP004',
        now(),
        now()
    ),
    (
        'TCK004',
        'EMP001',
        'DEV001',
        'Wi-Fi disconnecting frequently',
        'Wi-Fi disconnects several times throughout the workday.',
        'NETWORK',
        'MEDIUM',
        'OPEN',
        'EMP004',
        now(),
        now()
    ),
    (
        'TCK005',
        'EMP002',
        'DEV002',
        'Password reset request',
        'Employee needs assistance resetting their corporate password.',
        'ACCOUNT',
        'LOW',
        'RESOLVED',
        'EMP004',
        now(),
        now()
    );
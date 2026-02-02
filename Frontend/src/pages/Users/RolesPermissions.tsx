import { useState } from 'react';

interface Permission {
  name: string;
  description: string;
  category: string;
}

interface Role {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  description: string;
  permissions: string[];
}

const RolesPermissions = () => {
  const [selectedRole, setSelectedRole] = useState<string>('admin');

  const roles: Role[] = [
    {
      name: 'admin',
      displayName: 'Administrator',
      color: 'purple',
      icon: 'fa-user-shield',
      description: 'Full system access with all permissions',
      permissions: [
        'manage_users',
        'manage_roles',
        'view_all_farms',
        'manage_farms',
        'view_all_animals',
        'manage_animals',
        'manage_health_records',
        'manage_treatments',
        'manage_vaccinations',
        'view_financial_reports',
        'manage_expenses',
        'manage_revenue',
        'system_settings',
        'audit_logs',
        'backup_restore'
      ]
    },
    {
      name: 'farmer',
      displayName: 'Farmer',
      color: 'green',
      icon: 'fa-tractor',
      description: 'Manage own farms and animals',
      permissions: [
        'view_own_farms',
        'manage_own_farms',
        'view_own_animals',
        'manage_own_animals',
        'view_health_records',
        'request_treatments',
        'request_vaccinations',
        'view_own_financial_reports',
        'manage_own_expenses',
        'manage_own_revenue',
        'manage_workers'
      ]
    },
    {
      name: 'veterinary',
      displayName: 'Veterinarian',
      color: 'blue',
      icon: 'fa-stethoscope',
      description: 'Manage animal health and treatments',
      permissions: [
        'view_all_animals',
        'view_health_records',
        'manage_health_records',
        'manage_treatments',
        'manage_vaccinations',
        'prescribe_medication',
        'view_earnings',
        'update_health_status'
      ]
    },
    {
      name: 'worker',
      displayName: 'Farm Worker',
      color: 'yellow',
      icon: 'fa-hard-hat',
      description: 'Day-to-day farm operations',
      permissions: [
        'view_assigned_animals',
        'update_feeding_records',
        'report_health_issues',
        'view_tasks',
        'update_task_status',
        'view_own_schedule'
      ]
    },
    {
      name: 'loan_officer',
      displayName: 'Loan Officer',
      color: 'orange',
      icon: 'fa-hand-holding-usd',
      description: 'Manage loans and financial assessments',
      permissions: [
        'view_loan_applications',
        'approve_loans',
        'manage_repayments',
        'view_credit_analysis',
        'view_risk_assessment',
        'view_portfolio'
      ]
    }
  ];

  const allPermissions: Permission[] = [
    // User Management
    { name: 'manage_users', description: 'Create, edit, and delete users', category: 'User Management' },
    { name: 'manage_roles', description: 'Assign and modify user roles', category: 'User Management' },
    
    // Farm Management
    { name: 'view_all_farms', description: 'View all farms in the system', category: 'Farm Management' },
    { name: 'view_own_farms', description: 'View only owned farms', category: 'Farm Management' },
    { name: 'manage_farms', description: 'Create and edit any farm', category: 'Farm Management' },
    { name: 'manage_own_farms', description: 'Create and edit owned farms', category: 'Farm Management' },
    { name: 'manage_workers', description: 'Assign and manage farm workers', category: 'Farm Management' },
    
    // Animal Management
    { name: 'view_all_animals', description: 'View all animals in the system', category: 'Animal Management' },
    { name: 'view_own_animals', description: 'View only animals in owned farms', category: 'Animal Management' },
    { name: 'view_assigned_animals', description: 'View assigned animals only', category: 'Animal Management' },
    { name: 'manage_animals', description: 'Create, edit, and delete any animal', category: 'Animal Management' },
    { name: 'manage_own_animals', description: 'Create, edit animals in owned farms', category: 'Animal Management' },
    
    // Health Management
    { name: 'view_health_records', description: 'View animal health records', category: 'Health Management' },
    { name: 'manage_health_records', description: 'Create and update health records', category: 'Health Management' },
    { name: 'manage_treatments', description: 'Prescribe and manage treatments', category: 'Health Management' },
    { name: 'manage_vaccinations', description: 'Schedule and administer vaccinations', category: 'Health Management' },
    { name: 'prescribe_medication', description: 'Prescribe medication to animals', category: 'Health Management' },
    { name: 'update_health_status', description: 'Update animal health status', category: 'Health Management' },
    { name: 'request_treatments', description: 'Request veterinary treatments', category: 'Health Management' },
    { name: 'request_vaccinations', description: 'Request vaccinations', category: 'Health Management' },
    { name: 'report_health_issues', description: 'Report health concerns', category: 'Health Management' },
    
    // Financial Management
    { name: 'view_financial_reports', description: 'View all financial reports', category: 'Financial Management' },
    { name: 'view_own_financial_reports', description: 'View own farm financial reports', category: 'Financial Management' },
    { name: 'manage_expenses', description: 'Create and edit any expenses', category: 'Financial Management' },
    { name: 'manage_own_expenses', description: 'Create and edit own expenses', category: 'Financial Management' },
    { name: 'manage_revenue', description: 'Create and edit any revenue', category: 'Financial Management' },
    { name: 'manage_own_revenue', description: 'Create and edit own revenue', category: 'Financial Management' },
    { name: 'view_earnings', description: 'View personal earnings', category: 'Financial Management' },
    
    // Loan Management
    { name: 'view_loan_applications', description: 'View loan applications', category: 'Loan Management' },
    { name: 'approve_loans', description: 'Approve or reject loans', category: 'Loan Management' },
    { name: 'manage_repayments', description: 'Track and manage loan repayments', category: 'Loan Management' },
    { name: 'view_credit_analysis', description: 'Access credit analysis reports', category: 'Loan Management' },
    { name: 'view_risk_assessment', description: 'View risk assessment data', category: 'Loan Management' },
    { name: 'view_portfolio', description: 'View loan portfolio overview', category: 'Loan Management' },
    
    // Task Management
    { name: 'view_tasks', description: 'View assigned tasks', category: 'Task Management' },
    { name: 'update_task_status', description: 'Update task completion status', category: 'Task Management' },
    { name: 'view_own_schedule', description: 'View personal work schedule', category: 'Task Management' },
    
    // Feeding Management
    { name: 'update_feeding_records', description: 'Log feeding activities', category: 'Feeding Management' },
    
    // System
    { name: 'system_settings', description: 'Modify system configurations', category: 'System' },
    { name: 'audit_logs', description: 'View system audit logs', category: 'System' },
    { name: 'backup_restore', description: 'Backup and restore system data', category: 'System' }
  ];

  const currentRole = roles.find(r => r.name === selectedRole);

  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const hasPermission = (permissionName: string) => {
    return currentRole?.permissions.includes(permissionName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-600 mt-2">View and understand user roles and their permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Roles</h2>
            </div>
            <div className="p-4 space-y-2">
              {roles.map((role) => (
                <button
                  key={role.name}
                  onClick={() => setSelectedRole(role.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedRole === role.name
                      ? `bg-${role.color}-50 border-2 border-${role.color}-500`
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg bg-${role.color}-100 text-${role.color}-600 flex items-center justify-center mr-3`}>
                      <i className={`fas ${role.icon}`}></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{role.displayName}</p>
                      <p className="text-xs text-gray-500">
                        {role.permissions.length} permissions
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Details */}
        <div className="lg:col-span-2">
          {currentRole && (
            <div className="bg-white rounded-lg shadow">
              {/* Role Header */}
              <div className={`p-6 border-b border-gray-200 bg-gradient-to-r from-${currentRole.color}-50 to-white`}>
                <div className="flex items-center mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-${currentRole.color}-100 text-${currentRole.color}-600 flex items-center justify-center mr-4`}>
                    <i className={`fas ${currentRole.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentRole.displayName}</h2>
                    <p className="text-gray-600 mt-1">{currentRole.description}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fas fa-shield-alt mr-2"></i>
                  <span>{currentRole.permissions.length} permissions granted</span>
                </div>
              </div>

              {/* Permissions by Category */}
              <div className="p-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-folder text-gray-400 mr-2"></i>
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {permissions.map((permission) => {
                        const isGranted = hasPermission(permission.name);
                        return (
                          <div
                            key={permission.name}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isGranted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                isGranted ? 'bg-green-100' : 'bg-gray-200'
                              }`}>
                                <i className={`fas ${isGranted ? 'fa-check text-green-600' : 'fa-times text-gray-400'}`}></i>
                              </div>
                              <div>
                                <p className={`font-medium ${isGranted ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {permission.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {permission.name}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isGranted
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isGranted ? 'Granted' : 'Denied'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start">
          <i className="fas fa-info-circle text-blue-500 text-xl mr-3 mt-1"></i>
          <div>
            <h4 className="text-lg font-semibold text-blue-800 mb-2">About Roles & Permissions</h4>
            <p className="text-sm text-blue-700 mb-2">
              Roles define what users can do in the system. Each role has a specific set of permissions that control access to features and data.
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Permissions are automatically assigned based on the user's role</li>
              <li>Users can only have one role at a time</li>
              <li>Contact an administrator to change your role or permissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;

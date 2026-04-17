'use client';

import ModulePlaceholder from '@/components/shared/ModulePlaceholder';

import withAuth from '@/components/withAuth';

function LeadsPage() {
  return <ModulePlaceholder title="Leads Management" moduleName="CRM" />;
}

export default withAuth(LeadsPage, [{ module: 'sales', action: 'view' }]);

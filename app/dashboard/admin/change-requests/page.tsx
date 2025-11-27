import { getAllPendingChangeRequests } from '@/lib/actions/change-request.actions'
import ChangeRequestsList from '../../../../components/dashboard/admin/ChangeRequestsList'

export default async function AdminChangeRequestsPage() {
  const requests = await getAllPendingChangeRequests()

  return <ChangeRequestsList initialRequests={requests} />
}


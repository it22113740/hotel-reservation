'use client'

import { useState, useEffect } from 'react'
import { Clock, Building2, FileText, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approveChangeRequest, rejectChangeRequest, getChangeRequest } from '@/lib/actions/change-request.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import ChangeRequestModal from './ChangeRequestModal'

interface ChangeRequest {
  _id: string
  hotelId: {
    _id: string
    name: string
    ownerName: string
    contactEmail: string
  }
  managerId: string
  status: 'pending' | 'approved' | 'rejected'
  managerNotes?: string
  adminFeedback?: string
  hotelChanges?: any
  roomChanges?: Array<{
    action: 'create' | 'update' | 'delete'
    roomId?: string
    data?: any
  }>
  createdAt: string
  updatedAt: string
}

interface ChangeRequestsListProps {
  initialRequests: ChangeRequest[]
}

export default function ChangeRequestsList({ initialRequests }: ChangeRequestsListProps) {
  const router = useRouter()
  const [requests, setRequests] = useState<ChangeRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [requestDetails, setRequestDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionFeedback, setRejectionFeedback] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null)
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null)

  useEffect(() => {
    setRequests(initialRequests)
  }, [initialRequests])

  const handleViewDetails = async (request: ChangeRequest) => {
    setIsLoading(true)
    try {
      const details = await getChangeRequest(request._id)
      setRequestDetails(details)
      setSelectedRequest(request)
      setShowModal(true)
    } catch (error) {
      toast.error('Failed to load request details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approvingRequestId) return

    setIsLoading(true)
    try {
      const result = await approveChangeRequest(approvingRequestId)
      if (result.success) {
        toast.success(result.message)
        setRequests(requests.filter(r => r._id !== approvingRequestId))
        setShowModal(false)
        setShowApproveModal(false)
        setApprovingRequestId(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to approve request')
    } finally {
      setIsLoading(false)
    }
  }

  const openApproveModal = (requestId: string) => {
    setApprovingRequestId(requestId)
    setShowApproveModal(true)
  }

  const handleReject = async () => {
    if (!rejectingRequestId || !rejectionFeedback.trim()) {
      toast.error('Please provide feedback for rejection')
      return
    }

    setIsLoading(true)
    try {
      const result = await rejectChangeRequest(rejectingRequestId, rejectionFeedback)
      if (result.success) {
        toast.success(result.message)
        setRequests(requests.filter(r => r._id !== rejectingRequestId))
        setShowRejectModal(false)
        setRejectionFeedback('')
        setRejectingRequestId(null)
        setShowModal(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to reject request')
    } finally {
      setIsLoading(false)
    }
  }

  const openRejectModal = (requestId: string) => {
    setRejectingRequestId(requestId)
    setShowRejectModal(true)
  }

  const getChangeSummary = (request: ChangeRequest) => {
    const changes: string[] = []
    
    if (request.hotelChanges) {
      const hotelChanges = request.hotelChanges
      if (hotelChanges.amenities) changes.push('Hotel amenities')
      if (hotelChanges.description) changes.push('Hotel description')
      if (hotelChanges.category) changes.push('Hotel category')
      if (hotelChanges.checkIn || hotelChanges.checkOut) changes.push('Check-in/out times')
      if (hotelChanges.images) changes.push('Hotel images')
      if (hotelChanges.coordinates) changes.push('Location coordinates')
      if (hotelChanges.languages) changes.push('Languages')
      if (hotelChanges.policies) changes.push('Policies')
    }
    
    if (request.roomChanges && request.roomChanges.length > 0) {
      const roomActions = request.roomChanges.map(rc => {
        if (rc.action === 'create') return 'Add room'
        if (rc.action === 'update') return 'Update room'
        if (rc.action === 'delete') return 'Delete room'
        return ''
      }).filter(Boolean)
      changes.push(...roomActions)
    }
    
    return changes.length > 0 ? changes.join(', ') : 'No changes specified'
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve manager change requests</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending change requests</h3>
          <p className="text-gray-600">All change requests have been reviewed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
        <p className="text-gray-600 mt-1">Review and approve manager change requests</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {requests.map((request) => (
            <div key={request._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.hotelId.name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </div>
                  
                  <div className="ml-8 space-y-1 text-sm text-gray-600">
                    <p><strong>Manager:</strong> {request.hotelId.ownerName}</p>
                    <p><strong>Changes:</strong> {getChangeSummary(request)}</p>
                    {request.managerNotes && (
                      <p className="mt-2">
                        <strong>Notes:</strong> <span className="italic">{request.managerNotes}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted: {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                    disabled={isLoading}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Request Details Modal */}
      {showModal && selectedRequest && requestDetails && (
        <ChangeRequestModal
          request={selectedRequest}
          requestDetails={requestDetails}
          onClose={() => {
            setShowModal(false)
            setSelectedRequest(null)
            setRequestDetails(null)
          }}
          onApprove={() => openApproveModal(selectedRequest._id)}
          onReject={() => openRejectModal(selectedRequest._id)}
          isLoading={isLoading}
        />
      )}

      {/* Approval Confirmation Modal */}
      {showApproveModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setShowApproveModal(false)
              setApprovingRequestId(null)
            }}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Approve Change Request</h3>
                  <p className="text-sm text-gray-600">Confirm approval of this change request</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Are you sure you want to approve this request?</p>
                    <p>All changes will be applied immediately after approval. This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApproveModal(false)
                    setApprovingRequestId(null)
                  }}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Approving...' : 'Approve Request'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setShowRejectModal(false)
              setRejectionFeedback('')
              setRejectingRequestId(null)
            }}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reject Change Request</h3>
                  <p className="text-sm text-gray-600">Please provide feedback for the manager</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Feedback *
                </label>
                <textarea
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Explain why this change request is being rejected and what needs to be fixed..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionFeedback('')
                    setRejectingRequestId(null)
                  }}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isLoading || !rejectionFeedback.trim()}
                >
                  {isLoading ? 'Rejecting...' : 'Reject Request'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


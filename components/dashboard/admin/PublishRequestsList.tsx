'use client'

import { useState } from 'react'
import { Building2, MapPin, User, Eye, Check, X, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { approvePublish, rejectPublish, requestPublishChanges } from '@/lib/actions/hotel.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PublishRequest {
  _id: string
  name: string
  slug: string
  description: string
  city: string
  country: string
  fullAddress: string
  location: string
  ownerName: string
  contactEmail: string
  images: string[]
  publishStatus: 'publish_requested'
  createdAt: string
  updatedAt: string
}

interface PublishRequestsListProps {
  requests: PublishRequest[]
}

export default function PublishRequestsList({ requests }: PublishRequestsListProps) {
  const router = useRouter()
  const [selectedRequest, setSelectedRequest] = useState<PublishRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState<{
    show: boolean
    action: 'approve' | 'reject' | 'request_changes' | null
    id: string | null
  }>({
    show: false,
    action: null,
    id: null
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [changeRequest, setChangeRequest] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = (id: string, action: 'approve' | 'reject' | 'request_changes') => {
    setShowActionDialog({ show: true, action, id })
  }

  const confirmAction = async () => {
    if (!showActionDialog.id || !showActionDialog.action) return

    setIsProcessing(true)

    try {
      let result

      if (showActionDialog.action === 'approve') {
        result = await approvePublish(showActionDialog.id)
      } else if (showActionDialog.action === 'reject') {
        if (!rejectionReason.trim()) {
          toast.error('Please provide a rejection reason')
          setIsProcessing(false)
          return
        }
        result = await rejectPublish(showActionDialog.id, rejectionReason)
      } else if (showActionDialog.action === 'request_changes') {
        if (!changeRequest.trim()) {
          toast.error('Please provide change request details')
          setIsProcessing(false)
          return
        }
        result = await requestPublishChanges(showActionDialog.id, changeRequest)
      }

      if (result?.success) {
        toast.success(result.message)
        router.refresh()
        setShowActionDialog({ show: false, action: null, id: null })
        setShowDetailModal(false)
        setRejectionReason('')
        setChangeRequest('')
      } else {
        toast.error(result?.message || 'Failed to process request')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const viewDetails = (request: PublishRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publish Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve hotel publish requests</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No publish requests</h3>
          <p className="text-gray-600">All publish requests have been reviewed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publish Requests</h1>
          <p className="text-gray-600 mt-1">
            {requests.length} hotel{requests.length !== 1 ? 's' : ''} waiting for review
          </p>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
              {request.images && request.images.length > 0 ? (
                <Image
                  src={request.images[0]}
                  alt={request.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{request.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {request.location}
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{request.ownerName}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewDetails(request)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction(request._id, 'approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(request._id, 'reject')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-6">
                {/* Images */}
                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Hotel Images</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedRequest.images.map((image, index) => (
                        <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <Image src={image} alt={`${selectedRequest.name} ${index + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-900">{selectedRequest.fullAddress}</p>
                        <p className="text-gray-600">{selectedRequest.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Owner Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{selectedRequest.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{selectedRequest.contactEmail}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => handleAction(selectedRequest._id, 'request_changes')}
                variant="outline"
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
              <Button
                onClick={() => handleAction(selectedRequest._id, 'reject')}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleAction(selectedRequest._id, 'approve')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Action Dialog */}
      {showActionDialog.show && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setShowActionDialog({ show: false, action: null, id: null })
              setRejectionReason('')
              setChangeRequest('')
            }}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                showActionDialog.action === 'approve' ? 'bg-green-100' :
                showActionDialog.action === 'reject' ? 'bg-red-100' :
                'bg-yellow-100'
              }`}>
                {showActionDialog.action === 'approve' ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : showActionDialog.action === 'reject' ? (
                  <X className="w-6 h-6 text-red-600" />
                ) : (
                  <MessageSquare className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showActionDialog.action === 'approve' ? 'Approve Publish Request?' :
                 showActionDialog.action === 'reject' ? 'Reject Publish Request?' :
                 'Request Changes?'}
              </h3>
              <p className="text-gray-600 mb-6">
                {showActionDialog.action === 'approve' ? 
                  'This hotel will be published and visible to all travelers.' :
                 showActionDialog.action === 'reject' ?
                  'This publish request will be rejected. Please provide a reason.' :
                  'Please provide details about the changes needed.'}
              </p>

              {/* Rejection Reason */}
              {showActionDialog.action === 'reject' && (
                <div className="mb-6 text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              )}

              {/* Change Request */}
              {showActionDialog.action === 'request_changes' && (
                <div className="mb-6 text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Request Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={changeRequest}
                    onChange={(e) => setChangeRequest(e.target.value)}
                    placeholder="Please provide details about the changes needed..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowActionDialog({ show: false, action: null, id: null })
                    setRejectionReason('')
                    setChangeRequest('')
                  }}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAction}
                  disabled={
                    isProcessing ||
                    (showActionDialog.action === 'reject' && !rejectionReason.trim()) ||
                    (showActionDialog.action === 'request_changes' && !changeRequest.trim())
                  }
                  className={`flex-1 ${
                    showActionDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    showActionDialog.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? 'Processing...' :
                   showActionDialog.action === 'approve' ? 'Approve' :
                   showActionDialog.action === 'reject' ? 'Reject' :
                   'Send Request'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


'use client'

import { useState } from 'react'
import { X, Check, MessageSquare, MapPin, User, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { approvePublish, rejectPublish, requestPublishChanges } from '@/lib/actions/hotel.actions'
import { toast } from 'sonner'

interface Hotel {
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
  contactPhone?: string
  images: string[]
  publishStatus?: 'publish_requested'
}

interface PublishRequestModalProps {
  hotel: Hotel
  onClose: () => void
  onSuccess: () => void
}

export default function PublishRequestModal({ hotel, onClose, onSuccess }: PublishRequestModalProps) {
  const [showActionDialog, setShowActionDialog] = useState<{
    show: boolean
    action: 'approve' | 'reject' | 'request_changes' | null
  }>({
    show: false,
    action: null
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [changeRequest, setChangeRequest] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = (action: 'approve' | 'reject' | 'request_changes') => {
    setShowActionDialog({ show: true, action })
  }

  const confirmAction = async () => {
    if (!showActionDialog.action) return

    setIsProcessing(true)

    try {
      let result

      if (showActionDialog.action === 'approve') {
        result = await approvePublish(hotel._id)
      } else if (showActionDialog.action === 'reject') {
        if (!rejectionReason.trim()) {
          toast.error('Please provide a rejection reason')
          setIsProcessing(false)
          return
        }
        result = await rejectPublish(hotel._id, rejectionReason)
      } else if (showActionDialog.action === 'request_changes') {
        if (!changeRequest.trim()) {
          toast.error('Please provide change request details')
          setIsProcessing(false)
          return
        }
        result = await requestPublishChanges(hotel._id, changeRequest)
      }

      if (result?.success) {
        toast.success(result.message)
        onSuccess()
        setShowActionDialog({ show: false, action: null })
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

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-lg shadow-xl z-50 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                Publish Request
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Images */}
            {hotel.images && hotel.images.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Hotel Images</h3>
                <div className="grid grid-cols-3 gap-4">
                  {hotel.images.map((image, index) => (
                    <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={image} alt={`${hotel.name} ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{hotel.description}</p>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{hotel.fullAddress}</p>
                    <p className="text-gray-600">{hotel.location}</p>
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
                  <span className="text-gray-900">{hotel.ownerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{hotel.contactEmail}</span>
                </div>
                {hotel.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{hotel.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => handleAction('request_changes')}
            variant="outline"
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Request Changes
          </Button>
          <Button
            onClick={() => handleAction('reject')}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={() => handleAction('approve')}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>

      {/* Action Dialog */}
      {showActionDialog.show && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setShowActionDialog({ show: false, action: null })
              setRejectionReason('')
              setChangeRequest('')
            }}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-[60] p-6">
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
                    setShowActionDialog({ show: false, action: null })
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
    </>
  )
}


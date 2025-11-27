'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertCircle, X, FileText, Edit, Plus, Trash2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getManagerPendingRequest, updateManagerNotes, cancelPendingRequest } from '@/lib/actions/change-request.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function PendingChangeRequest() {
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNotesEditor, setShowNotesEditor] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    loadRequest()
  }, [])

  const loadRequest = async () => {
    setIsLoading(true)
    try {
      const data = await getManagerPendingRequest()
      setRequest(data)
      if (data?.managerNotes) {
        setNotes(data.managerNotes)
      }
    } catch (error) {
      console.error('Error loading request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      const result = await updateManagerNotes(notes)
      if (result.success) {
        toast.success(result.message)
        setShowNotesEditor(false)
        await loadRequest()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to save notes')
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this pending request? All changes will be lost.')) {
      return
    }

    setIsCancelling(true)
    try {
      const result = await cancelPendingRequest()
      if (result.success) {
        toast.success(result.message)
        setRequest(null)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to cancel request')
    } finally {
      setIsCancelling(false)
    }
  }

  const getChangeSummary = () => {
    if (!request) return []
    
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
      request.roomChanges.forEach((rc: any) => {
        if (rc.action === 'create') changes.push('Add room')
        if (rc.action === 'update') changes.push('Update room')
        if (rc.action === 'delete') changes.push('Delete room')
      })
    }
    
    return changes
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!request) {
    return null
  }

  const changes = getChangeSummary()

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Approval Request</h3>
            <p className="text-sm text-gray-600">
              Submitted: {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isCancelling}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-2" />
          {isCancelling ? 'Cancelling...' : 'Cancel Request'}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Changes Pending Approval:</h4>
          <div className="flex flex-wrap gap-2">
            {changes.length > 0 ? (
              changes.map((change, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                >
                  {change}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No changes specified</span>
            )}
          </div>
        </div>

        {/* Manager Notes */}
        <div className="border-t border-yellow-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes for Admin
            </h4>
            {!showNotesEditor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotesEditor(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                {request.managerNotes ? 'Edit' : 'Add'} Notes
              </Button>
            )}
          </div>

          {showNotesEditor ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add any context or notes for the admin reviewing your changes..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNotesEditor(false)
                    setNotes(request.managerNotes || '')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              {request.managerNotes ? (
                <p className="text-sm text-gray-700">{request.managerNotes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No notes added</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Waiting for Admin Approval</p>
              <p>Your changes are pending review. You can continue making changes, and they will be added to this request. Once approved, all changes will be applied together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


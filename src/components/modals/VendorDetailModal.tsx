'use client';

import { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Vendor } from '@/lib/api/types';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Ban,
  MessageSquare,
  FileText,
  Clock,
  Shield,
  Globe,
  Building,
  BarChart3,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface VendorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor;
  onEdit?: (vendor: Vendor) => void;
  onSuspend?: (vendorId: string) => void;
  onActivate?: (vendorId: string) => void;
  onContact?: (vendor: Vendor) => void;
}

export function VendorDetailModal({
  isOpen,
  onClose,
  vendor,
  onEdit,
  onSuspend,
  onActivate,
  onContact,
}: VendorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'performance'>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return CheckCircle;
      case 'PENDING':
        return Clock;
      case 'REJECTED':
        return XCircle;
      case 'SUSPENDED':
        return Ban;
      default:
        return AlertTriangle;
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNVERIFIED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusIcon = getStatusIcon(vendor.status);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
      <div className='flex items-center justify-between p-6 border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <div className='h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center'>
            <span className='text-white text-lg font-medium'>
              {vendor.businessName?.charAt(0) || 'V'}
            </span>
          </div>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>{vendor.businessName}</h2>
            <p className='text-sm text-gray-500'>{vendor.businessType}</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <StatusIcon className='w-4 h-4' />
            <span
              className={cn(
                'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                getStatusColor(vendor.status)
              )}
            >
              {vendor.status.toLowerCase()}
            </span>
          </div>
          <Button variant='outline' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>
      </div>

      <div className='flex border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={cn(
            'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'documents'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={cn(
            'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'performance'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Performance
        </button>
      </div>

      <ModalBody className='p-6'>
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900'>Business Information</h3>

                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <Building className='w-4 h-4 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{vendor.businessName}</p>
                      <p className='text-xs text-gray-500'>{vendor.businessType}</p>
                    </div>
                  </div>

                  {vendor.businessDescription && (
                    <div className='flex gap-3'>
                      <FileText className='w-4 h-4 text-gray-400 mt-1' />
                      <div>
                        <p className='text-sm text-gray-600'>{vendor.businessDescription}</p>
                      </div>
                    </div>
                  )}

                  {vendor.website && (
                    <div className='flex items-center gap-3'>
                      <Globe className='w-4 h-4 text-gray-400' />
                      <a
                        href={vendor.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-blue-600 hover:underline'
                      >
                        {vendor.website}
                      </a>
                    </div>
                  )}

                  {vendor.businessAddress && (
                    <div className='flex gap-3'>
                      <MapPin className='w-4 h-4 text-gray-400 mt-1' />
                      <div>
                        <p className='text-sm text-gray-600'>
                          {vendor.businessAddress.street && `${vendor.businessAddress.street}, `}
                          {vendor.businessAddress.city && `${vendor.businessAddress.city}, `}
                          {vendor.businessAddress.state && `${vendor.businessAddress.state}, `}
                          {vendor.businessAddress.country}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className='flex items-center gap-3'>
                    <Calendar className='w-4 h-4 text-gray-400' />
                    <div>
                      <p className='text-sm text-gray-600'>
                        Joined {format(new Date(vendor.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900'>Owner Information</h3>

                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <User className='w-4 h-4 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {vendor.user?.firstName && vendor.user?.lastName
                          ? `${vendor.user.firstName} ${vendor.user.lastName}`
                          : 'No name provided'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Mail className='w-4 h-4 text-gray-400' />
                    <p className='text-sm text-gray-600'>{vendor.user?.email}</p>
                  </div>

                  {vendor.user?.phone && (
                    <div className='flex items-center gap-3'>
                      <Phone className='w-4 h-4 text-gray-400' />
                      <p className='text-sm text-gray-600'>{vendor.user.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className='border-t pt-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Verification Status</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-900'>Status</span>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                        getVerificationStatusColor(vendor.verificationStatus)
                      )}
                    >
                      {vendor.verificationStatus.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-900'>Documents</span>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                        vendor.documentsSubmitted
                          ? vendor.documentsVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {vendor.documentsSubmitted
                        ? vendor.documentsVerified
                          ? 'Verified'
                          : 'Pending'
                        : 'Missing'}
                    </span>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-900'>Tax ID</span>
                    <span className='text-sm text-gray-600'>{vendor.taxId || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Details */}
            {vendor.registrationNumber && (
              <div className='border-t pt-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Registration Details</h3>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Registration Number:</span>{' '}
                    {vendor.registrationNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900'>Submitted Documents</h3>
            {vendor.documents && vendor.documents.length > 0 ? (
              <div className='space-y-3'>
                {vendor.documents.map(doc => (
                  <div key={doc.id} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <FileText className='w-5 h-5 text-gray-400' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>{doc.fileName}</p>
                          <p className='text-xs text-gray-500'>{doc.type}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            doc.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {doc.status.toLowerCase()}
                        </span>
                        <Button variant='outline' size='sm'>
                          View
                        </Button>
                      </div>
                    </div>
                    {doc.rejectionReason && (
                      <div className='mt-3 p-3 bg-red-50 rounded-md'>
                        <p className='text-sm text-red-800'>
                          <span className='font-medium'>Rejection Reason:</span>{' '}
                          {doc.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <FileText className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p>No documents submitted</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-gray-900'>Performance Metrics</h3>
            {vendor.performance ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <Star className='w-5 h-5 text-yellow-500' />
                    <span className='text-sm font-medium text-gray-900'>Average Rating</span>
                  </div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {vendor.performance.averageRating.toFixed(1)}
                  </p>
                  <p className='text-xs text-gray-500'>{vendor.performance.totalReviews} reviews</p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <ShoppingCart className='w-5 h-5 text-blue-500' />
                    <span className='text-sm font-medium text-gray-900'>Total Orders</span>
                  </div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {vendor.performance.totalOrders.toLocaleString()}
                  </p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <Package className='w-5 h-5 text-green-500' />
                    <span className='text-sm font-medium text-gray-900'>Completion Rate</span>
                  </div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {vendor.performance.completionRate.toFixed(1)}%
                  </p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <Clock className='w-5 h-5 text-purple-500' />
                    <span className='text-sm font-medium text-gray-900'>Response Time</span>
                  </div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {vendor.performance.responseTime}
                  </p>
                  <p className='text-xs text-gray-500'>minutes</p>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='w-5 h-5 rounded-full bg-indigo-500' />
                    <span className='text-sm font-medium text-gray-900'>Total Sales</span>
                  </div>
                  <p className='text-2xl font-bold text-gray-900'>
                    ₦{vendor.performance.totalSales.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <BarChart3 className='w-12 h-12 mx-auto mb-4 opacity-50' />
                <p>No performance data available</p>
              </div>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter className='flex items-center justify-between px-6 py-4 border-t border-gray-200'>
        <div className='flex items-center gap-2'>
          {vendor.status === 'SUSPENDED' && onActivate && (
            <Button
              onClick={() => onActivate(vendor.id)}
              className='bg-green-600 hover:bg-green-700 text-white'
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Reactivate
            </Button>
          )}
          {vendor.status === 'APPROVED' && onSuspend && (
            <Button
              variant='outline'
              onClick={() => onSuspend(vendor.id)}
              className='text-red-600 border-red-300 hover:bg-red-50'
            >
              <Ban className='w-4 h-4 mr-2' />
              Suspend
            </Button>
          )}
          {onContact && (
            <Button variant='outline' onClick={() => onContact(vendor)}>
              <MessageSquare className='w-4 h-4 mr-2' />
              Contact
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {onEdit && (
            <Button variant='outline' onClick={() => onEdit(vendor)}>
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </Button>
          )}
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

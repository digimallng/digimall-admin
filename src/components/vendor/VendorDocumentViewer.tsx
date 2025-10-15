'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Building,
  CreditCard,
  User,
  FileCheck,
  FileX,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

export interface VendorDocument {
  id: string;
  type:
    | 'business_registration'
    | 'tax_certificate'
    | 'bank_statement'
    | 'id_card'
    | 'utility_bill'
    | 'other';
  name: string;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  expiryDate?: Date;
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    checksum?: string;
  };
}

interface VendorDocumentViewerProps {
  documents: VendorDocument[];
  vendorId: string;
  vendorName: string;
  onVerifyDocument: (documentId: string, approved: boolean, reason?: string) => Promise<void>;
  onDownloadDocument: (documentId: string) => void;
  isLoading?: boolean;
  canVerify?: boolean;
}

export function VendorDocumentViewer({
  documents,
  vendorId,
  vendorName,
  onVerifyDocument,
  onDownloadDocument,
  isLoading = false,
  canVerify = true,
}: VendorDocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<VendorDocument | null>(null);
  const [verificationReason, setVerificationReason] = useState('');
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);

  const getDocumentIcon = (type: VendorDocument['type']) => {
    switch (type) {
      case 'business_registration':
        return Building;
      case 'tax_certificate':
        return Shield;
      case 'bank_statement':
        return CreditCard;
      case 'id_card':
        return User;
      case 'utility_bill':
        return FileText;
      default:
        return FileText;
    }
  };

  const getDocumentTypeName = (type: VendorDocument['type']) => {
    switch (type) {
      case 'business_registration':
        return 'Business Registration';
      case 'tax_certificate':
        return 'Tax Certificate';
      case 'bank_statement':
        return 'Bank Statement';
      case 'id_card':
        return 'ID Card';
      case 'utility_bill':
        return 'Utility Bill';
      default:
        return 'Other Document';
    }
  };

  const getStatusIcon = (status: VendorDocument['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'rejected':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'expired':
        return <AlertTriangle className='w-4 h-4 text-orange-500' />;
      case 'pending':
      default:
        return <Clock className='w-4 h-4 text-yellow-500' />;
    }
  };

  const getStatusColor = (status: VendorDocument['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleVerifyDocument = async (documentId: string, approved: boolean) => {
    setVerifyingDocId(documentId);
    try {
      await onVerifyDocument(documentId, approved, verificationReason);
      setVerificationReason('');
      setSelectedDocument(null);
    } finally {
      setVerifyingDocId(null);
    }
  };

  const requiredDocuments = [
    'business_registration',
    'tax_certificate',
    'bank_statement',
    'id_card',
  ];

  const uploadedDocumentTypes = documents.map(d => d.type);
  const missingDocuments = requiredDocuments.filter(
    type => !uploadedDocumentTypes.includes(type as any)
  );

  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Documents</p>
                <p className='text-2xl font-bold'>{documents.length}</p>
              </div>
              <FileText className='w-8 h-8 text-gray-400' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Verified</p>
                <p className='text-2xl font-bold text-green-600'>{verifiedCount}</p>
              </div>
              <FileCheck className='w-8 h-8 text-green-400' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Pending</p>
                <p className='text-2xl font-bold text-yellow-600'>{pendingCount}</p>
              </div>
              <Clock className='w-8 h-8 text-yellow-400' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Rejected</p>
                <p className='text-2xl font-bold text-red-600'>{rejectedCount}</p>
              </div>
              <FileX className='w-8 h-8 text-red-400' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Documents Alert */}
      {missingDocuments.length > 0 && (
        <Card className='border-orange-200 bg-orange-50'>
          <CardContent className='p-4'>
            <div className='flex items-start space-x-3'>
              <AlertTriangle className='w-5 h-5 text-orange-600 mt-0.5' />
              <div>
                <h4 className='font-medium text-orange-900'>Missing Required Documents</h4>
                <p className='text-sm text-orange-700 mt-1'>
                  The following documents are required but not yet uploaded:
                </p>
                <ul className='mt-2 space-y-1'>
                  {missingDocuments.map(type => (
                    <li key={type} className='text-sm text-orange-700 flex items-center space-x-2'>
                      <span className='w-1.5 h-1.5 bg-orange-600 rounded-full' />
                      <span>{getDocumentTypeName(type as VendorDocument['type'])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {documents.map(document => {
          const Icon = getDocumentIcon(document.type);
          const isVerifying = verifyingDocId === document.id;

          return (
            <Card
              key={document.id}
              className={cn(
                'hover:shadow-lg transition-shadow cursor-pointer',
                document.status === 'verified' && 'border-green-200',
                document.status === 'rejected' && 'border-red-200',
                document.status === 'expired' && 'border-orange-200'
              )}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-gray-100 rounded-lg'>
                      <Icon className='w-5 h-5 text-gray-600' />
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>{getDocumentTypeName(document.type)}</h4>
                      <p className='text-xs text-gray-500 mt-0.5'>{document.name}</p>
                    </div>
                  </div>
                  <Badge className={cn('text-xs', getStatusColor(document.status))}>
                    <span className='flex items-center gap-1'>
                      {getStatusIcon(document.status)}
                      {document.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className='space-y-3'>
                <div className='text-xs text-gray-600 space-y-1'>
                  <p>
                    <span className='font-medium'>Uploaded:</span>{' '}
                    {format(new Date(document.uploadedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                  {document.verifiedAt && (
                    <p>
                      <span className='font-medium'>Verified:</span>{' '}
                      {format(new Date(document.verifiedAt), 'MMM dd, yyyy')}
                    </p>
                  )}
                  {document.expiryDate && (
                    <p className={cn(new Date(document.expiryDate) < new Date() && 'text-red-600')}>
                      <span className='font-medium'>Expires:</span>{' '}
                      {format(new Date(document.expiryDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                  {document.rejectionReason && (
                    <p className='text-red-600'>
                      <span className='font-medium'>Reason:</span> {document.rejectionReason}
                    </p>
                  )}
                </div>

                <div className='flex items-center gap-2 pt-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => window.open(document.url, '_blank')}
                    className='flex-1'
                  >
                    <Eye className='w-3 h-3 mr-1' />
                    View
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => onDownloadDocument(document.id)}
                    className='flex-1'
                  >
                    <Download className='w-3 h-3 mr-1' />
                    Download
                  </Button>
                </div>

                {canVerify && document.status === 'pending' && (
                  <div className='flex items-center gap-2 pt-2 border-t'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 text-green-600 border-green-600 hover:bg-green-50'
                      onClick={() => handleVerifyDocument(document.id, true)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                      ) : (
                        <CheckCircle className='w-3 h-3 mr-1' />
                      )}
                      Verify
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 text-red-600 border-red-600 hover:bg-red-50'
                      onClick={() => setSelectedDocument(document)}
                      disabled={isVerifying}
                    >
                      <XCircle className='w-3 h-3 mr-1' />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rejection Modal */}
      {selectedDocument && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Reject Document</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-gray-600'>
                Please provide a reason for rejecting this document:
              </p>
              <textarea
                className='w-full p-3 border rounded-lg resize-none'
                rows={4}
                placeholder='Enter rejection reason...'
                value={verificationReason}
                onChange={e => setVerificationReason(e.target.value)}
              />
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSelectedDocument(null);
                    setVerificationReason('');
                  }}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleVerifyDocument(selectedDocument.id, false)}
                  disabled={!verificationReason.trim() || verifyingDocId === selectedDocument.id}
                  className='flex-1 bg-red-600 hover:bg-red-700 text-white'
                >
                  {verifyingDocId === selectedDocument.id ? (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  ) : null}
                  Reject Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

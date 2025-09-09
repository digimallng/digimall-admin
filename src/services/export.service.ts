import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { CommissionRule, CommissionReport } from '@/types/commission.types';
import { User } from '@/lib/api/types';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
}

export interface AuditLogExportData {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  performedBy?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export class ExportService {
  
  /**
   * Export commission rules to Excel
   */
  static exportCommissionRulesToExcel(
    rules: CommissionRule[], 
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'commission-rules',
      sheetName = 'Commission Rules',
      includeTimestamp = true,
    } = options;

    // Prepare data for export
    const exportData = rules.map(rule => ({
      'Rule ID': rule.id,
      'Rule Name': rule.name,
      'Description': rule.description || '',
      'Type': rule.type,
      'Value': rule.value,
      'Status': rule.status,
      'Is Default': rule.isDefault ? 'Yes' : 'No',
      'Vendor ID': rule.vendorId || '',
      'Category ID': rule.categoryId || '',
      'Min Order Value': rule.minOrderValue || '',
      'Max Order Value': rule.maxOrderValue || '',
      'Valid From': rule.validFrom ? format(new Date(rule.validFrom), 'yyyy-MM-dd') : '',
      'Valid Until': rule.validUntil ? format(new Date(rule.validUntil), 'yyyy-MM-dd') : '',
      'Created At': format(new Date(rule.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Updated At': format(new Date(rule.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    this.exportToExcel(exportData, filename, sheetName, includeTimestamp);
  }

  /**
   * Export commission rules to CSV
   */
  static exportCommissionRulesToCSV(
    rules: CommissionRule[], 
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'commission-rules',
      includeTimestamp = true,
    } = options;

    // Prepare data for export
    const exportData = rules.map(rule => ({
      'Rule ID': rule.id,
      'Rule Name': rule.name,
      'Description': rule.description || '',
      'Type': rule.type,
      'Value': rule.value,
      'Status': rule.status,
      'Is Default': rule.isDefault ? 'Yes' : 'No',
      'Vendor ID': rule.vendorId || '',
      'Category ID': rule.categoryId || '',
      'Min Order Value': rule.minOrderValue || '',
      'Max Order Value': rule.maxOrderValue || '',
      'Valid From': rule.validFrom ? format(new Date(rule.validFrom), 'yyyy-MM-dd') : '',
      'Valid Until': rule.validUntil ? format(new Date(rule.validUntil), 'yyyy-MM-dd') : '',
      'Created At': format(new Date(rule.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Updated At': format(new Date(rule.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    this.exportToCSV(exportData, filename, includeTimestamp);
  }

  /**
   * Export commission report to Excel
   */
  static exportCommissionReportToExcel(
    report: CommissionReport,
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'commission-report',
      includeTimestamp = true,
    } = options;

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    if (report.summary) {
      const summaryData = [
        ['Report Period', report.period ? `${format(new Date(report.period.startDate), 'yyyy-MM-dd')} to ${format(new Date(report.period.endDate), 'yyyy-MM-dd')}` : 'N/A'],
        ['Total Commissions', report.summary.totalCommissions],
        ['Total Order Value', report.summary.totalOrderValue],
        ['Average Commission Rate', `${report.summary.averageCommissionRate}%`],
        ['Order Count', report.summary.orderCount],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Vendor breakdown sheet
    if (report.breakdown?.byVendor) {
      const vendorData = Object.entries(report.breakdown.byVendor).map(([vendorId, data]) => ({
        'Vendor ID': vendorId,
        'Total Commission': data.totalCommission,
        'Total Orders': data.orderCount,
        'Average Order Value': data.averageOrderValue,
        'Commission Rate': `${data.averageCommissionRate}%`,
      }));

      if (vendorData.length > 0) {
        const vendorSheet = XLSX.utils.json_to_sheet(vendorData);
        XLSX.utils.book_append_sheet(workbook, vendorSheet, 'By Vendor');
      }
    }

    // Category breakdown sheet
    if (report.breakdown?.byCategory) {
      const categoryData = Object.entries(report.breakdown.byCategory).map(([categoryId, data]) => ({
        'Category ID': categoryId,
        'Total Commission': data.totalCommission,
        'Total Orders': data.orderCount,
        'Average Order Value': data.averageOrderValue,
        'Commission Rate': `${data.averageCommissionRate}%`,
      }));

      if (categoryData.length > 0) {
        const categorySheet = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'By Category');
      }
    }

    // Time series data sheet
    if (report.timeSeries && report.timeSeries.length > 0) {
      const timeSeriesData = report.timeSeries.map(entry => ({
        'Date': format(new Date(entry.date), 'yyyy-MM-dd'),
        'Total Commission': entry.totalCommission,
        'Order Count': entry.orderCount,
        'Average Order Value': entry.averageOrderValue,
      }));

      const timeSeriesSheet = XLSX.utils.json_to_sheet(timeSeriesData);
      XLSX.utils.book_append_sheet(workbook, timeSeriesSheet, 'Time Series');
    }

    // Generate filename
    const finalFilename = includeTimestamp 
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`
      : `${filename}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, finalFilename);
  }

  /**
   * Export audit logs to Excel
   */
  static exportAuditLogsToExcel(
    auditLogs: AuditLogExportData[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'audit-logs',
      sheetName = 'Audit Logs',
      includeTimestamp = true,
    } = options;

    // Prepare data for export
    const exportData = auditLogs.map(log => ({
      'Log ID': log.id,
      'Action': log.action,
      'Resource': log.resource,
      'Resource ID': log.resourceId || '',
      'User ID': log.userId || '',
      'Performed By': log.performedBy || '',
      'Description': log.description || '',
      'IP Address': log.ipAddress || '',
      'User Agent': log.userAgent ? log.userAgent.substring(0, 100) : '', // Truncate long user agents
      'Created At': format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    this.exportToExcel(exportData, filename, sheetName, includeTimestamp);
  }

  /**
   * Export audit logs to CSV
   */
  static exportAuditLogsToCSV(
    auditLogs: AuditLogExportData[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'audit-logs',
      includeTimestamp = true,
    } = options;

    // Prepare data for export
    const exportData = auditLogs.map(log => ({
      'Log ID': log.id,
      'Action': log.action,
      'Resource': log.resource,
      'Resource ID': log.resourceId || '',
      'User ID': log.userId || '',
      'Performed By': log.performedBy || '',
      'Description': log.description || '',
      'IP Address': log.ipAddress || '',
      'User Agent': log.userAgent ? log.userAgent.substring(0, 100) : '',
      'Created At': format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    this.exportToCSV(exportData, filename, includeTimestamp);
  }

  /**
   * Export users to Excel
   */
  static exportUsersToExcel(
    users: User[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'users',
      sheetName = 'Users',
      includeTimestamp = true,
    } = options;

    // Prepare data for export
    const exportData = users.map(user => ({
      'User ID': user.id,
      'First Name': user.firstName || '',
      'Last Name': user.lastName || '',
      'Full Name': `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      'Email': user.email,
      'Phone': user.phone || user.phoneNumber || '',
      'Role': user.role,
      'Status': user.status,
      'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
      'Phone Verified': user.isPhoneVerified ? 'Yes' : 'No',
      'Date of Birth': user.dateOfBirth || user.profile?.dateOfBirth || '',
      'Gender': user.gender || user.profile?.gender || '',
      'Bio': user.profile?.bio || '',
      'Website': user.profile?.website || '',
      'Timezone': user.profile?.timezone || '',
      'Language': user.profile?.language || '',
      'Currency': user.profile?.currency || '',
      'Street Address': user.profile?.address?.street || '',
      'City': user.profile?.address?.city || '',
      'State': user.profile?.address?.state || '',
      'Postal Code': user.profile?.address?.postalCode || user.profile?.address?.zipCode || '',
      'Country': user.profile?.address?.country || '',
      'Last Login': user.lastLoginAt ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm:ss') : '',
      'Login Count': user.loginCount || 0,
      'Email Notifications': user.preferences?.emailNotifications || user.emailNotifications ? 'Yes' : 'No',
      'SMS Notifications': user.preferences?.smsNotifications || user.smsNotifications ? 'Yes' : 'No',
      'Push Notifications': user.preferences?.pushNotifications || user.pushNotifications ? 'Yes' : 'No',
      'Created At': user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
      'Updated At': user.updatedAt ? format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
    }));

    this.exportToExcel(exportData, filename, sheetName, includeTimestamp);
  }

  /**
   * Export users to CSV
   */
  static exportUsersToCSV(
    users: User[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'users',
      includeTimestamp = true,
    } = options;

    // Prepare data for export
    const exportData = users.map(user => ({
      'User ID': user.id,
      'First Name': user.firstName || '',
      'Last Name': user.lastName || '',
      'Full Name': `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      'Email': user.email,
      'Phone': user.phone || user.phoneNumber || '',
      'Role': user.role,
      'Status': user.status,
      'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
      'Phone Verified': user.isPhoneVerified ? 'Yes' : 'No',
      'Date of Birth': user.dateOfBirth || user.profile?.dateOfBirth || '',
      'Gender': user.gender || user.profile?.gender || '',
      'Bio': user.profile?.bio || '',
      'Website': user.profile?.website || '',
      'Timezone': user.profile?.timezone || '',
      'Language': user.profile?.language || '',
      'Currency': user.profile?.currency || '',
      'Street Address': user.profile?.address?.street || '',
      'City': user.profile?.address?.city || '',
      'State': user.profile?.address?.state || '',
      'Postal Code': user.profile?.address?.postalCode || user.profile?.address?.zipCode || '',
      'Country': user.profile?.address?.country || '',
      'Last Login': user.lastLoginAt ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm:ss') : '',
      'Login Count': user.loginCount || 0,
      'Email Notifications': user.preferences?.emailNotifications || user.emailNotifications ? 'Yes' : 'No',
      'SMS Notifications': user.preferences?.smsNotifications || user.smsNotifications ? 'Yes' : 'No',
      'Push Notifications': user.preferences?.pushNotifications || user.pushNotifications ? 'Yes' : 'No',
      'Created At': user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
      'Updated At': user.updatedAt ? format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
    }));

    this.exportToCSV(exportData, filename, includeTimestamp);
  }

  /**
   * Export products to Excel
   */
  static exportProductsToExcel(
    products: any[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'products',
      sheetName = 'Products',
      includeTimestamp = true,
    } = options;

    const exportData = products.map(product => ({
      'Product ID': product.id,
      'Product Name': product.name,
      'SKU': product.sku || '',
      'Vendor': product.vendor?.businessName || '',
      'Category': product.category?.name || '',
      'Price': product.price,
      'Stock Quantity': product.trackInventory ? product.stockQuantity : 'Unlimited',
      'Status': product.status,
      'Is Featured': product.isFeatured ? 'Yes' : 'No',
      'View Count': product.viewCount || 0,
      'Sold Quantity': product.soldQuantity || 0,
      'Created At': format(new Date(product.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    this.exportToExcel(exportData, filename, sheetName, includeTimestamp);
  }

  /**
   * Export products to CSV
   */
  static exportProductsToCSV(
    products: any[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'products',
      includeTimestamp = true,
    } = options;

    const exportData = products.map(product => ({
      'Product ID': product.id,
      'Product Name': product.name,
      'SKU': product.sku || '',
      'Vendor': product.vendor?.businessName || '',
      'Category': product.category?.name || '',
      'Price': product.price,
      'Stock Quantity': product.trackInventory ? product.stockQuantity : 'Unlimited',
      'Status': product.status,
      'Is Featured': product.isFeatured ? 'Yes' : 'No',
      'View Count': product.viewCount || 0,
      'Sold Quantity': product.soldQuantity || 0,
      'Created At': format(new Date(product.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    }));

    this.exportToCSV(exportData, filename, includeTimestamp);
  }

  /**
   * Export orders to Excel
   */
  static exportOrdersToExcel(
    orders: any[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'orders',
      sheetName = 'Orders',
      includeTimestamp = true,
    } = options;

    const exportData = orders.map(order => ({
      'Order ID': order.id,
      'Order Number': order.orderNumber || '',
      'Customer': order.customer?.name || '',
      'Customer Email': order.customer?.email || '',
      'Vendor': order.vendor?.businessName || '',
      'Status': order.status,
      'Payment Status': order.paymentStatus || '',
      'Total Amount': order.totalAmount,
      'Currency': order.currency || 'NGN',
      'Items Count': order.items?.length || 0,
      'Shipping Address': order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : '',
      'Order Date': format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Delivery Date': order.deliveryDate ? format(new Date(order.deliveryDate), 'yyyy-MM-dd HH:mm:ss') : '',
    }));

    this.exportToExcel(exportData, filename, sheetName, includeTimestamp);
  }

  /**
   * Export orders to CSV
   */
  static exportOrdersToCSV(
    orders: any[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'orders',
      includeTimestamp = true,
    } = options;

    const exportData = orders.map(order => ({
      'Order ID': order.id,
      'Order Number': order.orderNumber || '',
      'Customer': order.customer?.name || '',
      'Customer Email': order.customer?.email || '',
      'Vendor': order.vendor?.businessName || '',
      'Status': order.status,
      'Payment Status': order.paymentStatus || '',
      'Total Amount': order.totalAmount,
      'Currency': order.currency || 'NGN',
      'Items Count': order.items?.length || 0,
      'Shipping Address': order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : '',
      'Order Date': format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Delivery Date': order.deliveryDate ? format(new Date(order.deliveryDate), 'yyyy-MM-dd HH:mm:ss') : '',
    }));

    this.exportToCSV(exportData, filename, includeTimestamp);
  }

  /**
   * Export vendors to Excel
   */
  static exportVendorsToExcel(
    vendors: any[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'vendors',
      sheetName = 'Vendors',
      includeTimestamp = true,
    } = options;

    const exportData = vendors.map(vendor => ({
      'Vendor ID': vendor.id,
      'Business Name': vendor.businessName,
      'Contact Name': `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim(),
      'Email': vendor.email,
      'Phone': vendor.phone || '',
      'Status': vendor.status,
      'Verification Status': vendor.verificationStatus || '',
      'Business Type': vendor.businessType || '',
      'Registration Number': vendor.registrationNumber || '',
      'Tax ID': vendor.taxId || '',
      'Address': vendor.address ? `${vendor.address.street}, ${vendor.address.city}` : '',
      'Country': vendor.address?.country || '',
      'Total Products': vendor.totalProducts || 0,
      'Total Sales': vendor.totalSales || 0,
      'Rating': vendor.rating || 0,
      'Commission Rate': vendor.commissionRate || 0,
      'Joined Date': format(new Date(vendor.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Last Active': vendor.lastActive ? format(new Date(vendor.lastActive), 'yyyy-MM-dd HH:mm:ss') : '',
    }));

    this.exportToExcel(exportData, filename, sheetName, includeTimestamp);
  }

  /**
   * Export vendors to CSV
   */
  static exportVendorsToCSV(
    vendors: any[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'vendors',
      includeTimestamp = true,
    } = options;

    const exportData = vendors.map(vendor => ({
      'Vendor ID': vendor.id,
      'Business Name': vendor.businessName,
      'Contact Name': `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim(),
      'Email': vendor.email,
      'Phone': vendor.phone || '',
      'Status': vendor.status,
      'Verification Status': vendor.verificationStatus || '',
      'Business Type': vendor.businessType || '',
      'Registration Number': vendor.registrationNumber || '',
      'Tax ID': vendor.taxId || '',
      'Address': vendor.address ? `${vendor.address.street}, ${vendor.address.city}` : '',
      'Country': vendor.address?.country || '',
      'Total Products': vendor.totalProducts || 0,
      'Total Sales': vendor.totalSales || 0,
      'Rating': vendor.rating || 0,
      'Commission Rate': vendor.commissionRate || 0,
      'Joined Date': format(new Date(vendor.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Last Active': vendor.lastActive ? format(new Date(vendor.lastActive), 'yyyy-MM-dd HH:mm:ss') : '',
    }));

    this.exportToCSV(exportData, filename, includeTimestamp);
  }

  /**
   * Generic Excel export utility
   */
  private static exportToExcel(
    data: any[],
    filename: string,
    sheetName: string = 'Sheet1',
    includeTimestamp: boolean = true
  ): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const colWidths = this.calculateColumnWidths(data);
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename
    const finalFilename = includeTimestamp 
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`
      : `${filename}.xlsx`;

    // Export file
    XLSX.writeFile(workbook, finalFilename);
  }

  /**
   * Generic CSV export utility
   */
  private static exportToCSV(
    data: any[],
    filename: string,
    includeTimestamp: boolean = true
  ): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Convert data to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quote
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Generate filename
    const finalFilename = includeTimestamp 
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
      : `${filename}.csv`;
    
    saveAs(blob, finalFilename);
  }

  /**
   * Calculate optimal column widths for Excel export
   */
  private static calculateColumnWidths(data: any[]): any[] {
    if (!data || data.length === 0) return [];

    const headers = Object.keys(data[0]);
    const colWidths = headers.map(header => {
      // Get max width for this column
      const headerWidth = header.length;
      const maxDataWidth = Math.max(
        ...data.map(row => {
          const value = String(row[header] || '');
          return value.length;
        })
      );
      
      // Set width (max 50 characters)
      const width = Math.min(Math.max(headerWidth, maxDataWidth) + 2, 50);
      return { width };
    });

    return colWidths;
  }

  /**
   * Export data in specified format
   */
  static exportData(
    data: any[],
    format: 'excel' | 'csv',
    filename: string,
    options: ExportOptions = {}
  ): void {
    if (format === 'excel') {
      this.exportToExcel(data, filename, options.sheetName, options.includeTimestamp);
    } else if (format === 'csv') {
      this.exportToCSV(data, filename, options.includeTimestamp);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Show export confirmation dialog
   */
  static confirmExport(
    recordCount: number,
    format: 'excel' | 'csv',
    callback: () => void
  ): void {
    const formatName = format.toUpperCase();
    const message = `Export ${recordCount} records to ${formatName}?`;
    
    if (confirm(message)) {
      callback();
    }
  }
}
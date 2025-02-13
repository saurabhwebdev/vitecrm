import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, PencilSimple, Trash, Printer, CaretLeft, CaretRight } from 'phosphor-react';
import { collection, query, orderBy, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';
import AddInvoiceModal from './AddInvoiceModal';

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [settings, setSettings] = useState(null);
  const [clinicId, setClinicId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get clinicId from user document
  useEffect(() => {
    const getClinicId = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        return;
      }

      try {
        // Get user's document from users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.error('User document not found');
          showToast.error('User information not found');
          return;
        }

        const userData = userDoc.data();
        const userClinicId = userData.clinicId;
        
        if (!userClinicId) {
          console.error('No clinic ID found in user document');
          showToast.error('Clinic information not found');
          return;
        }

        console.log('Found clinic ID for invoices list:', userClinicId);
        setClinicId(userClinicId);

        // Load clinic settings
        const settingsDoc = await getDoc(doc(db, 'settings', userClinicId));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        } else {
          console.error('Settings not found for clinic');
          showToast.error('Clinic settings not found');
        }

      } catch (error) {
        console.error('Error getting clinic ID:', error);
        showToast.error('Failed to get clinic information');
      }
    };
    
    getClinicId();
  }, []);

  // Format currency based on settings
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    
    if (!settings?.currency) return `$${Number(amount).toFixed(2)}`;

    const currencySymbol = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹'
    }[settings.currency] || '$';

    return `${currencySymbol}${Number(amount).toFixed(2)}`;
  };

  // Get invoices with realtime updates
  const invoicesQuery = clinicId ? query(
    collection(db, 'invoices'),
    where('clinicId', '==', clinicId),
    orderBy('createdAt', 'desc')
  ) : null;

  const [invoicesSnapshot, loading, error] = useCollection(invoicesQuery);

  const invoices = invoicesSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) || [];

  console.log('Loaded invoices:', invoices); // Debug log

  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = invoice.patientName?.toLowerCase().includes(searchLower) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
      invoice.status?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = async (invoiceId) => {
    if (!invoiceId) {
      showToast.error('Cannot delete invoice: Invalid invoice ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const invoiceRef = doc(db, 'invoices', invoiceId);
        await deleteDoc(invoiceRef);
        showToast.success('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        showToast.error('Failed to delete invoice');
      }
    }
  };

  const handlePrint = async (invoice) => {
    try {
      // Get clinic settings
      if (!clinicId) {
        showToast.error('Clinic information not available');
        return;
      }

      const settingsDoc = await getDoc(doc(db, 'settings', clinicId));
      const settings = settingsDoc.data();

      if (!settings) {
        showToast.error('Clinic settings not found');
        return;
      }

      // Create print content
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        showToast.error('Please allow pop-ups to print invoices');
        return;
      }

      const currencySymbol = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹'
      }[settings.currency] || '$';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${invoice.patientName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .clinic-details {
              font-size: 14px;
              margin: 5px 0;
            }
            .invoice-details {
              margin: 20px 0;
            }
            .patient-info {
              margin-bottom: 20px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .items-table th {
              background-color: #f8f9fa;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .totals div {
              margin: 5px 0;
            }
            .footer {
              margin-top: 50px;
              text-align: right;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 200px;
              margin-left: auto;
              padding-top: 5px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="clinic-name">${settings.clinicName || 'Medical Clinic'}</h1>
            <p class="clinic-details">${settings.address || ''}</p>
            <p class="clinic-details">Phone: ${settings.phone || ''}</p>
            <p class="clinic-details">Email: ${settings.email || ''}</p>
            ${settings.timezone ? `<p class="clinic-details">Timezone: ${settings.timezone}</p>` : ''}
            ${settings.currency ? `<p class="clinic-details">Currency: ${settings.currency}</p>` : ''}
          </div>

          <div class="invoice-details">
            <div class="patient-info">
              <h2>Invoice</h2>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p><strong>Patient Name:</strong> ${invoice.patientName}</p>
              <p><strong>Status:</strong> ${invoice.status}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${currencySymbol}${item.price.toFixed(2)}</td>
                    <td>${currencySymbol}${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div><strong>Subtotal:</strong> ${currencySymbol}${invoice.subtotal.toFixed(2)}</div>
              ${invoice.discount > 0 ? `
                <div style="color: #DC2626;">
                  <strong>Discount ${invoice.discountType === 'percentage' ? `(${invoice.discount}%)` : ''}:</strong> 
                  -${currencySymbol}${invoice.discount.toFixed(2)}
                </div>
              ` : ''}
              <div><strong>Tax (${invoice.taxRate}%):</strong> ${currencySymbol}${invoice.tax.toFixed(2)}</div>
              <div style="font-size: 1.1em; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
                <strong>Total:</strong> ${currencySymbol}${invoice.total.toFixed(2)}
              </div>
            </div>

            ${invoice.notes ? `
              <div class="notes">
                <h3>Notes:</h3>
                <p>${invoice.notes}</p>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <div class="signature-line">
              Authorized Signature
            </div>
          </div>

          <button class="no-print" onclick="window.print(); window.close();" 
                  style="position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Invoice
          </button>
        </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error('Error printing invoice:', error);
      showToast.error('Failed to print invoice');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Skeleton loading component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(endIndex, filteredInvoices.length)}
              </span>{' '}
              of <span className="font-medium">{filteredInvoices.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } border border-gray-300`}
              >
                <span className="sr-only">Previous</span>
                <CaretLeft className="h-5 w-5" />
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      isCurrentPage
                        ? 'z-10 bg-primary-600 text-white focus:z-20'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } border border-gray-300`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } border border-gray-300`}
              >
                <span className="sr-only">Next</span>
                <CaretRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    console.error('Error loading invoices:', error);
    showToast.error('Failed to load invoices');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage patient invoices and payments
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoices List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Skeleton loading animation
                [...Array(5)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    {searchQuery || filterStatus !== 'all'
                      ? 'No invoices found matching your search criteria'
                      : 'No invoices created yet'}
                  </td>
                </tr>
              ) : (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Total: {formatCurrency(invoice.total || 0)}
                      </div>
                      {invoice.discount > 0 && (
                        <div className="text-xs text-red-600">
                          Discount: -{formatCurrency(invoice.discount || 0)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Tax: {formatCurrency(invoice.tax || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        invoice.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : invoice.status === 'Cancelled'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePrint(invoice)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                        title="Print invoice"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                        title="Edit invoice"
                      >
                        <PencilSimple className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete invoice"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pagination component */}
      <Pagination />

      {/* Add/Edit Invoice Modal */}
      <AddInvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Invoices; 
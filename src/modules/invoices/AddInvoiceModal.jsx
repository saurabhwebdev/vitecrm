import React, { useEffect, useState } from 'react';
import { X, Plus, Trash } from 'phosphor-react';
import { doc, collection, addDoc, updateDoc, query, getDocs, where, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';

const AddInvoiceModal = ({ isOpen, onClose, invoice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [settings, setSettings] = useState(null);
  const [clinicId, setClinicId] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAddress: '',
    invoiceNumber: '',
    items: [
      {
        name: '',
        description: '',
        quantity: 1,
        price: 0,
      }
    ],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    taxRate: 0,
    discount: 0,
    discountType: 'percentage',
    notes: '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    // Get clinicId from user document
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

        console.log('Found clinic ID for invoice:', userClinicId);
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
    
    if (isOpen) {
      getClinicId();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load patients when modal opens and clinicId is available
    const loadData = async () => {
      if (!clinicId) {
        console.log('No clinic ID available yet');
        return;
      }

      try {
        console.log('Loading patients for clinic:', clinicId);
        // Load patients filtered by clinicId
        const patientsQuery = query(
          collection(db, 'patients'),
          where('clinicId', '==', clinicId)
        );
        const snapshot = await getDocs(patientsQuery);
        const patientsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Loaded patients:', patientsList);
        setPatients(patientsList);

        if (patientsList.length === 0) {
          showToast.info('No patients found. Please add patients first.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showToast.error('Failed to load necessary data');
      }
    };

    if (isOpen && clinicId) {
      loadData();
    }
  }, [isOpen, clinicId]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        patientAddress: invoice.patientAddress || '',
        invoiceNumber: invoice.invoiceNumber,
        items: invoice.items || [
          {
            name: '',
            description: '',
            quantity: 1,
            price: 0,
          }
        ],
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        taxRate: invoice.taxRate || 0,
        discount: invoice.discount || 0,
        discountType: invoice.discountType || 'percentage',
        notes: invoice.notes || '',
        status: invoice.status,
        createdAt: invoice.createdAt || new Date().toISOString(),
      });
    } else {
      // Generate a new invoice number (you might want to implement a more sophisticated system)
      const newInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      setFormData({
        patientId: '',
        patientName: '',
        patientAddress: '',
        invoiceNumber: newInvoiceNumber,
        items: [
          {
            name: '',
            description: '',
            quantity: 1,
            price: 0,
          }
        ],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: 0,
        discount: 0,
        discountType: 'percentage',
        notes: '',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });
    }
  }, [invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    const selectedPatient = patients.find(p => p.id === patientId);
    
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientAddress: selectedPatient.address || ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
      };
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: '',
          description: '',
          quantity: 1,
          price: 0,
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      showToast.error('Cannot remove the last item');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'percentage') {
      return (subtotal * formData.discount) / 100;
    }
    return Number(formData.discount) || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const formatCurrency = (amount) => {
    if (!settings?.currency) return `$${amount.toFixed(2)}`;

    const currencySymbol = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹'
    }[settings.currency] || '$';

    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!clinicId) {
        showToast.error('Clinic information not available');
        return;
      }

      // Validate required fields
      if (!formData.patientId || !formData.invoiceNumber || !formData.dueDate) {
        throw new Error('Please fill in all required fields');
      }

      // Validate items
      if (!formData.items.length) {
        throw new Error('Please add at least one item');
      }

      for (const item of formData.items) {
        if (!item.name || item.quantity <= 0 || item.price <= 0) {
          throw new Error('Please fill in all item details correctly');
        }
      }

      const subtotal = calculateSubtotal();
      const discount = calculateDiscount();
      const tax = calculateTax();
      const total = calculateTotal();

      const invoiceData = {
        ...formData,
        clinicId,
        subtotal,
        discount,
        tax,
        total,
        currency: settings?.currency || 'USD',
        createdAt: invoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (invoice) {
        // Update existing invoice
        const invoiceRef = doc(db, 'invoices', invoice.id);
        await updateDoc(invoiceRef, invoiceData);
        showToast.success('Invoice updated successfully');
      } else {
        // Create new invoice
        await addDoc(collection(db, 'invoices'), invoiceData);
        showToast.success('Invoice created successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      showToast.error(error.message || 'Failed to save invoice');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-3xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">
              {invoice ? 'Edit Invoice' : 'New Invoice'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Invoice Number"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  required
                  disabled
                />

                <Input
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Items
                  </label>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-2"
                    >
                      <div className="space-y-4">
                        <Input
                          label="Item Name"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          required
                        />
                        <Input
                          label="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="space-y-4">
                        <Input
                          label="Quantity"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                        <Input
                          label="Price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end md:col-span-2">
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount and Tax */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <Input
                    label={`Discount ${formData.discountType === 'percentage' ? '(%)' : ''}`}
                    name="discount"
                    type="number"
                    min="0"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    step="any"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder={formData.discountType === 'percentage' ? "Enter discount percentage" : "Enter discount amount"}
                  />
                </div>

                <div>
                  <Input
                    label="Tax Rate (%)"
                    name="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={formData.taxRate}
                    onChange={handleChange}
                    placeholder="Enter tax rate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mt-4">
                <div className="text-sm text-gray-600">Subtotal:</div>
                <div className="text-sm font-medium text-right">{formatCurrency(calculateSubtotal())}</div>
                
                <div className="text-sm text-gray-600">Discount:</div>
                <div className="text-sm font-medium text-right text-red-600">-{formatCurrency(calculateDiscount())}</div>
                
                <div className="text-sm text-gray-600">Tax ({formData.taxRate}%):</div>
                <div className="text-sm font-medium text-right">{formatCurrency(calculateTax())}</div>
                
                <div className="text-base font-medium text-gray-600">Total:</div>
                <div className="text-base font-medium text-right">{formatCurrency(calculateTotal())}</div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceModal; 
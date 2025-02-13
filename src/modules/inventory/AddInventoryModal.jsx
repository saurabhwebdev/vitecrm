import React, { useState, useEffect } from 'react';
import { X } from 'phosphor-react';
import { doc, collection, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';

const AddInventoryModal = ({ isOpen, onClose, item }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({ currency: 'USD' });
  const [clinicId, setClinicId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    maxQuantity: 0,
    price: 0,
    costPrice: 0,
    supplier: '',
    location: '',
    notes: '',
    lastRestocked: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

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

        console.log('Found clinic ID for inventory item:', userClinicId);
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
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        unit: item.unit || '',
        minQuantity: item.minQuantity || 0,
        maxQuantity: item.maxQuantity || 0,
        price: item.price || 0,
        costPrice: item.costPrice || 0,
        supplier: item.supplier || '',
        location: item.location || '',
        notes: item.notes || '',
        lastRestocked: item.lastRestocked || new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        quantity: 0,
        unit: '',
        minQuantity: 0,
        maxQuantity: 0,
        price: 0,
        costPrice: 0,
        supplier: '',
        location: '',
        notes: '',
        lastRestocked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('rice') || name.includes('quantity')
        ? parseFloat(value) || 0
        : value
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      throw new Error('Item name is required');
    }
    if (!formData.category) {
      throw new Error('Category is required');
    }
    if (!formData.unit) {
      throw new Error('Unit of measurement is required');
    }
    if (formData.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    if (formData.minQuantity < 0) {
      throw new Error('Minimum quantity cannot be negative');
    }
    if (formData.maxQuantity <= formData.minQuantity) {
      throw new Error('Maximum quantity must be greater than minimum quantity');
    }
    if (formData.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (formData.costPrice < 0) {
      throw new Error('Cost price cannot be negative');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!clinicId) {
        showToast.error('Clinic information not available');
        return;
      }

      validateForm();

      const itemData = {
        ...formData,
        clinicId,
        updatedAt: new Date().toISOString(),
      };

      if (item) {
        // Update existing item
        const itemRef = doc(db, 'inventory', item.id);
        await updateDoc(itemRef, itemData);
        showToast.success('Item updated successfully');
      } else {
        // Create new item
        await addDoc(collection(db, 'inventory'), itemData);
        showToast.success('Item added successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      showToast.error(error.message || 'Failed to save item');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">
              {item ? 'Edit Item' : 'Add New Item'}
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
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Item Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter item name"
                />
                <Input
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="Enter category (e.g., Medicines, Supplies)"
                />
              </div>

              <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                placeholder="Enter item description"
              />

              {/* Stock Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  placeholder="Enter current quantity"
                />
                <Input
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  placeholder="e.g., pcs, boxes, bottles"
                />
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter storage location"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Minimum Quantity"
                  name="minQuantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  required
                  placeholder="Enter minimum stock level"
                />
                <Input
                  label="Maximum Quantity"
                  name="maxQuantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.maxQuantity}
                  onChange={handleChange}
                  required
                  placeholder="Enter maximum stock level"
                />
              </div>

              {/* Pricing Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label={`Selling Price (${settings.currency || 'USD'})`}
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="Enter selling price"
                />
                <Input
                  label={`Cost Price (${settings.currency || 'USD'})`}
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                  placeholder="Enter cost price"
                />
              </div>

              {/* Supplier Information */}
              <Input
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Enter supplier name or contact"
              />

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
                  placeholder="Add any additional notes about the item..."
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
                {isLoading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryModal; 
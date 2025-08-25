import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, User, Mail, Phone, Building, MapPin, Target, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(id ? true : false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const isEditMode = Boolean(id);

  // Source and status options
  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'facebook_ads', label: 'Facebook Ads' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'referral', label: 'Referral' },
    { value: 'events', label: 'Events' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
    { value: 'won', label: 'Won' }
  ];

  // Fetch lead data for editing
  useEffect(() => {
    if (isEditMode) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`/api/leads/${id}`);
      const lead = response.data.lead;
      
      // Set form values
      Object.keys(lead).forEach(key => {
        if (key !== '_id' && key !== 'created_by' && key !== 'created_at' && key !== 'updated_at') {
          setValue(key, lead[key]);
        }
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to fetch lead data');
      navigate('/dashboard');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
      ...data,
      is_qualified: !!data.is_qualified // convert to true/false
    };
      if (isEditMode) {
        await axios.put(`/api/leads/${id}`, data);
        toast.success('Lead updated successfully');
      } else {
        await axios.post('/api/leads', data);
        toast.success('Lead created successfully');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving lead:', error);
      const message = error.response?.data?.message || 'Failed to save lead';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Lead' : 'Add New Lead'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update lead information' : 'Create a new lead in your system'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                First Name *
              </label>
              <input
                type="text"
                {...register('first_name', { required: 'First name is required' })}
                className="input"
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Last Name *
              </label>
              <input
                type="text"
                {...register('last_name', { required: 'Last name is required' })}
                className="input"
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="input"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Company & Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                Company
              </label>
              <input
                type="text"
                {...register('company')}
                className="input"
                placeholder="Enter company name"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                City
              </label>
              <input
                type="text"
                {...register('city')}
                className="input"
                placeholder="Enter city"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                State
              </label>
              <input
                type="text"
                {...register('state')}
                className="input"
                placeholder="Enter state"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Lead Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline h-4 w-4 mr-1" />
                Source *
              </label>
              <select
                {...register('source', { required: 'Source is required' })}
                className="select"
              >
                <option value="">Select source</option>
                {sourceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Status
              </label>
              <select
                {...register('status')}
                className="select"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Score (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register('score', { 
                  min: { value: 0, message: 'Score must be at least 0' },
                  max: { value: 100, message: 'Score cannot exceed 100' }
                })}
                className="input"
                placeholder="Enter score"
              />
              {errors.score && (
                <p className="mt-1 text-sm text-red-600">{errors.score.message}</p>
              )}
            </div>

            {/* Lead Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Lead Value
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('lead_value', { 
                  min: { value: 0, message: 'Lead value cannot be negative' }
                })}
                className="input"
                placeholder="Enter lead value"
              />
              {errors.lead_value && (
                <p className="mt-1 text-sm text-red-600">{errors.lead_value.message}</p>
              )}
            </div>

            {/* Last Activity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Last Activity Date
              </label>
              <input
                type="datetime-local"
                {...register('last_activity_at')}
                className="input"
              />
            </div>

            {/* Is Qualified */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_qualified"
                {...register('is_qualified')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_qualified" className="text-sm font-medium text-gray-700">
                Mark as qualified
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditMode ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';

// Configure axios with backend base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://leadmanagementsystem-production.up.railway.app',
  withCredentials: true,
  timeout: 10000,
});

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'full_name',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <div className="flex flex-col">
          <span className="font-medium">{params.value}</span>
          <span className="text-sm text-gray-500">{params.data.email}</span>
        </div>
      )
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Phone',
      field: 'phone',
      sortable: true,
      filter: true,
      width: 130
    },
    {
      headerName: 'Location',
      field: 'location',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const city = params.data.city || '';
        const state = params.data.state || '';
        return city && state ? `${city}, ${state}` : city || state || '-';
      },
      width: 150
    },
    {
      headerName: 'Source',
      field: 'source',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <span className="capitalize">{params.value?.replace('_', ' ')}</span>
      ),
      width: 120
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <span className={`status-${params.value}`}>
          {params.value?.charAt(0).toUpperCase() + params.value?.slice(1)}
        </span>
      ),
      width: 120
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <div className="flex items-center">
          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-primary-600 h-2 rounded-full" 
              style={{ width: `${params.value}%` }}
            ></div>
          </div>
          <span className="text-sm">{params.value}%</span>
        </div>
      ),
      width: 100
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <span className="font-medium">${params.value?.toLocaleString()}</span>
      ),
      width: 100
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {params.value ? 'Yes' : 'No'}
        </span>
      ),
      width: 100
    },
    {
      headerName: 'Created',
      field: 'created_at',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const rawValue = params.value;
        if (!rawValue) {
          return <span className="text-sm text-gray-600">-</span>;
        }
        const parsedDate = typeof rawValue === 'string' ? parseISO(rawValue) : new Date(rawValue);
        const display = isValid(parsedDate) ? format(parsedDate, 'MMM dd, yyyy') : '-';
        return <span className="text-sm text-gray-600">{display}</span>;
      },
      width: 120
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(params.data)}
            className="p-1 text-primary-600 hover:text-primary-800"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(params.data)}
            className="p-1 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(params.data)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      width: 100
    }
  ], []);

  // AG Grid default column definitions
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    suppressHeaderMenuButton: true
  }), []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) })
      });

      const response = await api.get(`/api/leads?${params}`);
      setLeads(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle search
  /* const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setFilters(prev => ({
        ...prev,
        email: { contains: searchTerm },
        first_name: { contains: searchTerm },
        last_name: { contains: searchTerm },
        company: { contains: searchTerm }
      }));
    } else {
      setFilters({});
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }; */
  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (term) {
      setFilters({
        $or: [
          { email: { $regex: term, $options: 'i' } },
          { first_name: { $regex: term, $options: 'i' } },
          { last_name: { $regex: term, $options: 'i' } },
          { company: { $regex: term, $options: 'i' } }
        ]
      });
    } else {
      setFilters({});
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };


  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle actions
  const handleView = (lead) => {
    // Implement view functionality
    toast.info('View functionality coming soon');
  };

  const handleEdit = (lead) => {
    navigate(`/leads/${lead._id}/edit`);
  };

  const handleDelete = async (lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.first_name} ${lead.last_name}?`)) {
      try {
        await api.delete(`/api/leads/${lead._id}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage your leads and track their progress</p>
        </div>
        <button
          onClick={() => navigate('/leads/new')}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Qualified</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads?.filter(lead => lead.is_qualified)?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads?.filter(lead => lead.status === 'new')?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${leads?.reduce((sum, lead) => sum + (lead.lead_value || 0), 0)?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn-secondary">
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
          <button type="button" className="btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </form>
      </div>

      {/* AG Grid */}
      <div className="card">
        <div className="ag-theme-alpine w-full h-96">
          <AgGridReact
            rowData={leads || []}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={false}
            paginationPageSize={pagination.limit}
            domLayout="autoHeight"
            suppressRowClickSelection={true}
            suppressCellFocus={true}
            loading={loading}
          />
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


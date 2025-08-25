const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Helper function to build filter query
const buildFilterQuery = (filters) => {
  const query = {};
  
  if (!filters) return query;

  // Support passthrough of $or for flexible search (e.g., regex across fields)
  if (Array.isArray(filters.$or) && filters.$or.length > 0) {
    query.$or = filters.$or;
  }

  // String fields with contains/equals
  ['email', 'company', 'city', 'state', 'first_name', 'last_name'].forEach(field => {
    if (filters[field]) {
      if (filters[field].contains) {
        query[field] = { $regex: filters[field].contains, $options: 'i' };
      } else if (filters[field].equals) {
        query[field] = filters[field].equals;
      }
    }
  });

  // Enum fields with equals/in
  ['status', 'source'].forEach(field => {
    if (filters[field]) {
      if (filters[field].in && Array.isArray(filters[field].in)) {
        query[field] = { $in: filters[field].in };
      } else if (filters[field].equals) {
        query[field] = filters[field].equals;
      }
    }
  });

  // Number fields with equals/gt/lt/between
  ['score', 'lead_value'].forEach(field => {
    if (filters[field]) {
      if (filters[field].between && Array.isArray(filters[field].between) && filters[field].between.length === 2) {
        query[field] = { $gte: filters[field].between[0], $lte: filters[field].between[1] };
      } else if (filters[field].gt !== undefined) {
        query[field] = { $gt: filters[field].gt };
      } else if (filters[field].lt !== undefined) {
        query[field] = { $lt: filters[field].lt };
      } else if (filters[field].equals !== undefined) {
        query[field] = filters[field].equals;
      }
    }
  });

  // Date fields with on/before/after/between
  ['created_at', 'last_activity_at'].forEach(field => {
    if (filters[field]) {
      if (filters[field].between && Array.isArray(filters[field].between) && filters[field].between.length === 2) {
        query[field] = { $gte: new Date(filters[field].between[0]), $lte: new Date(filters[field].between[1]) };
      } else if (filters[field].before) {
        query[field] = { $lt: new Date(filters[field].before) };
      } else if (filters[field].after) {
        query[field] = { $gt: new Date(filters[field].after) };
      } else if (filters[field].on) {
        const date = new Date(filters[field].on);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        query[field] = { $gte: date, $lt: nextDay };
      }
    }
  });

  // Boolean field
  if (filters.is_qualified !== undefined) {
    query.is_qualified = filters.is_qualified;
  }

  return query;
};

// Create lead
router.post('/', [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']).withMessage('Invalid source'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('lead_value').optional().isFloat({ min: 0 }).withMessage('Lead value must be a positive number'),
  body('is_qualified').optional().isBoolean().withMessage('is_qualified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const leadData = {
      ...req.body,
      created_by: req.user._id
    };

    const lead = new Lead(leadData);
    await lead.save();

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error creating lead' });
  }
});

// Get leads with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'created_at';
    const order = req.query.order === 'asc' ? 1 : -1;
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

    // Build filter query
    const filterQuery = buildFilterQuery(filters);
    filterQuery.created_by = req.user._id; // Only show user's leads

    // Build sort object
    const sortObject = {};
    sortObject[sort] = order;

    // Execute queries
    const [leads, total] = await Promise.all([
      Lead.find(filterQuery)
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .populate('created_by', 'firstName lastName email'),
      Lead.countDocuments(filterQuery)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: leads,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      created_by: req.user._id
    }).populate('created_by', 'firstName lastName email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ lead });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error fetching lead' });
  }
});

// Update lead
router.put('/:id', [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('source').optional().isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']).withMessage('Invalid source'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('lead_value').optional().isFloat({ min: 0 }).withMessage('Lead value must be a positive number'),
  body('is_qualified').optional().isBoolean().withMessage('is_qualified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Update lead
    Object.assign(lead, req.body);
    await lead.save();

    res.status(200).json({
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error updating lead' });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user._id
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error deleting lead' });
  }
});

module.exports = router;


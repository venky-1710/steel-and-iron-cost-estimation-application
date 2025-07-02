import React from 'react';
import { Calendar, User, Phone, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import './EstimateCard.css';

const EstimateCard = ({ 
  estimate, 
  onView, 
  onEdit, 
  onDelete, 
  onAccept, 
  onReject, 
  onConvertToInvoice,
  userRole = 'customer',
  showActions = true 
}) => {
  const getStatusIcon = () => {
    switch (estimate.status) {
      case 'accepted':
        return <CheckCircle className="status-icon success" />;
      case 'rejected':
        return <XCircle className="status-icon danger" />;
      case 'expired':
        return <AlertCircle className="status-icon warning" />;
      case 'converted':
        return <FileText className="status-icon info" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusClass = () => {
    switch (estimate.status) {
      case 'accepted':
        return 'status-success';
      case 'rejected':
        return 'status-danger';
      case 'expired':
        return 'status-warning';
      case 'converted':
        return 'status-info';
      default:
        return 'status-pending';
    }
  };

  const isExpired = () => {
    return new Date() > new Date(estimate.validTill);
  };

  const canAccept = () => {
    return userRole === 'customer' && 
           (estimate.status === 'sent' || estimate.status === 'viewed') && 
           !isExpired();
  };

  const canReject = () => {
    return userRole === 'customer' && 
           estimate.status !== 'accepted' && 
           estimate.status !== 'converted' && 
           estimate.status !== 'rejected';
  };

  const canEdit = () => {
    return userRole === 'trader' && 
           estimate.status !== 'accepted' && 
           estimate.status !== 'converted';
  };

  const canDelete = () => {
    return userRole === 'trader' && 
           estimate.status !== 'accepted' && 
           estimate.status !== 'converted';
  };

  const canConvert = () => {
    return userRole === 'trader' && estimate.status === 'accepted';
  };

  return (
    <Card className="estimate-card" hover>
      <div className="estimate-header">
        <div className="estimate-id">
          <span className="id-label">#{estimate.estimateId}</span>
          <div className={`status-badge ${getStatusClass()}`}>
            {getStatusIcon()}
            <span>{estimate.status}</span>
          </div>
        </div>
        <div className="estimate-amount">
          ₹{estimate.totalAmount?.toFixed(2)}
        </div>
      </div>

      <div className="estimate-content">
        <div className="customer-info">
          <div className="info-item">
            <User className="info-icon" />
            <span>{estimate.customerInfo?.name}</span>
          </div>
          <div className="info-item">
            <Phone className="info-icon" />
            <span>{estimate.customerInfo?.phone}</span>
          </div>
        </div>

        <div className="estimate-details">
          <div className="detail-item">
            <span className="detail-label">Items:</span>
            <span className="detail-value">{estimate.items?.length} items</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {new Date(estimate.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Valid Till:</span>
            <span className={`detail-value ${isExpired() ? 'expired' : ''}`}>
              <Calendar className="detail-icon" />
              {new Date(estimate.validTill).toLocaleDateString()}
            </span>
          </div>
        </div>

        {estimate.items && estimate.items.length > 0 && (
          <div className="items-preview">
            <h4>Items:</h4>
            <div className="items-list">
              {estimate.items.slice(0, 3).map((item, index) => (
                <div key={index} className="item-preview">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
              {estimate.items.length > 3 && (
                <div className="more-items">
                  +{estimate.items.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="estimate-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(estimate)}
          >
            View Details
          </Button>

          {userRole === 'trader' && (
            <>
              {canEdit() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(estimate)}
                >
                  Edit
                </Button>
              )}
              {canConvert() && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onConvertToInvoice(estimate)}
                >
                  Create Invoice
                </Button>
              )}
              {canDelete() && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(estimate)}
                >
                  Delete
                </Button>
              )}
            </>
          )}

          {userRole === 'customer' && (
            <>
              {canAccept() && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onAccept(estimate)}
                >
                  Accept
                </Button>
              )}
              {canReject() && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onReject(estimate)}
                >
                  Reject
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default EstimateCard;
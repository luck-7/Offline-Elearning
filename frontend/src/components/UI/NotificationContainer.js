import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './NotificationContainer.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, onClose }) => {
  const { type, title, message, autoClose } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-x-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
      default:
        return 'bi-info-circle-fill';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };

  return (
    <div className={`notification ${getTypeClass()} notification-enter`}>
      <div className="notification-content">
        <div className="notification-icon">
          <i className={`bi ${getIcon()}`}></i>
        </div>
        <div className="notification-text">
          {title && <div className="notification-title">{title}</div>}
          <div className="notification-message">{message}</div>
        </div>
        <button 
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
      {autoClose && (
        <div className="notification-progress">
          <div className="notification-progress-bar"></div>
        </div>
      )}
    </div>
  );
};

export default NotificationContainer;

import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Warning, Info, X } from 'phosphor-react';

const toastConfig = {
  duration: 4000,
  position: 'top-right',
  style: {
    padding: '0',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
};

const ToastContent = ({ icon: Icon, message, color, t }) => (
  <div className={`
    group flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-xl 
    shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 pr-3 min-w-[320px] border border-gray-100/50
    animate-enter transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
    ${color === 'success' && 'bg-gradient-to-r from-green-50/90 to-white/95'}
    ${color === 'error' && 'bg-gradient-to-r from-red-50/90 to-white/95'}
    ${color === 'info' && 'bg-gradient-to-r from-blue-50/90 to-white/95'}
  `}>
    <div className={`
      rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110
      ${color === 'success' && 'bg-green-100/80 text-green-600'}
      ${color === 'error' && 'bg-red-100/80 text-red-600'}
      ${color === 'info' && 'bg-blue-100/80 text-blue-600'}
    `}>
      <Icon weight="fill" className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate pr-2">{message}</p>
      <p className={`
        text-xs mt-0.5 transition-all duration-300
        ${color === 'success' && 'text-green-600/80'}
        ${color === 'error' && 'text-red-600/80'}
        ${color === 'info' && 'text-blue-600/80'}
      `}>
        {color === 'success' && 'Completed successfully'}
        {color === 'error' && 'Action failed'}
        {color === 'info' && 'Information'}
      </p>
    </div>
    <button
      onClick={() => toast.dismiss(t.id)}
      className={`
        rounded-lg p-1.5 transition-all duration-300
        ${color === 'success' && 'hover:bg-green-100/50 text-green-600/50 hover:text-green-600'}
        ${color === 'error' && 'hover:bg-red-100/50 text-red-600/50 hover:text-red-600'}
        ${color === 'info' && 'hover:bg-blue-100/50 text-blue-600/50 hover:text-blue-600'}
      `}
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

const LoadingContent = ({ message }) => (
  <div className="
    flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-xl 
    shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 pr-3 min-w-[320px] border border-gray-100/50
    bg-gradient-to-r from-blue-50/90 to-white/95 animate-enter
  ">
    <div className="rounded-xl p-2.5 bg-blue-100/80">
      <div className="w-5 h-5 border-[2.5px] border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate pr-2">{message}</p>
      <p className="text-xs mt-0.5 text-blue-600/80">Processing...</p>
    </div>
  </div>
);

// Add these styles to your global CSS or Tailwind config
const styles = `
  @keyframes enter {
    0% {
      transform: scale(0.9);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes leave {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      opacity: 0;
    }
  }

  .animate-enter {
    animation: enter 0.35s ease-out;
  }

  .animate-leave {
    animation: leave 0.35s ease-in forwards;
  }
`;

export const showToast = {
  success: (message) =>
    toast.custom(
      (t) => (
        <ToastContent
          icon={CheckCircle}
          message={message}
          color="success"
          t={t}
        />
      ),
      {
        ...toastConfig,
      }
    ),

  error: (message) =>
    toast.custom(
      (t) => (
        <ToastContent
          icon={Warning}
          message={message}
          color="error"
          t={t}
        />
      ),
      {
        ...toastConfig,
      }
    ),

  info: (message) =>
    toast.custom(
      (t) => (
        <ToastContent
          icon={Info}
          message={message}
          color="info"
          t={t}
        />
      ),
      {
        ...toastConfig,
      }
    ),

  promise: (promise, messages) =>
    toast.promise(
      promise,
      {
        loading: <LoadingContent message={messages.loading} />,
        success: (
          <ToastContent
            icon={CheckCircle}
            message={messages.success}
            color="success"
          />
        ),
        error: (
          <ToastContent
            icon={Warning}
            message={messages.error}
            color="error"
          />
        ),
      },
      {
        ...toastConfig,
      }
    ),
}; 
import toast from 'react-hot-toast';
import { CheckCircle, Warning, Info, X } from 'phosphor-react';

const toastConfig = {
  duration: 4000,
  position: 'top-right',
};

export const showToast = {
  success: (message) =>
    toast.success(
      (t) => (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-auto rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ),
      {
        ...toastConfig,
        className: 'toast-custom',
      }
    ),

  error: (message) =>
    toast.error(
      (t) => (
        <div className="flex items-center gap-2">
          <Warning className="w-5 h-5 text-red-500" weight="fill" />
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-auto rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ),
      {
        ...toastConfig,
        className: 'toast-custom',
      }
    ),

  info: (message) =>
    toast(
      (t) => (
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" weight="fill" />
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-auto rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ),
      {
        ...toastConfig,
        className: 'toast-custom',
      }
    ),

  promise: (promise, messages) =>
    toast.promise(
      promise,
      {
        loading: (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">{messages.loading}</p>
          </div>
        ),
        success: (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
            <p className="text-sm font-medium">{messages.success}</p>
          </div>
        ),
        error: (
          <div className="flex items-center gap-2">
            <Warning className="w-5 h-5 text-red-500" weight="fill" />
            <p className="text-sm font-medium">{messages.error}</p>
          </div>
        ),
      },
      {
        ...toastConfig,
        className: 'toast-custom',
      }
    ),
}; 
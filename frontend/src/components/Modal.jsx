export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-11/12 max-w-md p-6 relative">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

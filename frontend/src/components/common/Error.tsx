interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function Error({ message = 'Đã xảy ra lỗi', onRetry }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-text-muted mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}


interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'white';
}

export default function Loading({
  text = "Yuklanmoqda...",
  fullScreen = false,
  size = 'md',
  color = 'blue'
}: LoadingProps) {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-14 w-14 border-4',
  };

  const colors = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    white: 'border-white',
  };

  const spinner = (
    <div className={`animate-spin ${sizes[size]} ${colors[color]} border-t-transparent rounded-full`}></div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {spinner}
          {text && <p className="text-gray-500 mt-4">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {spinner}
      {text && <p className="text-gray-500 mt-4">{text}</p>}
    </div>
  );
}
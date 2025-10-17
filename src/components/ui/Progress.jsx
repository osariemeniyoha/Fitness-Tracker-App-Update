export const Progress = ({ value, className }) => {
  const progress = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`w-full bg-gray-700 rounded-full h-3 ${className}`}>
      <div
        className="bg-green-500 h-3 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

import { FiLoader } from "react-icons/fi";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block">
          <FiLoader className="text-4xl text-indigo-600 animate-spin" />
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}

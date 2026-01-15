import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { FiSend, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function CommentForm({ postId, onCommentAdded }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : "",
    email: user?.email || "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await API.post("comments/", {
        post: postId,
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      setSuccess(true);
      setFormData({
        name: user ? `${user.first_name} ${user.last_name}` : "",
        email: user?.email || "",
        message: "",
      });

      setTimeout(() => {
        setSuccess(false);
        if (onCommentAdded) onCommentAdded();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to post comment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Leave a Comment
      </h3>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
          <FiCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">
            Comment posted! It will appear after approval.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              required
              disabled={isAuthenticated}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              required
              disabled={isAuthenticated}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Share your thoughts..."
            rows="5"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span>{loading ? "Posting..." : "Post Comment"}</span>
          {!loading && <FiSend />}
        </button>
      </form>

      {!isAuthenticated && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Guest comments require moderation before appearing
        </p>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import API, { BASE_URL } from "../api/axios";
import { FiHeart, FiMessageSquare } from "react-icons/fi";

export default function CommentsList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await API.get("comments/", {
        params: { post: postId, approved: true },
      });
      // Handle both array and paginated response
      const commentData = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      setComments(commentData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading comments...</div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            {comment.author_image ? (
              <img
                src={`${BASE_URL}${comment.author_image}`}
                alt={comment.author_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                {comment.author_name[0]}
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {comment.author_name}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {comment.message}
          </p>

          {/* Footer */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium">
              <FiHeart className="w-4 h-4" />
              <span>{comment.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
              <FiCornerDownRight className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 pl-4 border-l-2 border-gray-200 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    {reply.author_image ? (
                      <img
                        src={`${BASE_URL}${reply.author_image}`}
                        alt={reply.author_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-white font-bold text-xs">
                        {reply.author_name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {reply.author_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reply.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{reply.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

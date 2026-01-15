import { Link } from "react-router-dom";
import { BASE_URL } from "../../api/axios";
import { FiHeart, FiMessageCircle, FiEye } from "react-icons/fi";

export default function PostCard({ post }) {
  const imageUrl = post.featured_image
    ? `${BASE_URL}${post.featured_image}`
    : null;

  return (
    <Link
      to={`/post/${post.id}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {post.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
              {post.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {post.title}
        </h3>

        {/* Author & Date */}
        {post.author && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {post.author.first_name[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">
                {post.author.first_name}
              </p>
              <p className="text-xs text-gray-500">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {post.content?.substring(0, 100) + "..."}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-gray-500 text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 hover:text-indigo-600 transition-colors">
              <FiEye size={16} />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-red-600 transition-colors">
              <FiHeart size={16} />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
              <FiMessageCircle size={16} />
              <span>{post.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

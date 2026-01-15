import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API, { BASE_URL } from "../api/axios";
import { FiArrowLeft, FiHeart, FiShare2, FiEye } from "react-icons/fi";
import Loader from "../components/common/Loader";
import CommentsList from "../components/CommentsList";
import CommentForm from "../components/CommentForm";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await API.get(`posts/${id}/`);
      setPost(res.data);
      setLiked(res.data.user_liked);

      // Increment views
      await API.post(`posts/${id}/increment_views/`);

      // Fetch related posts
      const relatedRes = await API.get(`posts/${id}/related/`);
      const relatedData = Array.isArray(relatedRes.data)
        ? relatedRes.data
        : relatedRes.data?.results || [];
      setRelatedPosts(relatedData);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await API.delete(`posts/${id}/like/`);
      } else {
        await API.post(`posts/${id}/like/`);
      }
      setLiked(!liked);
      fetchPost(); // Refresh to get updated count
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const title = post?.title;

    if (navigator.share) {
      navigator.share({
        title,
        url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) return <Loader />;

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-white">
      {/* Back Button */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <FiArrowLeft />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          {post.category && (
            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                {post.category.name}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            {post.author && (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                  {post.author.first_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {post.author.first_name} {post.author.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={`${BASE_URL}${post.featured_image}`}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {post.content && (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-gray-200">
            {post.tags.map((tag) => (
              <a
                key={tag.id}
                href={`/?tag=${tag.slug}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                #{tag.name}
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between py-8 border-b border-gray-200 mb-12">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <FiEye className="w-5 h-5" />
              <span>{post.views} views</span>
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                liked
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FiHeart className={liked ? "fill-current" : ""} />
              <span>{post.likes} likes</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              <FiShare2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Comments</h2>
          <CommentForm postId={id} onCommentAdded={fetchPost} />
          <CommentsList postId={id} />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-12 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((relPost) => (
                <a
                  key={relPost.id}
                  href={`/post/${relPost.id}`}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {relPost.featured_image && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={`${BASE_URL}${relPost.featured_image}`}
                        alt={relPost.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relPost.content?.substring(0, 100)}...
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { BASE_URL } from "../api/axios";
import PostCard from "../components/posts/PostCard";
import { FiArrowRight, FiStar } from "react-icons/fi";
import Loader from "../components/common/Loader";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured posts
      const featuredRes = await API.get("posts/featured/");
      if (featuredRes.data && featuredRes.data.length > 0) {
        setFeatured(featuredRes.data[0]);
      }

      // Fetch recent published posts
      const postsRes = await API.get("posts/published/");
      const allPostsData = Array.isArray(postsRes.data)
        ? postsRes.data
        : postsRes.data?.results || [];
      setPosts(allPostsData.slice(0, 9));

      // Fetch categories
      const categoriesRes = await API.get("categories/");
      const categoriesData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.results || [];
      setCategories(categoriesData.slice(0, 6));

      // Fetch trending posts
      const trendingRes = await API.get("posts/trending/");
      const trendingData = Array.isArray(trendingRes.data)
        ? trendingRes.data
        : trendingRes.data?.results || [];
      setTrending(trendingData.slice(0, 5));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-white">
      {/* Hero Section with Featured Post */}
      {featured && (
        <section className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-6">
                  <FiStar size={16} />
                  <span className="text-sm font-semibold">
                    Featured Article
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {featured.title}
                </h1>
                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                  {featured.seo_description ||
                    featured.content?.substring(0, 150) + "..."}
                </p>
                <div className="flex items-center space-x-4 mb-8">
                  {featured.author && (
                    <>
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                        {featured.author.first_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {featured.author.first_name}{" "}
                          {featured.author.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {featured.published_at
                            ? new Date(
                                featured.published_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Link
                  to={`/post/${featured.id}`}
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  <span>Read Article</span>
                  <FiArrowRight />
                </Link>
              </div>

              {/* Image */}
              {featured.featured_image && (
                <div className="relative h-96 md:h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-2xl blur-2xl opacity-20"></div>
                  <img
                    src={`${BASE_URL}${featured.featured_image}`}
                    alt={featured.title}
                    className="relative w-full h-full object-cover rounded-2xl shadow-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?category=${cat.slug}`}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all text-center group"
                >
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {cat.posts_count} posts
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Latest Articles
            </h2>
            <p className="text-gray-600">
              Discover the latest insights and stories from our writers
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts found</p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/posts"
                className="inline-flex items-center space-x-2 px-8 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
              >
                <span>View All Articles</span>
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">
              🔥 Trending Now
            </h2>
            <div className="space-y-4">
              {trending.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {post.views} views
                      </span>
                      <span className="text-sm text-gray-500">
                        {post.likes} likes
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Get the latest articles delivered to your inbox. Subscribe to our
            newsletter and never miss a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:shadow-lg transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

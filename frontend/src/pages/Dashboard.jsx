import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import {
  FiFileText,
  FiUsers,
  FiMessageSquare,
  FiMail,
  FiEye,
  FiThumbsUp,
  FiAlertCircle,
} from "react-icons/fi";
import Loader from "../components/common/Loader";

function StatCard({ title, value, icon: Icon, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "admin" && !user?.is_staff)) {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const analyticsRes = await API.get("analytics/overview/");
      setAnalytics(analyticsRes.data);

      const commentsRes = await API.get("analytics/comments_pending/");
      const commentsData = Array.isArray(commentsRes.data)
        ? commentsRes.data
        : commentsRes.data?.results || [];
      setPendingComments(commentsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.first_name}! Here's an overview of your site.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            value={analytics.total_posts}
            icon={FiFileText}
            color="indigo"
          />
          <StatCard
            title="Published"
            value={analytics.published_posts}
            icon={FiEye}
            color="green"
          />
          <StatCard
            title="Draft"
            value={analytics.draft_posts}
            icon={FiFileText}
            color="yellow"
          />
          <StatCard
            title="Scheduled"
            value={analytics.scheduled_posts}
            icon={FiFileText}
            color="purple"
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analytics.total_users}
            icon={FiUsers}
            color="blue"
          />
          <StatCard
            title="Total Comments"
            value={analytics.total_comments}
            icon={FiMessageSquare}
            color="indigo"
          />
          <StatCard
            title="Pending Approval"
            value={analytics.pending_comments}
            icon={FiAlertCircle}
            color="yellow"
          />
          <StatCard
            title="Newsletter Subs"
            value={analytics.newsletter_subscribers}
            icon={FiMail}
            color="green"
          />
        </div>

        {/* Third Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <StatCard
            title="Spam Comments"
            value={analytics.spam_comments}
            icon={FiAlertCircle}
            color="red"
          />
          <StatCard
            title="Total Likes"
            value={analytics.total_views}
            icon={FiThumbsUp}
            color="blue"
          />
        </div>

        {/* Pending Comments Section */}
        {pendingComments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FiAlertCircle className="w-6 h-6 text-yellow-600" />
              <span>Pending Comments ({pendingComments.length})</span>
            </h2>

            <div className="space-y-4">
              {pendingComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {comment.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        on "{comment.post__title}"
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{comment.message}</p>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingComments.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Pending Comments
            </h3>
            <p className="text-gray-600">
              All comments have been reviewed and approved!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

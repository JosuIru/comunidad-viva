import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Post {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  createdAt: string;
  thanksCount: number;
  commentsCount: number;
  sharesCount: number;
}

export default function Feed() {
  const { data: posts, isLoading } = useQuery<{ data: Post[] }>({
    queryKey: ['feed'],
    queryFn: () => api.get('/social/feed'),
  });

  if (isLoading) {
    return <div className="text-center py-8">Cargando feed...</div>;
  }

  return (
    <div className="space-y-4">
      {posts?.data?.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-gray-800 mb-4">{post.content}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <button className="hover:text-blue-600">
              👍 {post.thanksCount}
            </button>
            <button className="hover:text-blue-600">
              💬 {post.commentsCount}
            </button>
            <button className="hover:text-blue-600">
              🔄 {post.sharesCount}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Music, Video, Zap } from "lucide-react";
import { useGetPosts, useCreatePost, useLikePost, useGetMe, PostInputPostType } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

export default function CommunityPage() {
  const [content, setContent] = useState("");
  const { data: user } = useGetMe();
  const { data: posts, refetch } = useGetPosts();
  const createPost = useCreatePost();
  const likePost = useLikePost();

  const handlePost = () => {
    if (!content.trim()) return;
    createPost.mutate(
      { data: { content, postType: PostInputPostType.text } },
      { onSuccess: () => { setContent(""); refetch(); } }
    );
  };

  const handleLike = (postId: number) => {
    likePost.mutate({ postId }, { onSuccess: () => refetch() });
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-heading font-black text-white mb-2 flex items-center justify-center gap-3">
          <Zap className="w-8 h-8 text-primary fill-primary" />
          The Feed
        </h1>
        <p className="text-muted-foreground text-lg">Connect with artists, producers, and fans worldwide.</p>
      </div>

      {/* Composer */}
      {user && (
        <div className="glass p-4 sm:p-6 rounded-2xl mb-10 border border-white/10 shadow-xl shadow-primary/5">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12 border border-white/10">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in your studio?" 
                className="w-full bg-transparent text-white text-lg resize-none focus:outline-none placeholder:text-white/30 min-h-[80px]"
              />
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20 hover:text-primary rounded-full">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20 hover:text-primary rounded-full">
                    <Music className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20 hover:text-primary rounded-full">
                    <Video className="w-5 h-5" />
                  </Button>
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 font-bold"
                  onClick={handlePost}
                  disabled={!content.trim() || createPost.isPending}
                >
                  {createPost.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {posts?.map(post => (
          <div key={post.id} className="glass p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.authorAvatarUrl || undefined} />
                  <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg hover:underline cursor-pointer">{post.authorName}</span>
                    {post.authorRole && (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-white/10 text-white/70">
                        {post.authorRole}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>

            <div className="pl-[60px]">
              <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap mb-4">
                {post.content}
              </p>

              {post.mediaUrl && (
                <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img src={post.mediaUrl} alt="Post media" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
              )}

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                <button 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors group ${post.likedByMe ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
                  onClick={() => handleLike(post.id)}
                >
                  <div className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-colors ${post.likedByMe ? 'bg-pink-500/10' : ''}`}>
                    <Heart className={`w-5 h-5 ${post.likedByMe ? 'fill-pink-500' : ''}`} />
                  </div>
                  {post.likes}
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-blue-400 transition-colors group">
                  <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  {post.commentsCount}
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-green-400 transition-colors group ml-auto">
                  <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}

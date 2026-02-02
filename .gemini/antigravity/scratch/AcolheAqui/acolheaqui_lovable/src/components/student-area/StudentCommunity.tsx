import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageCircle,
  Send,
  Pin,
  MoreHorizontal,
  Trash2,
  Users,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  isPinned: boolean;
  likesCount: number;
  createdAt: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  isLikedByUser: boolean;
}

interface StudentCommunityProps {
  professionalId: string;
  professionalName: string;
}

const StudentCommunity = ({ professionalId, professionalName }: StudentCommunityProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
  }, [professionalId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: postsData, error } = await supabase
        .from("member_community_posts")
        .select("*")
        .eq("professional_id", professionalId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user info for each post
      const userIds = [...new Set((postsData || []).map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Get likes for current user
      const { data: userLikes } = await supabase
        .from("member_community_likes")
        .select("post_id")
        .eq("user_id", user?.id || "");

      const likedPostIds = new Set((userLikes || []).map(l => l.post_id));

      const formattedPosts: Post[] = (postsData || []).map(post => {
        const profile = profiles?.find(p => p.user_id === post.user_id);
        return {
          id: post.id,
          content: post.content,
          isPinned: post.is_pinned || false,
          likesCount: post.likes_count || 0,
          createdAt: post.created_at,
          userId: post.user_id,
          userName: profile?.full_name || "Usuário",
          userAvatar: profile?.avatar_url || null,
          isLikedByUser: likedPostIds.has(post.id),
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("member_community_posts")
        .insert({
          professional_id: professionalId,
          user_id: user.id,
          content: newPost.trim(),
        });

      if (error) throw error;

      setNewPost("");
      fetchPosts();
      toast({
        title: "Publicado!",
        description: "Sua mensagem foi enviada para a comunidade.",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar sua mensagem.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isLiked) {
        await supabase
          .from("member_community_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("member_community_likes")
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update likes count
      const newCount = isLiked ? -1 : 1;
      await supabase
        .from("member_community_posts")
        .update({ likes_count: posts.find(p => p.id === postId)!.likesCount + newCount })
        .eq("id", postId);

      fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("member_community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      fetchPosts();
      toast({
        title: "Excluído",
        description: "Sua publicação foi removida.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">Comunidade</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Comunidade de {professionalName}
        </h1>
        <p className="text-gray-400">
          Compartilhe experiências e conecte-se com outros alunos
        </p>
      </div>

      {/* New Post Form */}
      <Card className="bg-gray-900/50 border-gray-800 p-4 mb-6">
        <Textarea
          placeholder="Compartilhe algo com a comunidade..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="bg-gray-800/50 border-gray-700 min-h-[100px] resize-none mb-3"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitPost}
            disabled={!newPost.trim() || submitting}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Publicar
          </Button>
        </div>
      </Card>

      <Separator className="bg-gray-800 my-6" />

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Seja o primeiro a publicar!
          </h3>
          <p className="text-sm text-gray-500">
            Compartilhe sua experiência com a comunidade.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={cn(
                "bg-gray-900/30 border-gray-800 p-4 transition-all hover:bg-gray-900/50",
                post.isPinned && "border-primary/30 bg-primary/5"
              )}
            >
              {post.isPinned && (
                <div className="flex items-center gap-1.5 text-primary text-xs mb-3">
                  <Pin className="w-3 h-3" />
                  <span>Fixado</span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.userAvatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {post.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">
                        {post.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>

                    {currentUserId === post.userId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                          <DropdownMenuItem
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-400 focus:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(post.id, post.isLikedByUser)}
                      className={cn(
                        "flex items-center gap-1.5 text-sm transition-colors",
                        post.isLikedByUser
                          ? "text-red-400"
                          : "text-gray-500 hover:text-red-400"
                      )}
                    >
                      <Heart
                        className={cn("w-4 h-4", post.isLikedByUser && "fill-current")}
                      />
                      <span>{post.likesCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCommunity;

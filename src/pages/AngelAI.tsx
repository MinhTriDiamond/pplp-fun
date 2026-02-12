import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FunNavbar } from '@/components/layout/FunNavbar';
import { useAngelChat } from '@/hooks/useAngelChat';
import { useAiMemory } from '@/hooks/useAiMemory';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Plus, Sparkles, Brain, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AngelAI() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { messages, isLoading, sendMessage, newChat, conversations, loadConversations, loadConversation } = useAngelChat('general');
  const { memories, loading: memLoading, fetchMemories, deleteMemory } = useAiMemory();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    fetchMemories();
  }, [loadConversations, fetchMemories]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FunNavbar />
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-gradient-spiritual flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Angel AI</h1>
            <p className="text-sm text-muted-foreground">Trợ lý AI yêu thương của FUN Ecosystem</p>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chat" className="gap-1.5">
              <MessageSquare className="h-4 w-4" /> Chat
            </TabsTrigger>
            <TabsTrigger value="memory" className="gap-1.5">
              <Brain className="h-4 w-4" /> Memory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Sidebar: conversations */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Hội thoại</CardTitle>
                    <Button variant="ghost" size="icon" onClick={newChat} title="Chat mới">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[400px]">
                    {conversations.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Chưa có hội thoại nào</p>
                    ) : (
                      conversations.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => loadConversation(c.id)}
                          className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors truncate"
                        >
                          {c.title}
                        </button>
                      ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Main chat area */}
              <Card className="md:col-span-3 flex flex-col">
                <CardContent className="flex-1 flex flex-col p-4">
                  <ScrollArea className="flex-1 h-[450px] pr-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <div className="h-16 w-16 rounded-full bg-gradient-spiritual flex items-center justify-center mb-4 animate-pulse-slow">
                          <Sparkles className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Xin chào! Con là Angel AI 🙏</h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                          Con ở đây để giúp bạn khám phá FUN Ecosystem. Hãy hỏi con bất cứ điều gì về Profile, Wallet, Academy, hoặc các module khác nhé!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                              <Avatar className="h-7 w-7 mt-1">
                                <AvatarFallback className="bg-gradient-spiritual text-primary-foreground text-xs">AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}>
                              {msg.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                              ) : (
                                msg.content
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                          <div className="flex gap-3">
                            <Avatar className="h-7 w-7 mt-1">
                              <AvatarFallback className="bg-gradient-spiritual text-primary-foreground text-xs">AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-secondary rounded-xl px-4 py-2.5">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Nhắn tin cho Angel AI..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5" /> AI Memory
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Angel AI ghi nhớ những thông tin bạn chia sẻ. Bạn có toàn quyền xem và xóa.
                </p>
              </CardHeader>
              <CardContent>
                {memLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : memories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có memory nào. Angel AI sẽ ghi nhớ khi bạn trò chuyện. 🧠
                  </p>
                ) : (
                  <div className="space-y-2">
                    {memories.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{m.key}</span>
                            <Badge variant="secondary" className="text-[10px]">{m.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{m.value}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteMemory(m.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

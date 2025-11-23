'use client';

import { useEffect, useRef, useState } from 'react';
import { Conversation, Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { MoreVertical, Phone, Video, Search, Send, Archive, Trash2, Paperclip, X, FileIcon, ImageIcon, Smile, ArrowLeft } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { IKContext, IKUpload } from 'imagekitio-react';
import Image from 'next/image';

interface ChatWindowProps {
    conversation: Conversation;
    messages: Message[];
    currentUserId: string;
    onSendMessage: (content: string, attachments?: { url: string; type: 'image' | 'video' | 'file'; name: string }[], replyToId?: string) => void;
    loading: boolean;
    onDeleteMessage: (messageId: string) => void;
    onArchiveConversation: (conversationId: string) => void;
    onTyping?: (isTyping: boolean) => void;
    isOnline?: boolean;
    isTyping?: boolean;
    onBack?: () => void;
    onReply?: (message: Message) => void;
    onUnarchiveConversation?: (conversationId: string) => void;
    isArchived?: boolean;
}

export function ChatWindow({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
    loading,
    onDeleteMessage,
    onArchiveConversation,
    onTyping,
    isOnline,
    isTyping,
    onBack,
    onReply,
    onUnarchiveConversation,
    isArchived
}: ChatWindowProps) {
    const { toast } = useToast();
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [attachments, setAttachments] = useState<{ url: string; type: 'image' | 'video' | 'file'; name: string }[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const ikUploadRef = useRef<HTMLInputElement>(null);

    const otherName = conversation.requesterId === currentUserId ? conversation.receiverName : conversation.requesterName;
    const otherInstitution = conversation.requesterId === currentUserId ? conversation.receiverInstitution : conversation.requesterInstitution;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, attachments]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && attachments.length === 0) return;

        onSendMessage(newMessage, attachments, replyingTo?._id);
        setNewMessage('');
        setAttachments([]);
        setReplyingTo(null);
        // Notify stop typing when message sent
        if (onTyping) onTyping(false);
    };

    const onError = (err: any) => {
        console.log("Error", err);
        setIsUploading(false);
        toast({
            title: 'Error',
            description: 'Failed to upload file',
            variant: 'destructive',
        });
    };

    const onSuccess = (res: any) => {
        console.log("Success", res);
        setIsUploading(false);
        setAttachments(prev => [...prev, {
            url: res.url,
            type: res.fileType === 'image' ? 'image' : 'file',
            name: res.name
        }]);
    };

    const onUploadStart = () => {
        // Validate file size before uploading
        const file = ikUploadRef.current?.files?.[0];
        if (file && file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'File size exceeds 5MB limit',
                variant: 'destructive',
            });
            setIsUploading(false);
            return;
        }
        setIsUploading(true);
    };

    return (
        <IKContext
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            authenticationEndpoint="/api/imagekit/auth"
        >
            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {otherName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm flex items-center">
                                {otherName}

                            </h2>
                            <p className="text-xs text-muted-foreground">{otherInstitution}</p>
                            {isTyping && <p className="text-xs text-muted-foreground">Typing...</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {showSearch ? (
                            <div className="flex items-center gap-1 mr-2 animate-in fade-in slide-in-from-right-5 duration-200">
                                <Input
                                    placeholder="Search messages..."
                                    className="h-9 w-48 bg-muted/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => setShowSearch(true)}
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isArchived ? (
                                    <DropdownMenuItem onClick={() => onUnarchiveConversation?.(conversation.collaborationId)}>
                                        <Archive className="mr-2 h-4 w-4" />
                                        Unarchive Chat
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => onArchiveConversation(conversation.collaborationId)}>
                                        <Archive className="mr-2 h-4 w-4" />
                                        Archive Chat
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gradient-to-b from-muted/5 to-background">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                                    <Skeleton className="h-16 w-72 rounded-2xl" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {messages
                                .filter(m => !searchQuery || (m.content && m.content.toLowerCase().includes(searchQuery.toLowerCase())))
                                .map((message, index, arr) => {
                                    const isMe = message.senderId === currentUserId;
                                    const prevMessage = index > 0 ? arr[index - 1] : null;
                                    const nextMessage = index < arr.length - 1 ? arr[index + 1] : null;

                                    const safeDate = (dateString: string | Date) => {
                                        try {
                                            const date = new Date(dateString);
                                            return isNaN(date.getTime()) ? new Date() : date;
                                        } catch {
                                            return new Date();
                                        }
                                    };

                                    const messageDate = safeDate(message.createdAt);
                                    const prevMessageDate = prevMessage ? safeDate(prevMessage.createdAt) : null;
                                    const nextMessageDate = nextMessage ? safeDate(nextMessage.createdAt) : null;

                                    const showDate = index === 0 ||
                                        (prevMessageDate && messageDate.toDateString() !== prevMessageDate.toDateString());

                                    // Group messages from same sender sent within 2 minutes
                                    const isGrouped = prevMessage &&
                                        prevMessage.senderId === message.senderId &&
                                        prevMessageDate &&
                                        (messageDate.getTime() - prevMessageDate.getTime()) < 120000;

                                    const isGroupEnd = !nextMessage ||
                                        nextMessage.senderId !== message.senderId ||
                                        (nextMessageDate && (nextMessageDate.getTime() - messageDate.getTime()) > 120000);

                                    return (
                                        <div key={message._id} className={isGrouped ? "" : "mt-4"}>
                                            {showDate && (
                                                <div className="flex justify-center py-4">
                                                    <span className="text-[11px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border/50">
                                                        {format(messageDate, 'MMMM d, yyyy')}
                                                    </span>
                                                </div>
                                            )}

                                            <div className={cn(
                                                "flex w-full",
                                                isMe ? "justify-end" : "justify-start"
                                            )}>
                                                <div className={cn(
                                                    "group relative max-w-[75%] px-3.5 py-2 text-[15px] leading-relaxed transition-all duration-200",
                                                    "hover:shadow-lg",
                                                    isMe ? (
                                                        cn(
                                                            "bg-primary text-primary-foreground",
                                                            isGroupEnd ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-lg",
                                                            "shadow-md"
                                                        )
                                                    ) : (
                                                        cn(
                                                            "bg-card border border-border/50",
                                                            isGroupEnd ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-lg",
                                                            "shadow-sm"
                                                        )
                                                    )
                                                )}>
                                                    {/* Attachments */}
                                                    {message.attachments && message.attachments.length > 0 && (
                                                        <div className="mb-2 space-y-2">
                                                            {message.attachments.map((att, i) => (
                                                                <div key={i} className="rounded-xl overflow-hidden shadow-sm">
                                                                    {att.type === 'image' ? (
                                                                        <div className="relative aspect-video w-full max-w-[320px]">
                                                                            <Image
                                                                                src={att.url}
                                                                                alt="Attachment"
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <a
                                                                            href={att.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2 p-2.5 bg-background/10 rounded-lg hover:bg-background/20 transition-colors"
                                                                        >
                                                                            <FileIcon className="h-4 w-4" />
                                                                            <span className="underline truncate max-w-[200px] text-sm">{att.name}</span>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {message.content && (
                                                        <p className="break-words">{message.content}</p>
                                                    )}

                                                    <div className={cn(
                                                        "flex items-center justify-end gap-1.5 mt-1 -mb-0.5",
                                                        isMe ? "text-primary-foreground/60" : "text-muted-foreground/60"
                                                    )}>
                                                        <span className="text-[10px] font-medium">
                                                            {format(messageDate, 'h:mm a')}
                                                        </span>
                                                        {isMe && (
                                                            <span className="flex items-center" title={message.status}>
                                                                {message.status === 'read' ? (
                                                                    <div className="flex">
                                                                        <svg className="h-3.5 w-3.5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                                                        </svg>
                                                                        <svg className="h-3.5 w-3.5 text-blue-300 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                                                        </svg>
                                                                    </div>
                                                                ) : message.status === 'delivered' ? (
                                                                    <div className="flex">
                                                                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                                                        </svg>
                                                                        <svg className="h-3.5 w-3.5 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                                                    </svg>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Hover Actions */}
                                                    <div className={cn(
                                                        "absolute top-0 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-full bg-background shadow-sm border border-border/50",
                                                        isMe ? "left-0 -translate-x-full mr-2" : "right-0 translate-x-full ml-2"
                                                    )}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-full hover:bg-muted"
                                                            onClick={() => {
                                                                setReplyingTo(message);
                                                                if (onReply) onReply(message);
                                                            }}
                                                        >
                                                            <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-card border-t space-y-4">
                    {/* Reply Banner */}
                    {replyingTo && (
                        <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border-l-4 border-primary mb-2">
                            <div className="flex flex-col text-sm">
                                <span className="font-semibold text-primary">Replying to {replyingTo.senderId === currentUserId ? 'yourself' : otherName}</span>
                                <span className="text-muted-foreground truncate max-w-[300px]">{replyingTo.content || 'Attachment'}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Attachment Preview */}
                    {attachments.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {attachments.map((att, i) => (
                                <div key={i} className="relative h-16 w-16 rounded-lg border bg-muted flex-shrink-0 overflow-hidden group">
                                    {att.type === 'image' ? (
                                        <Image src={att.url} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => ikUploadRef.current?.click()}
                                disabled={isUploading}
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <IKUpload
                                ref={ikUploadRef}
                                onError={onError}
                                onSuccess={onSuccess}
                                onUploadStart={onUploadStart}
                                className="hidden"
                            />
                        </div>

                        <Input
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                if (onTyping) onTyping(e.target.value.length > 0);
                            }}
                            placeholder={isUploading ? "Uploading..." : "Type a message..."}
                            className="flex-1 min-h-[44px] bg-muted/50 border-none focus-visible:ring-1 rounded-xl"
                            autoFocus
                            disabled={isUploading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
                            className="h-11 w-11 rounded-full shrink-0 shadow-md hover:shadow-lg transition-shadow"
                        >
                            <Send className="h-5 w-5" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </div>
        </IKContext>
    );
}

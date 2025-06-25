
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Youtube, LinkIcon, CheckCircle, XCircle, Loader2, AlertTriangle, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const CHANNEL_STORAGE_KEY_PREFIX = "autoTubeAI_youtubeChannel_";

interface ConnectedChannel {
  name: string;
  avatarUrl?: string;
  id: string;
}

export function ChannelConnection() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [connectedChannel, setConnectedChannel] = useState<ConnectedChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For connect/disconnect actions
  const [isComponentInitialized, setIsComponentInitialized] = useState(false);
  const { toast } = useToast();

  const getChannelStorageKey = useCallback(() => {
    if (!user) return null;
    return `${CHANNEL_STORAGE_KEY_PREFIX}${user.uid}`;
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      setIsComponentInitialized(false); // Wait for auth to settle
      setConnectedChannel(null); // Clear channel info while auth is loading
      return;
    }

    setIsComponentInitialized(true);

    if (typeof window !== 'undefined') {
      if (user) {
        const storageKey = getChannelStorageKey();
        if (storageKey) {
          const savedChannel = localStorage.getItem(storageKey);
          if (savedChannel) {
            try {
              setConnectedChannel(JSON.parse(savedChannel));
            } catch (e) {
              console.error("Failed to parse saved channel info:", e);
              localStorage.removeItem(storageKey);
              setConnectedChannel(null);
            }
          } else {
            setConnectedChannel(null); // Ensure it's null if nothing is saved for this user
          }
        }
      } else {
        setConnectedChannel(null); // Clear channel if user logs out or is not present
      }
    }
  }, [user, authLoading, getChannelStorageKey]);

  const handleConnect = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In", description: "Please log in to connect a channel." });
      return;
    }
    setIsLoading(true);
    // Simulate API call for OAuth
    setTimeout(() => {
      const mockChannel: ConnectedChannel = {
        name: `${user.displayName || 'User'}'s Awesome Channel`,
        avatarUrl: user.photoURL || "https://placehold.co/100x100.png",
        id: `UC-mock-${user.uid.substring(0, 10)}`,
      };
      setConnectedChannel(mockChannel);
      const storageKey = getChannelStorageKey();
      if (typeof window !== 'undefined' && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(mockChannel));
      }
      toast({
        title: "Channel Connected!",
        description: `Successfully connected to ${mockChannel.name}. (Mock connection)`,
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    const channelName = connectedChannel?.name;
    setConnectedChannel(null);
    const storageKey = getChannelStorageKey();
    if (typeof window !== 'undefined' && storageKey) {
      localStorage.removeItem(storageKey);
    }
    toast({
      title: "Channel Disconnected",
      description: `${channelName || 'Channel'} has been disconnected.`,
      variant: "default",
    });
    setIsLoading(false);
  };

  if (!isComponentInitialized || authLoading) {
    return (
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Youtube className="h-7 w-7 text-red-600" /> YouTube Channel
          </CardTitle>
          <CardDescription>
            Loading channel connection status...
          </CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Youtube className="h-7 w-7 text-red-600" /> YouTube Channel
          </CardTitle>
          <CardDescription>
            Connect your YouTube channel to enable features.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 p-6 border border-dashed rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/70" />
          <p className="text-muted-foreground">You need to be logged in to connect a YouTube channel.</p>
          <Button onClick={signInWithGoogle} className="w-full md:w-auto">
            <LogIn className="mr-2 h-5 w-5" /> Login to Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Youtube className="h-7 w-7 text-red-600" /> YouTube Channel
        </CardTitle>
        <CardDescription>
          Connect your YouTube channel to enable automatic video uploads and scheduling. (Mock Feature)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connectedChannel ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/50">
              <Avatar className="h-16 w-16">
                <AvatarImage src={connectedChannel.avatarUrl || undefined} alt={connectedChannel.name} data-ai-hint="channel avatar"/>
                <AvatarFallback>{connectedChannel.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{connectedChannel.name}</p>
                <p className="text-sm text-muted-foreground">Channel ID: {connectedChannel.id}</p>
                <div className="mt-1 flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Connected (Mock)</span>
                </div>
              </div>
            </div>
            <Button onClick={handleDisconnect} variant="destructive" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Disconnect Channel
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4 p-6 border border-dashed rounded-lg">
            <XCircle className="mx-auto h-12 w-12 text-muted-foreground/70" />
            <p className="text-muted-foreground">No YouTube channel connected.</p>
            <Button onClick={handleConnect} className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-5 w-5" />
                  Connect YouTube Channel (Mock)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


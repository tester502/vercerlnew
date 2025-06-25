
"use client"; // Required because ChannelConnection uses hooks

import { ChannelConnection } from "@/components/settings/ChannelConnection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-2 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your YouTube channel connection and application preferences.
        </p>
      </div>

      <ChannelConnection />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Cog className="h-6 w-6 text-primary" /> Application Preferences
          </CardTitle>
          <CardDescription>
            Configure other application settings here. (Placeholder)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future preferences like notification settings, default generation parameters, etc., will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

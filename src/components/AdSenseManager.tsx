import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdSense } from '@/hooks/useAdSense';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, Square } from "lucide-react";

export const AdSenseManager = () => {
  const { config, isEnabled, publisherId, enableAdSense, disableAdSense, updatePublisherId } = useAdSense();
  const { trackEvent } = useAnalytics();
  const [newPublisherId, setNewPublisherId] = useState(publisherId);

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      enableAdSense();
      trackEvent('adsense_enabled');
    } else {
      disableAdSense();
      trackEvent('adsense_disabled');
    }
  };

  const handleUpdatePublisher = () => {
    updatePublisherId(newPublisherId);
    trackEvent('adsense_publisher_updated');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Google AdSense
              <Badge variant={isEnabled ? "success" : "secondary"}>
                {isEnabled ? "Ativo" : "Inativo"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Configure os anúncios do Google AdSense para monetizar o site
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="adsense-toggle">
              {isEnabled ? <Play className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            </Label>
            <Switch
              id="adsense-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publisher-id">Publisher ID</Label>
            <div className="flex gap-2">
              <Input
                id="publisher-id"
                value={newPublisherId}
                onChange={(e) => setNewPublisherId(e.target.value)}
                placeholder="ca-pub-xxxxxxxxxxxxxxxx"
              />
              <Button onClick={handleUpdatePublisher} variant="outline">
                Atualizar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Seu Publisher ID do Google AdSense (exemplo: ca-pub-5627268083247418)
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Status do AdSense</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={isEnabled ? "success" : "secondary"}>
                  {isEnabled ? "Habilitado" : "Desabilitado"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Publisher ID:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {publisherId}
                </code>
              </div>
              <div className="flex justify-between">
                <span>Posições:</span>
                <span>Topo, Entre resultados, Rodapé</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Links Úteis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.google.com/adsense/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Painel AdSense
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://support.google.com/adsense/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Suporte AdSense
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
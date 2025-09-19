import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, TrendingUp, Clock, Activity } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useVisitorStats } from '@/hooks/useVisitorStats';
import { useEffect } from 'react';

export const UserStatsCard = () => {
  const { onlineUsers } = useUserPresence('admin-panel');
  const { stats, refreshStats } = useVisitorStats();

  useEffect(() => {
    // Refresh stats every minute
    const interval = setInterval(refreshStats, 60000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Online Users */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">{onlineUsers}</p>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  LIVE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Usuários Online</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Visitors */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.todayVisitors}</p>
              <p className="text-sm text-muted-foreground">Visitantes Hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Visitors */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalVisitors}</p>
              <p className="text-sm text-muted-foreground">Total de Sessões</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Views */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.pageViews}</p>
              <p className="text-sm text-muted-foreground">Visualizações</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Session Time */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                {stats.averageSessionTime > 0 ? `${stats.averageSessionTime}m` : '--'}
              </p>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
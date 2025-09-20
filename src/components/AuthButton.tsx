import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const AuthButton = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button
        onClick={signInWithGoogle}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </Button>
    );
  }

  const initials = user.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.user_metadata?.full_name && (
              <p className="font-medium">{user.user_metadata.full_name}</p>
            )}
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <User className="h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
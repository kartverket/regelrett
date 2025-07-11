import { Outlet, useNavigate } from 'react-router';
import { useMsal } from '@azure/msal-react';
import { msalInstance } from '../../api/msal';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ProtectedRoute() {
  const accounts = useMsal().accounts;
  const account = accounts[0];
  const navigate = useNavigate();

  return (
    <div className="bg-background pb-8 min-h-screen">
      <div className="bg-secondary flex flex-row justify-between">
        <header className="flex items-center  px-4 py-3 ">
          <div
            className="ml-2 cursor-pointer font-bold text-lg"
            onClick={() => navigate('/')}
          >
            <img src="/regelrettlogo.svg" alt="Regelrett Logo" />
          </div>
        </header>
        <div className="flex flex-row gap-2 items-center justify-end ">
          {account && (
            <div className="flex flex-row gap-2 items-center ">
              <UserCircle />
              <p>{account.name}</p>
            </div>
          )}
          <Button variant="ghost" onClick={() => msalInstance.logoutRedirect()}>
            <LogOut className="size-5" />
            Logg ut
          </Button>
        </div>
      </div>
      <Separator className="border-1" />
      <Outlet />
    </div>
  );
}

import { Outlet, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import KvLogo from "@/assets/kartverketlogo.svg";
import { LogOut, UserCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function ProtectedRoute() {
  const { data, isSuccess } = useUser();
  const navigate = useNavigate();

  return (
    <div className="bg-background pb-8 min-h-screen">
      <div className="bg-secondary flex flex-row justify-between">
        <header className="flex items-center  px-4 py-3 ">
          <div
            className="ml-2 cursor-pointer font-bold text-lg"
            onClick={() => navigate("/")}
          >
            <img src={KvLogo} alt="Kartverket logo" />
          </div>
        </header>
        <div className="flex flex-row gap-2 items-center justify-end ">
          {isSuccess && (
            <div className="flex flex-row gap-2 items-center ">
              <UserCircle />
              <p>{data.user.displayName}</p>
            </div>
          )}
          <Button variant="ghost" asChild>
            <a href="/logout">
              <LogOut className="size-5" />
              Logg ut
            </a>
          </Button>
        </div>
      </div>
      <Separator className="border-1" />
      <Outlet />
    </div>
  );
}
